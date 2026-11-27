// ERT Hub: give one person a new temporary password
//
//   node --env-file=.env.local scripts/reset-password.mjs person@ejust.edu.eg
//
// The new password is printed in the terminal only. It is not saved anywhere.
// Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.

import { createClient } from '@supabase/supabase-js'
import { randomInt } from 'node:crypto'

const email = process.argv[2]?.trim().toLowerCase()
if (!email) {
  console.error('Usage: node --env-file=.env.local scripts/reset-password.mjs person@ejust.edu.eg')
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
if (error) {
  console.error('Could not list accounts:', error.message)
  process.exit(1)
}

const user = data.users.find((u) => u.email?.toLowerCase() === email)
if (!user) {
  console.error(`No account found for ${email}. Check the spelling.`)
  process.exit(1)
}

// Easy to read out loud: no 0/O, 1/l/I
const ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const password =
  Array.from({ length: 10 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('') + '!7'

const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { password })
if (updateError) {
  console.error('Could not change the password:', updateError.message)
  process.exit(1)
}

console.log(`\nNew password for ${email}:\n\n  ${password}\n`)
console.log('Send it to them privately, and ask them to change it after logging in.')
