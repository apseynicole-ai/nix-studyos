import { modules, type ModuleInfo } from '../data/baccllb';
import { LOCAL_MODULE_CONFIDENCE_KEY, readLocalJson, writeLocalJson } from './localData';

export interface ModuleConfidenceOverride {
  confidence: number;
  updatedAt: string;
}

export type ModuleConfidenceOverrideMap = Record<string, ModuleConfidenceOverride>;

function clampConfidence(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function readModuleConfidenceOverrides(): ModuleConfidenceOverrideMap {
  if (typeof window === 'undefined') return {};
  return readLocalJson<ModuleConfidenceOverrideMap>(LOCAL_MODULE_CONFIDENCE_KEY, {});
}

export function writeModuleConfidenceOverrides(overrides: ModuleConfidenceOverrideMap) {
  if (typeof window === 'undefined') return;
  writeLocalJson(LOCAL_MODULE_CONFIDENCE_KEY, overrides);
}

export function getModuleConfidenceOverride(moduleId: string) {
  return readModuleConfidenceOverrides()[moduleId] ?? null;
}

export function getEffectiveModuleConfidence(moduleOrId: ModuleInfo | string) {
  const moduleId = typeof moduleOrId === 'string' ? moduleOrId : moduleOrId.id;
  const module = typeof moduleOrId === 'string'
    ? modules.find((item) => item.id === moduleId)
    : moduleOrId;

  const fallback = clampConfidence(module?.confidence ?? 0);
  const override = getModuleConfidenceOverride(moduleId);
  return override ? clampConfidence(override.confidence) : fallback;
}

export function setModuleConfidenceOverride(moduleId: string, confidence: number) {
  const next = {
    ...readModuleConfidenceOverrides(),
    [moduleId]: {
      confidence: clampConfidence(confidence),
      updatedAt: new Date().toISOString(),
    },
  };

  writeModuleConfidenceOverrides(next);
  return next;
}

export function clearModuleConfidenceOverride(moduleId: string) {
  const next = { ...readModuleConfidenceOverrides() };
  delete next[moduleId];
  writeModuleConfidenceOverrides(next);
  return next;
}
