"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { scoreBand, BAND_LABEL, type Band } from "@/lib/score-band";
import { ScorePill } from "@/components/ui/ScoreRing";
import { StageBadge, STAGES, type Stage } from "@/components/ui/StageBadge";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Reveal } from "@/components/ui/Reveal";
import { DonutChart } from "@/components/ui/DonutChart";
import { cn } from "@/lib/ui";

// Small inline icons for the KPI tiles (no icon dependency).
function KpiIcon({ name }: { name: string }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "users")
    return (
      <svg width="15" height="15" viewBox="0 0 20 20" {...p}>
        <circle cx="7.5" cy="6" r="3" />
        <path d="M2 17c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
        <path d="M14 4.5a3 3 0 010 6M18 17c0-2.2-1.2-4-3-4.7" />
      </svg>
    );
  if (name === "target")
    return (
      <svg width="15" height="15" viewBox="0 0 20 20" {...p}>
        <circle cx="10" cy="10" r="7.5" />
        <circle cx="10" cy="10" r="3.5" />
      </svg>
    );
  if (name === "activity")
    return (
      <svg width="15" height="15" viewBox="0 0 20 20" {...p}>
        <path d="M2 10h3l2.5 6 5-12L15 10h3" />
      </svg>
    );
  if (name === "star")
    return (
      <svg width="15" height="15" viewBox="0 0 20 20" {...p}>
        <path d="M10 2.5l2.3 4.7 5.2.8-3.8 3.7.9 5.2-4.6-2.5-4.6 2.5.9-5.2L2.5 8l5.2-.8z" />
      </svg>
    );
  return null;
}

export type Row = {
  appId: string;
  name: string;
  email: string;
  jobId: string;
  jobTitle: string;
  stage: string;
  score: number | null;
};

type SortKey = "name" | "jobTitle" | "stage" | "score";

const STAGE_LABEL: Record<Stage, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
};

const BAND_BAR: Record<Band, string> = {
  strong: "var(--color-strong)",
  fair: "var(--color-fair-mark)",
  weak: "var(--color-weak)",
};

function avg(nums: number[]): number | null {
  if (!nums.length) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function KPI({
  label,
  value,
  hint,
  index = 0,
  icon,
  accentFg,
  accentBg,
}: {
  label: string;
  value: number | string;
  hint?: string;
  index?: number;
  icon: string;
  accentFg: string;
  accentBg: string;
}) {
  return (
    <Reveal index={index} className="glass card-lift rounded-lg border border-line p-4">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{ background: accentBg, color: accentFg }}
        >
          <KpiIcon name={icon} />
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink tnum">
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </Reveal>
  );
}

// One interactive bar in a chart: a labelled magnitude bar that is also a filter toggle.
function ChartBar({
  label,
  count,
  max,
  color,
  active,
  onClick,
}: {
  label: string;
  count: number;
  max: number;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <button
      onClick={onClick}
      title={`${label}: ${count}`}
      className={cn(
        "group flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-plane",
        active && "bg-brand-wash",
      )}
    >
      <span className="w-20 shrink-0 text-sm text-ink-2">{label}</span>
      <span className="relative h-5 flex-1 overflow-hidden rounded bg-line/60">
        <motion.span
          className="absolute inset-y-0 left-0 rounded"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(pct, count > 0 ? 4 : 0)}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </span>
      <span className="w-8 shrink-0 text-right text-sm font-semibold tnum text-ink">{count}</span>
    </button>
  );
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
  className?: string;
}) {
  return (
    <th className={cn("px-4 py-2.5 text-left", className)}>
      <button
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors",
          active ? "text-ink" : "text-muted hover:text-ink-2",
        )}
      >
        {label}
        <span className={cn("text-[10px]", active ? "opacity-100" : "opacity-0")}>
          {dir === "desc" ? "▾" : "▴"}
        </span>
      </button>
    </th>
  );
}

