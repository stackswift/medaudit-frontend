import { motion } from "motion/react";
import { ChevronRight, CircleCheck, Loader2, TriangleAlert } from "lucide-react";
import { currency, type Claim, type ClaimStatus } from "./data";

function StatusBadge({ status }: { status: ClaimStatus }) {
  const map: Record<ClaimStatus, { cls: string; icon: React.ReactNode }> = {
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
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${s.cls}`}
    >
      {s.icon}
      {status}
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
    <section className="overflow-hidden rounded-2xl border border-border bg-surface backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Live feed</h2>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Processed claims
          </p>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">
          {currency(claims.reduce((a, c) => a + c.savings, 0))} recovered
        </span>
      </div>

      <ul className="divide-y divide-border">
        {claims.map((claim, i) => {
          const actionable = claim.status === "Action Required";
          return (
            <motion.li
              key={claim.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 26, delay: 0.04 * i }}
            >
              <button
                onClick={() => actionable && onSelect(claim)}
                disabled={!actionable}
                className="group grid w-full grid-cols-[1fr_auto] items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-strong disabled:cursor-default disabled:hover:bg-transparent sm:grid-cols-[minmax(0,1.4fr)_auto_auto_auto]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium tracking-tight">{claim.provider}</p>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                    {claim.id} · {claim.facility}
                  </p>
                </div>

                <span className="hidden font-mono text-[11px] text-muted-foreground sm:block sm:w-24">
                  {claim.date}
                </span>

                <span
                  className={`font-mono text-sm tabular-nums sm:w-24 sm:text-right ${
                    claim.savings > 0 ? "text-emerald" : "text-muted-foreground"
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
