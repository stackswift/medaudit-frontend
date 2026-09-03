import { motion } from "motion/react";
import { ChevronRight, CircleCheck, Cpu, Loader2, Sparkles, TriangleAlert } from "lucide-react";
import { currency, type Claim, type ClaimStatus } from "./data";

function StatusBadge({ status }: { status: ClaimStatus }) {
  const map: Record<ClaimStatus, { cls: string; icon: React.ReactNode; label: string }> = {
    Parsing: {
      cls: "border-cyan/40 bg-cyan/15 text-cyan animate-pulse",
      icon: <Loader2 className="size-3 animate-spin text-cyan" />,
      label: "PARSING",
    },
    "Cross-Referencing": {
      cls: "border-violet/40 bg-violet/15 text-violet shadow-glow-violet",
      icon: <Cpu className="size-3 text-violet animate-pulse" />,
      label: "CROSS-REFERENCING",
    },
    "Action Required": {
      cls: "border-danger/50 bg-danger/15 text-danger shadow-glow-danger animate-pulse",
      icon: <TriangleAlert className="size-3 text-danger" />,
      label: "ACTION REQUIRED",
    },
    Clean: {
      cls: "border-emerald/30 bg-emerald/10 text-emerald",
      icon: <CircleCheck className="size-3 text-emerald" />,
      label: "CLEAN",
    },
  };
  const s = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase font-semibold tracking-wider transition-transform group-hover:scale-105 ${s.cls}`}
    >
      {s.icon}
      <span>{s.label}</span>
    </span>
  );
}

export function ClaimsFeed({
  claims,
  onSelect,
}: {
  claims: Claim[];
  onSelect: (claim: Claim) => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card/60 backdrop-blur-2xl shadow-panel">
      {/* Micro-grid background texture */}
      <div className="pointer-events-none absolute inset-0 opacity-30 micro-grid" />

      {/* Feed Header */}
      <div className="relative flex items-center justify-between border-b border-border/80 px-6 py-4 bg-white/[0.02]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Live Audit Feed
            </h2>
            <span className="flex size-2 rounded-full bg-cyan animate-ping" />
          </div>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Continuously Monitored Claims
          </p>
        </div>
        <div className="text-right font-mono">
          <span className="block text-[10px] text-muted-foreground uppercase tracking-wider">
            Total Discovered
          </span>
          <span className="text-xs font-bold text-emerald tabular-nums">
            +{currency(claims.reduce((a, c) => a + c.savings, 0))}
          </span>
        </div>
      </div>

      {/* Claims List */}
      <ul className="relative divide-y divide-border/60">
        {claims.map((claim, i) => {
          const actionable = claim.status === "Action Required";
          return (
            <motion.li
              key={claim.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 26, delay: 0.04 * i }}
            >
              <button
                onClick={() => actionable && onSelect(claim)}
                disabled={!actionable}
                className={`group grid w-full grid-cols-[1fr_auto] items-center gap-3 px-6 py-4 text-left transition-all ${
                  actionable
                    ? "cursor-pointer hover:bg-white/[0.05]"
                    : "cursor-default hover:bg-transparent"
                } sm:grid-cols-[minmax(0,1.5fr)_auto_auto_auto]`}
              >
                {/* Provider & Metadata */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold tracking-tight text-foreground group-hover:text-cyan transition-colors">
                      {claim.provider}
                    </p>
                    {actionable && <Sparkles className="size-3.5 text-danger opacity-80" />}
                  </div>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                    <span className="text-foreground/70 font-semibold">{claim.id}</span> ·{" "}
                    {claim.facility}
                  </p>
                </div>

                {/* Date */}
                <span className="hidden font-mono text-[11px] text-muted-foreground sm:block sm:w-24">
                  {claim.date}
                </span>

                {/* Savings Counter */}
                <span
                  className={`font-mono text-sm font-bold tabular-nums sm:w-28 sm:text-right ${
                    claim.savings > 0 ? "text-emerald" : "text-muted-foreground/60"
                  }`}
                >
                  {claim.savings > 0 ? `+${currency(claim.savings)}` : "—"}
                </span>

                {/* Status Pill & Arrow */}
                <span className="flex items-center justify-end gap-2.5 sm:w-48">
                  <StatusBadge status={claim.status} />
                  <ChevronRight
                    className={`size-4 shrink-0 transition-transform ${
                      actionable
                        ? "text-muted-foreground group-hover:translate-x-1 group-hover:text-cyan"
                        : "text-transparent"
                    }`}
                  />
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
