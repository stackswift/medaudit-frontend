import { motion } from "motion/react";
import { Activity, DollarSign, FileStack, ShieldCheck, Zap } from "lucide-react";

export function HudHeader({
  activeDocs,
  totalRecovered = 7567,
}: {
  activeDocs: number;
  totalRecovered?: number;
}) {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className="sticky top-0 z-30 border-b border-border bg-[#05070a]/80 backdrop-blur-2xl"
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl border border-cyan/40 bg-cyan/10 shadow-glow-cyan">
            <ShieldCheck className="size-5 text-cyan" />
          </span>
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-foreground">
                MedAudit
              </span>
              <span className="rounded bg-cyan/15 px-1.5 py-0.5 font-mono text-[9px] font-medium text-cyan border border-cyan/30 uppercase tracking-widest">
                PRO
              </span>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Autonomous Billing Auditor
            </p>
          </div>
        </div>

        {/* Right Status Bar Items */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Total Recovered Savings Card */}
          <div className="flex items-center gap-2 rounded-xl border border-emerald/35 bg-emerald/10 px-3.5 py-1.5 shadow-glow-emerald">
            <span className="grid size-5 place-items-center rounded-md bg-emerald/20 text-emerald">
              <DollarSign className="size-3.5" />
            </span>
            <div className="leading-none">
              <p className="font-mono text-[9px] uppercase tracking-wider text-emerald/70">
                Recovered
              </p>
              <p className="mt-0.5 font-mono text-xs font-bold tabular-nums text-emerald">
                ${totalRecovered.toLocaleString("en-US")}
              </p>
            </div>
          </div>

          {/* Live Agent Badge */}
          <div className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 backdrop-blur-xl sm:flex">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald" />
            </span>
            <span className="font-mono text-[11px] tracking-tight text-foreground/80">
              Live Agent Connected
            </span>
          </div>

          {/* Active Documents */}
          <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 backdrop-blur-xl">
            <FileStack className="size-3.5 text-cyan" />
            <span className="font-mono text-[11px] tabular-nums text-foreground/80">
              {activeDocs} active
            </span>
          </div>

          {/* Latency Counter */}
          <div className="hidden items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 backdrop-blur-xl md:flex">
            <Zap className="size-3.5 text-emerald" />
            <Activity className="size-3 text-muted-foreground" />
            <span className="font-mono text-[11px] text-foreground/80">42ms</span>
          </div>

          {/* User Profile Avatar */}
          <button className="grid size-9 place-items-center rounded-full border border-cyan/40 bg-gradient-to-br from-cyan/25 to-violet/20 font-mono text-[11px] font-semibold text-foreground shadow-glow-cyan transition-transform hover:scale-105">
            AR
          </button>
        </div>
      </div>
    </motion.header>
  );
}
