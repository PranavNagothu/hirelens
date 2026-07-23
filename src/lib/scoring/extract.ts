// Deterministic extraction from raw resume text.
//
// This is the free, offline, reproducible core: no API, no model, no network. Same resume in ->
// same facts out, every time. An optional LLM layer (M5) can enrich this, but it never replaces it:
// the score is always computed from structured facts, so it stays auditable.

const DEGREE_RANK: Record<string, number> = {
  "high school": 1,
  associate: 2,
  bachelor: 3,
  master: 4,
  phd: 5,
  doctorate: 5,
};

/** Does `haystack` (already lowercased) contain `skill` as a distinct token?
 *
 * A plain substring check would match "Java" inside "JavaScript". We require the match to sit on
 * word boundaries, where a boundary is any character that is NOT alphanumeric. That is the right
 * rule for BOTH problems:
 *   - "Java" vs "JavaScript": the char after the match is "s" (alphanumeric) -> rejected. Good.
 *   - "AWS" in "AWS.": the char after the match is "." (not alphanumeric) -> a boundary -> matched.
 * Symbols INSIDE a skill (Node.js, C++, C#) are part of the search term itself, so they still match;
 * only the characters flanking the match decide the boundary.
 */
export function containsSkill(haystackLower: string, skillLower: string): boolean {
  if (!skillLower) return false;
  const isWordChar = (c: string) => /[a-z0-9]/.test(c);
  let from = 0;
  for (;;) {
    const idx = haystackLower.indexOf(skillLower, from);
    if (idx === -1) return false;
    const before = idx === 0 ? "" : haystackLower[idx - 1];
    const after = haystackLower[idx + skillLower.length] ?? "";
    const boundedLeft = before === "" || !isWordChar(before);
    const boundedRight = after === "" || !isWordChar(after);
    if (boundedLeft && boundedRight) return true;
    from = idx + 1;
  }
}

/** Which of the given skills appear in the resume. Order preserved for stable output. */
export function skillsPresent(resumeText: string, candidates: string[]) {
  const hay = resumeText.toLowerCase();
  return candidates.map((skill) => ({ skill, present: containsSkill(hay, skill.toLowerCase()) }));
}

/** Best-effort years of experience.
 *
 * Two signals, we take the max:
 *   1. An explicit phrase like "5+ years" / "5 years of experience".
 *   2. The span between the earliest and latest 4-digit years mentioned (a proxy for career length),
 *      capped so a stray old date cannot inflate it absurdly.
 * Deterministic and conservative — it under-counts rather than inventing experience.
 */
export function extractYears(resumeText: string): number {
  const text = resumeText.toLowerCase();

  let explicit = 0;
  const phrase = /(\d{1,2})\s*\+?\s*years?/g;
  for (const m of text.matchAll(phrase)) {
    explicit = Math.max(explicit, Number(m[1]));
  }

  let span = 0;
  const years = [...resumeText.matchAll(/\b(19|20)\d{2}\b/g)].map((m) => Number(m[0]));
  if (years.length >= 2) {
    const now = new Date().getFullYear();
    const valid = years.filter((y) => y >= 1970 && y <= now + 1);
    if (valid.length >= 2) span = Math.max(...valid) - Math.min(...valid);
  }

  return Math.min(Math.max(explicit, span), 40);
}

/** Highest degree mentioned, normalized to a canonical label (or null if none found). */
export function extractEducation(resumeText: string): string | null {
  const text = resumeText.toLowerCase();
  let best: { label: string; rank: number } | null = null;
  const check = (needle: string, label: string) => {
    if (text.includes(needle)) {
      const rank = DEGREE_RANK[label] ?? 0;
      if (!best || rank > best.rank) best = { label, rank };
    }
  };
  check("ph.d", "phd");
  check("phd", "phd");
  check("doctorate", "phd");
  check("master", "master");
  check("m.s", "master");
  check("mba", "master");
  check("bachelor", "bachelor");
  check("b.s", "bachelor");
  check("b.tech", "bachelor");
  check("associate", "associate");
  check("high school", "high school");
  return best ? (best as { label: string }).label : null;
}

/** Rank a normalized degree label for comparison ("bachelor" >= "associate"). */
export function degreeRank(label: string | null): number {
  if (!label) return 0;
  return DEGREE_RANK[label.toLowerCase()] ?? 0;
}
