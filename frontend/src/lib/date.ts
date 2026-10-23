/**
 * YYYY-MM-DD of the given instant in the user's local time zone.
 *
 * Use this for "today" in the UI (daily tasks, exam date default).
 * `new Date().toISOString()` returns the UTC date, which is the previous day
 * for users in UTC+8 between 00:00 and 08:00.
 */
export function localDateKey(d: Date = new Date()): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}
