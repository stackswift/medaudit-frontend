import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Gavel,
  X,
  CheckCircle2,
  AlertTriangle,
  Calculator,
  FileText,
  ChevronDown,
  Sparkles,
  ScrollText,
  ExternalLink,
} from "lucide-react";
import type { Claim } from "./data";

const tabs = ["Agent Logic Breakdown", "Generated Dispute Letter"] as const;

type ReasoningStep = {
  id: number;
  status: "Verified" | "Flagged" | "Calculated";
  title: string;
  detail: string;
};

const REASONING_STEPS: ReasoningStep[] = [
  {
    id: 1,
    status: "Verified",
    title: "Policy eligibility confirmed via clearinghouse",
    detail:
      "Patient policy CMS-PPO-7842 verified active on service date Sep 3, 2026. In-network provider status confirmed. Deductible met: $1,500/$1,500.",
  },
  {
    id: 2,
    status: "Flagged",
    title: "CPT 99285 fails high-complexity MDM threshold",
    detail:
      "Level 5 ED code requires high-complexity medical decision-making with threat-to-life criteria. Documentation shows stable vitals, moderate MDM, and no critical care time recorded. Correct level: CPT 99283.",
  },
  {
    id: 3,
    status: "Calculated",
    title: "Medicare Part B geometric mean rate applied",
    detail:
      "Billed: $2,450.00 (CPT 99285). Medicare geometric mean: $610.00 (CPT 99283). Modifier 59 on CPT 36415 violates NCCI bundle — additional $28.00 removed. Net recoverable: $1,840.00.",
  },
];

function StatusIcon({ status }: { status: ReasoningStep["status"] }) {
  if (status === "Verified")
    return <CheckCircle2 className="size-4 text-emerald" />;
  if (status === "Flagged")
    return <AlertTriangle className="size-4 text-danger" />;
  return <Calculator className="size-4 text-cyan" />;
}

function statusColor(status: ReasoningStep["status"]) {
  if (status === "Verified") return "text-emerald border-emerald/30 bg-emerald/10";
  if (status === "Flagged") return "text-danger border-danger/30 bg-danger/10";
  return "text-cyan border-cyan/30 bg-cyan-soft";
}

