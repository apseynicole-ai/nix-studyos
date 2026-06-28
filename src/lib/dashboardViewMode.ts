import { LOCAL_DASHBOARD_VIEW_MODE_KEY, readLocalJson, writeLocalJson } from './localData';

export type DashboardViewMode = 'today' | 'full';

export function normaliseDashboardViewMode(value: unknown): DashboardViewMode {
  return value === 'full' || value === 'today' ? value : 'today';
}

export function readDashboardViewMode(): DashboardViewMode {
  try {
    return normaliseDashboardViewMode(readLocalJson<unknown>(LOCAL_DASHBOARD_VIEW_MODE_KEY, 'today'));
  } catch {
    return 'today';
  }
}

export function writeDashboardViewMode(mode: DashboardViewMode): void {
  try {
    writeLocalJson(LOCAL_DASHBOARD_VIEW_MODE_KEY, mode);
  } catch {
    // Dashboard view mode is a convenience preference; storage failures should not block the page.
  }
}
