// The shape of a score and its evidence.
//
// A score is never a bare number. It always travels with the breakdown that produced it, so every
// point is traceable to something in the resume. That is what makes the score defensible and
// reproducible rather than a black box.

export type SkillHit = {
  skill: string;
  present: boolean;
};

export type ScoreBreakdown = {
  overall: number; // 0-100, computed from the weighted parts below
  requiredSkills: {
    hits: SkillHit[];
    matched: number;
    total: number;
    pct: number; // 0-100
  };
  preferredSkills: {
    hits: SkillHit[];
    matched: number;
    total: number;
    pct: number;
  };
  experience: {
    candidateYears: number;
    requiredYears: number;
    met: boolean;
    pct: number;
  };
  education: {
    required: string | null;
    found: string | null;
    met: boolean;
  };
  // How each part was weighted into `overall`, so the maths is fully auditable on screen.
  weights: { requiredSkills: number; preferredSkills: number; experience: number; education: number };
};

export type JobCriteria = {
  requiredSkills: string[];
  preferredSkills: string[];
  minYears: number;
  education: string | null;
};

// What extraction produces from a resume. Deterministic today; an optional LLM may enrich it later,
// but the score is always computed from THIS structured evidence, never generated directly.
export type ResumeFacts = {
  skillsPresent: (candidates: string[]) => SkillHit[];
  years: number;
  education: string | null;
};
