function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// "YYYY-MM-DD" in the user's own time zone
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateKey(key: string): Date {
  return new Date(key + "T00:00:00");
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// weekStartsOn: 0 = Sunday, 1 = Monday, ... 6 = Saturday
export function startOfWeek(date: Date, weekStartsOn: number): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const diff = (result.getDay() - weekStartsOn + 7) % 7;
  result.setDate(result.getDate() - diff);
  return result;
}
