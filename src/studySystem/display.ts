// Display-only formatting (spec §1B): stored minutes are EXACT; user-facing values round
// to the nearest 5 minutes. These helpers never mutate stored data.

/** Round exact minutes to the nearest 5 for display only. */
export function roundToNearest5(exactMinutes: number): number {
  return Math.round(exactMinutes / 5) * 5;
}

/** e.g. 67 -> "1h 05", 45 -> "45 min", 0 -> "0 min". Rounds to nearest 5 for display. */
export function formatDurationDisplay(exactMinutes: number): string {
  const m = Math.max(0, roundToNearest5(exactMinutes));
  const h = Math.floor(m / 60);
  const mins = m % 60;
  if (h <= 0) return `${mins} min`;
  return `${h}h ${String(mins).padStart(2, '0')}`;
}

/** e.g. "2h 05 / 3h 00" — actual (exact, rounded for display) vs planned. */
export function formatActualVsPlanned(actualExact: number, plannedMinutes: number): string {
  return `${formatDurationDisplay(actualExact)} / ${formatDurationDisplay(plannedMinutes)}`;
}

/** mm:ss for a live running timer (uses exact seconds, no rounding). */
export function formatStopwatch(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const core = `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  return hh > 0 ? `${hh}:${core}` : core;
}
