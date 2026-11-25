// ERT Hub: create login accounts for everyone in members_import.csv
//
// Safe by default: without --go it only PRINTS what it would do.
//   Preview:  node --env-file=.env.local scripts/create-members.mjs
//   Create:   node --env-file=.env.local scripts/create-members.mjs --go
//
// Needs in .env.local:
//   NEXT_PUBLIC_SUPABASE_URL=...
//   SUPABASE_SERVICE_ROLE_KEY=...   (secret! never prefix it with NEXT_PUBLIC_)
//
// Each new account is auto-confirmed (no email is sent). The database trigger then
// creates the profile and applies role, department and team from member_roster.
// Temporary passwords are saved to scripts/new-member-passwords.csv.

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'node:fs'
import { randomInt } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const go = process.argv.includes('--go')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.\n' +
      'Get the secret key in Supabase: Project Settings > API Keys, and add it as\n' +
      'SUPABASE_SERVICE_ROLE_KEY=... to .env.local, then run this again.'
  )
  process.exit(1)
}

// Minimal CSV reader (handles quoted fields and the BOM at the start)
function parseCsv(text) {
  text = text.replace(/^\uFEFF/, '')
  const rows = []
  let row = [], field = '', quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') quoted = false
      else field += c
    } else if (c === '"') quoted = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some((x) => x !== '')) rows.push(row)
      row = []
    } else field += c
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row) }
  const [header, ...body] = rows
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? '').trim()])))
}

// Easy to read out loud: no 0/O, 1/l/I
const ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const makePassword = () =>
  Array.from({ length: 10 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('') + '!7'

const people = parseCsv(readFileSync(join(here, 'members_import.csv'), 'utf8'))
console.log(`${people.length} people in members_import.csv\n`)

if (!go) {
  for (const p of people) console.log(`  would create: ${p.full_name}  <${p.email}>`)
  console.log('\nNothing was created. Run again with --go to create these accounts.')
  process.exit(0)
}

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
const out = [['full_name', 'email', 'temporary_password']]
let created = 0, skipped = 0, failed = 0

for (const p of people) {
  const email = p.email.toLowerCase()
  const password = makePassword()
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: p.full_name },
  })
  if (!error) {
    created++
    out.push([p.full_name, email, password])
    console.log(`  created   ${p.full_name}`)
  } else if (/already|registered|exists/i.test(error.message)) {
    skipped++
    console.log(`  skipped   ${p.full_name} (already has an account)`)
  } else {
    failed++
    console.log(`  FAILED    ${p.full_name}: ${error.message}`)
  }
}

if (out.length > 1) {
  writeFileSync(
    join(here, 'new-member-passwords.csv'),
    out.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n') + '\n'
  )
  console.log('\nPasswords saved to scripts/new-member-passwords.csv')
}
console.log(`\nDone: ${created} created, ${skipped} skipped, ${failed} failed.`)