export function DashboardClient({
  rows,
  jobs,
  orgName,
}: {
  rows: Row[];
  jobs: { id: string; title: string }[];
  orgName: string;
}) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<string>("all");
  const [stage, setStage] = useState<Stage | null>(null);
  const [band, setBand] = useState<Band | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (role !== "all" && r.jobId !== role) return false;
      if (stage && r.stage !== stage) return false;
      if (band && (r.score === null || scoreBand(r.score) !== band)) return false;
      if (q && !r.name.toLowerCase().includes(q) && !r.email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, search, role, stage, band]);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "score") cmp = (a.score ?? -1) - (b.score ?? -1);
      else if (sortKey === "stage") cmp = STAGES.indexOf(a.stage as Stage) - STAGES.indexOf(b.stage as Stage);
      else cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
      return cmp * dir;
    });
  }, [filtered, sortKey, sortDir]);

  // Charts reflect the CURRENT filter set (except their own dimension, so a bar you filtered by still
  // shows its full context). Stage chart ignores the stage filter; band chart ignores the band filter.
  const stageData = useMemo(() => {
    const base = rows.filter((r) => {
      if (role !== "all" && r.jobId !== role) return false;
      if (band && (r.score === null || scoreBand(r.score) !== band)) return false;
      const q = search.trim().toLowerCase();
      if (q && !r.name.toLowerCase().includes(q) && !r.email.toLowerCase().includes(q)) return false;
      return true;
    });
    return STAGES.map((s) => ({ stage: s, count: base.filter((r) => r.stage === s).length }));
  }, [rows, role, band, search]);

  const bandData = useMemo(() => {
    const base = rows.filter((r) => {
      if (role !== "all" && r.jobId !== role) return false;
      if (stage && r.stage !== stage) return false;
      const q = search.trim().toLowerCase();
      if (q && !r.name.toLowerCase().includes(q) && !r.email.toLowerCase().includes(q)) return false;
      return true;
    });
    return (["strong", "fair", "weak"] as Band[]).map((b) => ({
      band: b,
      count: base.filter((r) => r.score !== null && scoreBand(r.score) === b).length,
    }));
  }, [rows, role, stage, search]);

  const scores = filtered.map((r) => r.score).filter((s): s is number => s !== null);
  const inPlay = filtered.filter((r) => r.stage === "interview" || r.stage === "offer").length;
  const strong = filtered.filter((r) => r.score !== null && r.score >= 80).length;

  const stageMax = Math.max(1, ...stageData.map((d) => d.count));

  const hasFilters = role !== "all" || stage !== null || band !== null || search.trim() !== "";

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir(key === "name" || key === "jobTitle" ? "asc" : "desc");
    }
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-2">
            {orgName} · {rows.length} candidates across {jobs.length} roles
          </p>
        </div>
      </header>

      {/* Filter bar */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">⌕</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidates…"
            className="w-full rounded-md border border-line bg-surface py-2 pl-8 pr-3 text-sm text-ink placeholder:text-muted shadow-sm transition-colors focus:border-brand"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium text-ink shadow-sm transition-colors focus:border-brand"
        >
          <option value="all">All roles</option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>
        {stage && (
          <button
            onClick={() => setStage(null)}
            className="inline-flex items-center gap-1 rounded-full bg-brand-wash px-3 py-1.5 text-xs font-medium text-brand-ink"
          >
            {STAGE_LABEL[stage]} <span className="opacity-70">✕</span>
          </button>
        )}
        {band && (
          <button
            onClick={() => setBand(null)}
            className="inline-flex items-center gap-1 rounded-full bg-brand-wash px-3 py-1.5 text-xs font-medium text-brand-ink"
          >
            {BAND_LABEL[band]} <span className="opacity-70">✕</span>
          </button>
        )}
        {hasFilters && (
          <button
            onClick={() => {
              setSearch("");
              setRole("all");
              setStage(null);
              setBand(null);
            }}
            className="text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            Clear all
          </button>
        )}
      </div>

      {/* KPIs — recompute with filters */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KPI index={0} label="Candidates" value={filtered.length} hint={hasFilters ? "filtered" : "total"}
          icon="users" accentFg="var(--color-brand)" accentBg="var(--color-brand-wash)" />
        <KPI index={1} label="Avg. match" value={avg(scores) ?? "—"} hint="0–100"
          icon="target" accentFg="var(--color-brand-ink)" accentBg="var(--color-brand-wash)" />
        <KPI index={2} label="In play" value={inPlay} hint="interview or offer"
          icon="activity" accentFg="var(--color-fair)" accentBg="var(--color-fair-wash)" />
        <KPI index={3} label="Strong ≥ 80" value={strong} hint="top matches"
          icon="star" accentFg="var(--color-strong)" accentBg="var(--color-strong-wash)" />
      </div>

      {/* Charts — click a bar to filter */}
      <div className="mb-6 grid gap-3 lg:grid-cols-2">
        <Reveal index={4} className="glass card-lift rounded-lg border border-line p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">Pipeline</h2>
          <div className="space-y-0.5">
            {stageData.map((d) => (
              <ChartBar
                key={d.stage}
                label={STAGE_LABEL[d.stage]}
                count={d.count}
                max={stageMax}
                color="linear-gradient(90deg, var(--color-seq-300), var(--color-seq-500))"
                active={stage === d.stage}
                onClick={() => setStage(stage === d.stage ? null : d.stage)}
              />
            ))}
          </div>
        </Reveal>

        <Reveal index={5} className="glass card-lift rounded-lg border border-line p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
            Match quality
          </h2>
          <DonutChart
            total={bandData.reduce((a, d) => a + d.count, 0)}
            slices={(["strong", "fair", "weak"] as Band[]).map((b) => {
              const d = bandData.find((x) => x.band === b)!;
              return {
                key: b,
                label: BAND_LABEL[b],
                value: d.count,
                color: BAND_BAR[b],
                active: band === b,
                onClick: () => setBand(band === b ? null : b),
              };
            })}
          />
        </Reveal>
      </div>

      {/* Candidate table — sortable, filtered, clickable */}
      <Reveal index={6} className="glass overflow-hidden rounded-lg border border-line">
        <table className="w-full">
          <thead className="border-b border-line bg-plane/50">
            <tr>
              <SortHeader label="Candidate" active={sortKey === "name"} dir={sortDir} onClick={() => toggleSort("name")} />
              <SortHeader label="Role" active={sortKey === "jobTitle"} dir={sortDir} onClick={() => toggleSort("jobTitle")} className="hidden sm:table-cell" />
              <SortHeader label="Stage" active={sortKey === "stage"} dir={sortDir} onClick={() => toggleSort("stage")} />
              <SortHeader label="Match" active={sortKey === "score"} dir={sortDir} onClick={() => toggleSort("score")} className="text-right" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.appId} className="border-b border-line last:border-0 hover:bg-plane">
                <td className="px-4 py-3">
                  <Link href={`/applications/${r.appId}`} className="block">
                    <span className="font-medium text-ink hover:text-brand-ink">{r.name}</span>
                    <span className="block text-xs text-muted">{r.email}</span>
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-sm text-ink-2 sm:table-cell">{r.jobTitle}</td>
                <td className="px-4 py-3">
                  <StageBadge stage={r.stage} />
                </td>
                <td className="px-4 py-3 text-right">
                  <ScorePill score={r.score} />
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-sm text-muted">
                  No candidates match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Reveal>
    </div>
  );
}
