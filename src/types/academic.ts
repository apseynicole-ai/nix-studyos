// BAccLLB marks-engine types — foundation layer only, formulas not wired yet

export type AssessmentModelType =
  | 'STANDARD'             // fixed weights, one exam opportunity
  | 'FLEX_A3_SUBSTITUTE'   // A3 can substitute missed or worst main assessment
  | 'CONTINUOUS_ONLY'      // no formal exam / no A3 rescue path
  | 'MULTI_SEMESTER';      // assessments span S1 and S2 in one module

export interface AssessmentEntry {
  id: string;
  label: string;
  weight: number;        // out of 100 for that assessment slot
  semester?: 'S1' | 'S2';
  isOptional?: boolean;
  countRule?: string;    // e.g. "best 4 of 6"
  notes?: string;
}

export type PassRequirementType =
  | 'MINIMUM_MARK'
  | 'MINIMUM_ASSESSMENTS_COMPLETED'
  | 'SUBMINIMUM_ASSESSMENT'
  | 'AT_LEAST_ONE_OF';

export interface PassRequirement {
  type: PassRequirementType;
  description: string;
  assessmentIds?: string[];
  minimumMark?: number;
  minimumCount?: number;
}

export interface SubminimumRule {
  assessmentId: string;
  minimumMark: number;
  description: string;
}

export type A3RuleType =
  | 'NO_A3'
  | 'SUBSTITUTE_MISSED_SAME_WEIGHT'
  | 'SUBSTITUTE_COMBINED_MISSED'
  | 'SUBSTITUTE_WORST_CAPPED'
  | 'FM_CAP_PENALTY';

export interface A3Rule {
  type: A3RuleType;
  description: string;
  cappedAt?: number;
  canReduceFM?: boolean;
  conditions?: string[];
}

export interface LatePenaltyBand {
  daysLate: number;
  penaltyPercent: number;
  description?: string;
}

export interface ModuleAssessmentModel {
  moduleId: string;
  moduleName: string;
  assessmentModelType: AssessmentModelType;
  assessments: AssessmentEntry[];
  passRequirements: PassRequirement[];
  a3Rules: A3Rule[];
  subminimumRules?: SubminimumRule[];
  latePenaltyRules?: LatePenaltyBand[];
  formulaExplanation: string[];
  cautionaryNotes: string[];
  needsVerification: boolean;
}

// --- Calculation result types (shell only — formulas not implemented yet) ---

export interface CalculationResult {
  finalMark: number | null;
  isValid: boolean;
  messages: string[];
}

export interface A3RuleResult {
  appliedRule: A3Rule | null;
  adjustedMark: number | null;
  isCapped: boolean;
  messages: string[];
}

export interface ValidFinalMarkResult {
  isValid: boolean;
  reason: string;
}

export interface TargetRequirementResult {
  requiredMark: number;
  assessmentId: string;
  isFeasible: boolean;
  messages: string[];
}
