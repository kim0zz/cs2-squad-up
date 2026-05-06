/** `YYYY-MM-DD` for `<input type="date" />`. */
export function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Local date + time (`HH:mm`) to ISO string for Supabase `timestamptz`. */
export function combineLocalDateAndTimeToIso(dateStr: string, timeStr: string): string | null {
  const d = new Date(`${dateStr}T${timeStr}`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}
