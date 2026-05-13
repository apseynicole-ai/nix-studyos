import { modules } from '../data/baccllb';

export interface MarkScenario {
  currentMark: number;
  completedWeight: number;
  nextWeight: number;
  targetMark: number;
}

export function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function requiredMarkForTarget({ currentMark, completedWeight, nextWeight, targetMark }: MarkScenario) {
  const remainingWeightAfterNext = Math.max(0, 100 - completedWeight - nextWeight);
  const achievedWeighted = (currentMark * completedWeight) / 100;
  const neededWeightedFromNextAndFuture = targetMark - achievedWeighted;

  if (nextWeight <= 0) return 0;

  // Conservative: assumes future remaining assessments hit the target mark.
  const futureContributionAtTarget = (targetMark * remainingWeightAfterNext) / 100;
  const requiredFromNext = neededWeightedFromNextAndFuture - futureContributionAtTarget;
  return clamp((requiredFromNext / nextWeight) * 100, 0, 150);
}

export function readinessLabel(score: number) {
  if (score >= 80) return 'Distinction-ready';
  if (score >= 65) return 'On track';
  if (score >= 50) return 'Needs pressure practice';
  return 'High-risk focus zone';
}

export function riskTone(score: number) {
  if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-100';
  if (score >= 65) return 'text-blue-700 bg-blue-50 border-blue-100';
  if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-100';
  return 'text-red-700 bg-red-50 border-red-100';
}

export function getModule(moduleId?: string) {
  return modules.find((module) => module.id === moduleId) || modules[0];
}

export function averageConfidence() {
  return Math.round(modules.reduce((sum, module) => sum + module.confidence, 0) / modules.length);
}

export function upcomingAssessments() {
  return modules
    .flatMap((module) => module.assessments.map((assessment) => ({ ...assessment, module })))
    .filter((item) => item.status === 'upcoming' || item.status === 'draft')
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function priorityScore(confidence: number, target = 80) {
  return clamp(Math.round((target - confidence) * 1.25 + 35));
}
