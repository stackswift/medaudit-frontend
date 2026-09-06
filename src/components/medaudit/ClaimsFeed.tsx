import { motion } from "motion/react";
import {
  ChevronRight,
  CircleCheck,
  Loader2,
  TriangleAlert,
  ScanSearch,
  FileSearch,
  TrendingUp,
} from "lucide-react";
import { currency, type Claim, type ClaimStatus } from "./data";

function StatusBadge({ status }: { status: ClaimStatus }) {
  const map: Record<
    ClaimStatus,
    { cls: string; icon: React.ReactNode; pulse?: boolean }
  > = {
    Parsing: {
      cls: "border-cyan/30 bg-cyan-soft text-cyan",
      icon: <ScanSearch className="size-3" />,
      pulse: true,
    },
    "Cross-referencing": {
      cls: "border-purple-400/30 bg-purple-400/10 text-purple-300",
      icon: <FileSearch className="size-3" />,
      pulse: true,
    },
    Auditing: {
      cls: "border-cyan/30 bg-cyan-soft text-cyan",
      icon: <Loader2 className="size-3 animate-spin" />,
    },
    Clean: {
      cls: "border-emerald/25 bg-emerald/10 text-emerald",
      icon: <CircleCheck className="size-3" />,
    },
    "Action Required": {
      cls: "border-danger/35 bg-danger/12 text-danger",
      icon: <TriangleAlert className="size-3" />,
    },
  };
  const s = map[status];
  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${s.cls}`}
      style={
        s.pulse
          ? { animation: "pulse-badge 1.8s ease-in-out infinite" }
          : undefined
      }
    >
      {s.icon}
      {status}
    </motion.span>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface/60 px-4 py-3 backdrop-blur-sm">
      <span className="grid size-8 place-items-center rounded-lg border border-emerald/25 bg-emerald/10">
        {icon}
      </span>
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-semibold tabular-nums text-emerald">
          {value}
        </p>
      </div>
    </div>
  );
}

export function ClaimsFeed({
  claims,
  onSelect,
}: {
  claims: Claim[];
  onSelect: (claim: Claim) => void;
}) {
  const totalRecovered = claims.reduce((a, c) => a + c.savings, 0);
  const actionCount = claims.filter(
    (c) => c.status === "Action Required",
  ).length;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface backdrop-blur-xl">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Live feed</h2>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Processed claims
            </p>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">
            {currency(totalRecovered)} recovered
          </span>
        </div>

        {/* Metric sparkline cards */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <MetricCard
            label="Total recovered"
            value={currency(totalRecovered)}
            icon={<TrendingUp className="size-4 text-emerald" />}
          />
          <MetricCard
            label="Needs review"
            value={`${actionCount} claim${actionCount !== 1 ? "s" : ""}`}
            icon={<TriangleAlert className="size-4 text-danger" />}
          />
        </div>
      </div>

      <ul className="divide-y divide-border">
        {claims.map((claim, i) => {
          const actionable = claim.status === "Action Required";
          return (
            <motion.li
              key={claim.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 26,
                delay: 0.04 * i,
              }}
            >
              <button
                onClick={() => actionable && onSelect(claim)}
                disabled={!actionable}
                className="group grid w-full grid-cols-[1fr_auto] items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-surface-strong disabled:cursor-default disabled:hover:bg-transparent sm:grid-cols-[minmax(0,1.4fr)_auto_auto_auto]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium tracking-tight">
                    {claim.provider}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                    {claim.id} · {claim.facility}
                  </p>
                </div>

                <span className="hidden font-mono text-[11px] text-muted-foreground sm:block sm:w-24">
                  {claim.date}
                </span>

                <span
                  className={`font-mono text-sm tabular-nums sm:w-24 sm:text-right ${
                    claim.savings > 0
                      ? "text-emerald"
                      : "text-muted-foreground"
                  }`}
                >
                  {claim.savings > 0 ? `+${currency(claim.savings)}` : "—"}
                </span>

                <span className="flex items-center justify-end gap-2 sm:w-44">
                  <StatusBadge status={claim.status} />
                  <ChevronRight
                    className={`size-4 shrink-0 transition-transform ${
                      actionable
                        ? "text-muted-foreground group-hover:translate-x-0.5 group-hover:text-cyan"
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
