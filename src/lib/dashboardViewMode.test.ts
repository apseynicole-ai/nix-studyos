import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LOCAL_DASHBOARD_VIEW_MODE_KEY } from './localData';
import { normaliseDashboardViewMode, readDashboardViewMode, writeDashboardViewMode } from './dashboardViewMode';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return Array.from(this.values.keys())[index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

let memStore: MemoryStorage;

beforeEach(() => {
  memStore = new MemoryStorage();
  Object.defineProperty(globalThis, 'localStorage', { value: memStore, configurable: true });
});

afterEach(() => {
  memStore.clear();
});

describe('dashboard view mode preference', () => {
  it('defaults to today mode', () => {
    expect(readDashboardViewMode()).toBe('today');
    expect(normaliseDashboardViewMode(undefined)).toBe('today');
  });

  it('accepts today and full modes', () => {
    expect(normaliseDashboardViewMode('today')).toBe('today');
    expect(normaliseDashboardViewMode('full')).toBe('full');
  });

  it('rejects unknown values safely', () => {
    expect(normaliseDashboardViewMode('compact')).toBe('today');
    expect(normaliseDashboardViewMode(null)).toBe('today');
  });

  it('persists and reads the selected mode', () => {
    writeDashboardViewMode('full');

    expect(readDashboardViewMode()).toBe('full');
    expect(localStorage.getItem(LOCAL_DASHBOARD_VIEW_MODE_KEY)).toBe('"full"');
  });

  it('does not crash when localStorage is unavailable', () => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: () => { throw new Error('storage blocked'); },
        setItem: () => { throw new Error('storage blocked'); },
      },
      configurable: true,
    });

    expect(readDashboardViewMode()).toBe('today');
    expect(() => writeDashboardViewMode('full')).not.toThrow();
  });
});
