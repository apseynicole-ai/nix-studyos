export function todayIsoLocal(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function extractIsoDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = value.match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : null;
}

export function isPastDate(value: string | null | undefined): boolean {
  const isoDate = extractIsoDate(value);
  if (!isoDate) return false;
  return isoDate < todayIsoLocal();
}

export function isRelevantAssessmentDate(value: string | null | undefined): boolean {
  const isoDate = extractIsoDate(value);
  if (!isoDate) return true;
  return isoDate >= todayIsoLocal();
}

export function isWithinNextDays(value: string | null | undefined, days: number): boolean {
  const isoDate = extractIsoDate(value);
  if (!isoDate) return false;
  const today = new Date(`${todayIsoLocal()}T00:00:00`);
  const target = new Date(`${isoDate}T00:00:00`);
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000);
  return diff >= 0 && diff <= days;
}

export function compareOptionalIsoDates(left: string | null | undefined, right: string | null | undefined): number {
  const leftIso = extractIsoDate(left);
  const rightIso = extractIsoDate(right);
  if (!leftIso && !rightIso) return 0;
  if (!leftIso) return 1;
  if (!rightIso) return -1;
  return leftIso.localeCompare(rightIso);
}
