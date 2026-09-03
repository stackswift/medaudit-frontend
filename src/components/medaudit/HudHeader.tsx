import { motion } from "motion/react";
import { Activity, FileStack, ShieldCheck } from "lucide-react";

export function HudHeader({ activeDocs }: { activeDocs: number }) {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className="sticky top-0 z-30 border-b border-border bg-background/60 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg border border-border bg-cyan-soft">
            <ShieldCheck className="size-4 text-cyan" />
          </span>
          <div className="leading-none">
            <p className="text-sm font-semibold tracking-tight">MedAudit</p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Autonomous Billing Auditor
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 backdrop-blur-xl sm:flex">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald" />
            </span>
            <span className="font-mono text-[11px] tracking-tight text-foreground/80">
              Live Agent Connected
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 backdrop-blur-xl">
            <FileStack className="size-3.5 text-cyan" />
            <span className="font-mono text-[11px] tabular-nums text-foreground/80">
              {activeDocs} active
            </span>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 backdrop-blur-xl md:flex">
            <Activity className="size-3.5 text-muted-foreground" />
            <span className="font-mono text-[11px] text-muted-foreground">142ms</span>
          </div>

          <button className="grid size-9 place-items-center rounded-full border border-border bg-gradient-to-br from-cyan/30 to-transparent font-mono text-[11px] font-medium text-foreground transition-colors hover:border-cyan/40">
            AR
          </button>
        </div>
      </div>
    </motion.header>
  );
}