function ReasoningStepper() {
  const [open, setOpen] = useState<number | null>(1);

  return (
    <div className="space-y-2">
      {REASONING_STEPS.map((step, i) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 * i }}
          className="overflow-hidden rounded-xl border border-border bg-surface"
        >
          <button
            onClick={() => setOpen(open === step.id ? null : step.id)}
            className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-strong"
          >
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider shrink-0 ${statusColor(step.status)}`}
            >
              <StatusIcon status={step.status} />
              {step.status}
            </span>
            <span className="flex-1 text-xs font-medium text-foreground/90">
              {step.title}
            </span>
            <ChevronDown
              className={`size-3.5 shrink-0 text-muted-foreground transition-transform ${open === step.id ? "rotate-180" : ""}`}
            />
          </button>
          <AnimatePresence>
            {open === step.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <p className="border-t border-border px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                  {step.detail}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

function Counter({ target }: { target: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / 900, 1);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);

  return (
    <p className="mt-1 font-mono text-4xl font-bold tabular-nums tracking-tight text-emerald">
      ${n.toLocaleString("en-US")}
      <span className="text-emerald/60">.00</span>
    </p>
  );
}

function HcfaDocumentViewer({ claim }: { claim: Claim }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-white/[0.03]">
      {/* Provider header */}
      <div className="border-b border-border bg-white/[0.04] px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg border border-border bg-surface">
              <FileText className="size-4 text-cyan" />
            </div>
            <div>
              <p className="text-xs font-semibold tracking-tight text-foreground">
                {claim.provider}
              </p>
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                NPI: 1092837482 · TAX ID: 47-2918341
              </p>
            </div>
          </div>
          <div className="text-right font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            <p>Statement Date</p>
            <p className="text-foreground/70">{claim.date}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 border-t border-border pt-3">
          {[
            { label: "Patient Acct", value: "PA-00881924" },
            { label: "Payer ID", value: "CMS-PPO-7842" },
            { label: "Facility", value: claim.facility },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
                {label}
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-foreground/80">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* HCFA-1500 line items */}
      <div className="p-4 font-mono text-[10px]">
        <div className="mb-3 grid grid-cols-[1fr_auto] border-b border-border pb-2 font-medium uppercase tracking-widest text-muted-foreground">
          <span>Procedure / Description</span>
          <span>Amount</span>
        </div>
        <div className="space-y-1">
          {[
            { code: "CPT 80053", desc: "Comprehensive Metabolic Panel", amount: "$92.00" },
            { code: "CPT 93010", desc: "Electrocardiogram, report only", amount: "$118.00" },
          ].map((row) => (
            <div
              key={row.code}
              className="grid grid-cols-[1fr_auto] gap-3 rounded px-2 py-1.5 text-muted-foreground"
            >
              <span className="truncate">
                <span className="text-foreground/60">{row.code}</span>
                {" — "}
                {row.desc}
              </span>
              <span className="shrink-0 tabular-nums">{row.amount}</span>
            </div>
          ))}

          {/* Flagged line with animated glow bbox */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.18, type: "spring", stiffness: 220, damping: 22 }}
            className="relative rounded-lg border border-danger/70 bg-danger/10 px-2 py-2.5 shadow-glow-danger"
          >
            <div className="grid grid-cols-[1fr_auto] gap-3 text-foreground">
              <span className="truncate">
                <span className="text-danger">CPT 99285</span>
                {" — "}Emergency Dept Visit, high severity
              </span>
              <span className="shrink-0 tabular-nums text-danger">$2,450.00</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded bg-danger px-1.5 py-0.5 text-[8px] uppercase tracking-widest text-background">
                <AlertTriangle className="size-2.5" />
                Upcoding Detected
              </span>
              <a
                href="https://www.cms.gov/medicare/physician-fee-schedule"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[8px] tracking-wide text-danger/70 hover:text-danger"
              >
                CMS §1833(e)
                <ExternalLink className="size-2.5" />
              </a>
            </div>
          </motion.div>

          {[
            { code: "CPT 36415", desc: "Venipuncture, routine", amount: "$28.00", strike: true },
            { code: "HCPCS J1100", desc: "Dexamethasone 1mg", amount: "$46.00" },
            { code: "CPT 71046", desc: "Chest X-ray, 2 views", amount: "$204.00" },
          ].map((row) => (
            <div
              key={row.code}
              className={`grid grid-cols-[1fr_auto] gap-3 rounded px-2 py-1.5 ${row.strike ? "opacity-50" : "text-muted-foreground"}`}
            >
              <span className={`truncate ${row.strike ? "line-through" : ""}`}>
                <span className="text-foreground/60">{row.code}</span>
                {" — "}
                {row.desc}
              </span>
              <span className={`shrink-0 tabular-nums ${row.strike ? "line-through" : ""}`}>
                {row.amount}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-foreground/80">
          <span className="uppercase tracking-widest">Total billed</span>
          <span className="tabular-nums font-semibold">$2,938.00</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-emerald">
          <span className="uppercase tracking-widest">After dispute</span>
          <span className="tabular-nums font-semibold">$1,098.00</span>
        </div>
      </div>
    </div>
  );
}

export function DisputeModal({
  claim,
  onClose,
  onAuthorize,
}: {
  claim: Claim | null;
  onClose: () => void;
  onAuthorize: () => void;
}) {
  const [tab, setTab] = useState<(typeof tabs)[number]>(tabs[0]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Reset tab when claim changes
  useEffect(() => {
    if (claim) setTab(tabs[0]);
  }, [claim?.id]);

  return (
    <AnimatePresence>
      {claim && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Dispute desk"
            initial={{ y: 40, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 24, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-border bg-card/90 shadow-panel backdrop-blur-2xl sm:rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <span className="grid size-8 place-items-center rounded-lg border border-danger/30 bg-danger/10">
                <Gavel className="size-4 text-danger" />
              </span>
              <div>
                <h2 className="text-sm font-semibold tracking-tight">
                  Dispute Desk
                </h2>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {claim.id} · {claim.provider}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="ml-auto grid size-8 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden">
              {/* Left: Realistic HCFA Document Viewer */}
              <div className="relative border-b border-border p-5 lg:border-b-0 lg:border-r lg:overflow-y-auto">
                <div className="pointer-events-none absolute inset-0 opacity-40 void-grid" />
                <div className="relative">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Itemized Statement · HCFA-1500
                  </p>
                  <HcfaDocumentViewer claim={claim} />
                </div>
              </div>

              {/* Right: Audit Intelligence */}
              <div className="flex min-h-0 flex-col p-5 lg:overflow-y-auto">
                {/* Stat cards */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-danger/25 bg-danger/[0.07] px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Detected Issue
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-danger">
                      Upcoding / Level 5
                    </p>
                    <p className="mt-0.5 text-[11px] text-danger/70">
                      Code Unbundling via Mod. 59
                    </p>
                  </div>
                  <div className="rounded-xl border border-cyan/25 bg-cyan-soft px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      Recommended Code
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-cyan">
                      CPT 99283
                    </p>
                    <p className="mt-0.5 text-[11px] text-cyan/70">
                      Medicare rate: $610.00
                    </p>
                  </div>
                </div>

                {/* Savings counter */}
                <div className="mt-4 rounded-xl border border-emerald/25 bg-emerald/[0.08] px-5 py-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Estimated Savings
                  </p>
                  <Counter target={claim.savings > 0 ? claim.savings : 1840} />
                </div>

                {/* CMS citation */}
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                  <ScrollText className="mt-0.5 size-4 shrink-0 text-cyan" />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    <span className="text-foreground">
                      CMS Interventional Coding Rules
                    </span>{" "}
                    — Modifier 59 Invalid. Bundled services may not be reported
                    separately when performed in the same encounter (NCCI
                    Policy §2.4).
                  </p>
                </div>

                {/* Tabs */}
                <div className="mt-5">
                  <div className="flex gap-1 rounded-lg border border-border bg-surface p-1">
                    {tabs.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`relative flex-1 rounded-md px-3 py-2 text-[11px] font-medium transition-colors ${
                          tab === t
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {tab === t && (
                          <motion.span
                            layoutId="tabPill"
                            className="absolute inset-0 rounded-md border border-cyan/25 bg-cyan-soft"
                            transition={{
                              type: "spring",
                              stiffness: 320,
                              damping: 30,
                            }}
                          />
                        )}
                        <span className="relative">{t}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 rounded-xl border border-border bg-surface p-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={tab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                      >
                        {tab === tabs[0] ? (
                          <ReasoningStepper />
                        ) : (
                          <div>
                            <div className="mb-3 flex items-center gap-2">
                              <Sparkles className="size-3.5 text-cyan" />
                              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                AI-Generated · Ready to send
                              </span>
                            </div>
                            <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-muted-foreground">
{`RE: Claim ${claim.id} — Request for Corrected Adjudication

To the Billing Department of ${claim.provider}:

We have reviewed the itemized statement dated ${claim.date}.
Line item CPT 99285 does not meet the documentation
threshold defined by CMS for high-severity emergency
services. Encounter documentation supports moderate
complexity MDM only; no critical care time recorded.

Additionally, Modifier 59 has been applied to CPT 36415
(Venipuncture) in violation of NCCI bundle edits, as
both services occurred in the same encounter session.

We request re-adjudication at CPT 99283 ($610.00) and
removal of the improperly unbundled line, a net reduction
of $1,840.00 from the original bill of $2,938.00.

Reference: CMS Pub. 100-04, Ch. 12, §30.6.1
NCCI Policy Manual §2.4 — Modifier 59 restrictions

Please confirm corrected adjudication within 30 days.

Respectfully,
MedAudit — Autonomous Audit Agent
audit-ref: ${claim.id}-dispute-${Date.now()}`}
                            </pre>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    onClick={onClose}
                    className="rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Dismiss / Mark Valid
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={onAuthorize}
                    className="rounded-lg bg-gradient-to-r from-emerald to-cyan px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow-cyan"
                  >
                    Authorize Dispute &amp; Dispatch
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
