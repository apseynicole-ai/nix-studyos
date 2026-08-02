import { beforeEach, describe, expect, it } from 'vitest';
import { installMemoryStorage } from './testMemoryStorage';
import { CollectionRepository, SingletonRepository, SS_KEYS, STUDY_SYSTEM_SCHEMA_VERSION } from './store';

interface Row {
  id: string;
  value: number;
}

beforeEach(() => installMemoryStorage());

describe('CollectionRepository', () => {
  const repo = () => new CollectionRepository<Row>(SS_KEYS.modules);

  it('starts empty and round-trips writes through a versioned envelope', () => {
    const r = repo();
    expect(r.read()).toEqual([]);
    expect(r.isEmpty()).toBe(true);

    r.write([{ id: 'a', value: 1 }]);
    expect(r.read()).toEqual([{ id: 'a', value: 1 }]);

    const raw = JSON.parse(localStorage.getItem(SS_KEYS.modules)!);
    expect(raw.v).toBe(STUDY_SYSTEM_SCHEMA_VERSION);
    expect(raw.data).toEqual([{ id: 'a', value: 1 }]);
  });

  it('upsert adds new and updates existing by id', () => {
    const r = repo();
    r.upsert({ id: 'a', value: 1 });
    r.upsert({ id: 'a', value: 2 });
    r.upsert({ id: 'b', value: 9 });
    expect(r.read()).toEqual([{ id: 'a', value: 2 }, { id: 'b', value: 9 }]);
  });

  it('upsertMany merges without duplicating ids and preserves insertion order', () => {
    const r = repo();
    r.write([{ id: 'a', value: 1 }, { id: 'b', value: 2 }]);
    r.upsertMany([{ id: 'b', value: 20 }, { id: 'c', value: 3 }]);
    expect(r.read()).toEqual([
      { id: 'a', value: 1 },
      { id: 'b', value: 20 },
      { id: 'c', value: 3 },
    ]);
  });

  it('remove deletes only the targeted id', () => {
    const r = repo();
    r.write([{ id: 'a', value: 1 }, { id: 'b', value: 2 }]);
    r.remove('a');
    expect(r.read()).toEqual([{ id: 'b', value: 2 }]);
  });

  it('adopts a legacy un-enveloped array (version 0) on read', () => {
    localStorage.setItem(SS_KEYS.modules, JSON.stringify([{ id: 'x', value: 5 }]));
    expect(repo().read()).toEqual([{ id: 'x', value: 5 }]);
  });

  it('returns [] for corrupt JSON rather than throwing', () => {
    localStorage.setItem(SS_KEYS.modules, '{not json');
    expect(repo().read()).toEqual([]);
  });
});

describe('SingletonRepository', () => {
  it('reads a fallback then merges patches via update', () => {
    const repo = new SingletonRepository<{ a: number; b: number }>(SS_KEYS.appState);
    const fallback = { a: 0, b: 0 };
    expect(repo.read(fallback)).toEqual(fallback);
    repo.update({ a: 1 }, fallback);
    expect(repo.read(fallback)).toEqual({ a: 1, b: 0 });
    repo.update({ b: 2 }, fallback);
    expect(repo.read(fallback)).toEqual({ a: 1, b: 2 });
  });
});
