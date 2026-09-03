import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronDown,
  FileCheck,
  Gavel,
  Scale,
  ScrollText,
  ShieldAlert,
  Sparkles,
  Send,
  X,
} from "lucide-react";
import type { Claim } from "./data";

const tabs = ["Agent Logic Breakdown", "Generated Legal Dispute Letter Preview"] as const;

interface StepItem {
  number: number;
  title: string;
  detail: string;
  citation: string;
}

const reasoningSteps: StepItem[] = [
  {
    number: 1,
    title: "Documentation Deficit Analysis",
    detail:
      "Encounter documentation supports moderate complexity Medical Decision Making (MDM), not high severity with immediate threat to life or organ function.",
    citation: "CMS Evaluation & Management Guidelines (2026)",
  },
  {
    number: 2,
    title: "Critical Care & Vitals Validation",
    detail:
      "Zero critical care physician time recorded. Patient vital signs remained within baseline thresholds throughout the entire emergency department encounter.",
    citation: "CPT 99291 / 99285 MDM Criteria",
  },
  {
    number: 3,
    title: "NCCI Modifier 59 Unbundling Breach",
    detail:
      "Modifier 59 was improperly appended to routine venipuncture (CPT 36415) to bypass automated same-encounter bundling edits under NCCI Chapter 1.",
    citation: "CMS NCCI Policy Manual v30.1, Chap 1, Sec E",
  },
];

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
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!claim) return null;

  const npi = claim.npi ?? "1092837482";
  const taxId = claim.taxId ?? "94-2849102";
  const patientId = claim.patientId ?? "PT-9938102";
  const issueTitle = claim.issueTitle ?? "Upcoding / Level 5 Emergency";
  const recommendedCode = claim.recommendedCode ?? "CPT 99283 · $610.00";
  const savings = claim.savings > 0 ? claim.savings : 1840;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-[#05070a]/85 backdrop-blur-xl"
          onClick={onClose}
          aria-hidden
        />

        {/* Modal Dialog */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Dispute desk console"
          initial={{ y: 40, scale: 0.97, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 24, scale: 0.98, opacity: 0 }}
          transition={{ type: "spring", stiffness: 240, damping: 26 }}
          className="relative flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-border/80 bg-card/90 shadow-panel backdrop-blur-2xl sm:rounded-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <span className="grid size-9 place-items-center rounded-xl border border-danger/40 bg-danger/15 shadow-glow-danger">
                <Gavel className="size-4 text-danger animate-pulse" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold tracking-tight text-foreground">
                    Dispute Desk
                  </h2>
                  <span className="rounded-full bg-danger/15 px-2 py-0.5 font-mono text-[9px] font-bold text-danger border border-danger/30 uppercase tracking-widest">
                    AUDIT ACTION
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                  Claim Reference <span className="text-cyan font-semibold">{claim.id}</span> ·{" "}
                  {claim.provider}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="grid size-8 place-items-center rounded-lg border border-border bg-surface text-muted-foreground transition-all hover:border-cyan/40 hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* 2-Column Split Content */}
          <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2 lg:overflow-hidden">
            {/* Left Column: Authentic Invoice Document Viewer */}
            <div className="relative border-b border-border/80 p-6 lg:border-b-0 lg:border-r lg:overflow-y-auto bg-black/40">
              <div className="pointer-events-none absolute inset-0 opacity-40 micro-grid" />

              <div className="relative rounded-2xl border border-white/15 bg-white/[0.04] p-6 shadow-panel backdrop-blur-md font-mono text-[11px] leading-relaxed text-muted-foreground">
                {/* Invoice Header */}
                <div className="border-b border-border/80 pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-cyan" />
                        <h3 className="text-sm font-bold text-foreground tracking-tight">
                          {claim.provider}
                        </h3>
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {claim.facility} · Main Emergency Facility
                      </p>
                    </div>
                    <span className="rounded bg-white/10 px-2 py-1 text-[9px] uppercase tracking-wider text-foreground">
                      ITEMIZED BILL
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-[10px]">
                    <div>
                      <span className="block text-muted-foreground/70 uppercase">NPI Reg</span>
                      <span className="text-foreground font-semibold">{npi}</span>
                    </div>
                    <div>
                      <span className="block text-muted-foreground/70 uppercase">Tax ID</span>
                      <span className="text-foreground font-semibold">{taxId}</span>
                    </div>
                    <div>
                      <span className="block text-muted-foreground/70 uppercase">Patient Ref</span>
                      <span className="text-foreground font-semibold">{patientId}</span>
                    </div>
                  </div>
                </div>

                {/* Invoice Items */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground/80 border-b border-border/40 pb-1 uppercase tracking-wider">
                    <span>Code / Description</span>
                    <span>Billed Amount</span>
                  </div>

                  <Row code="CPT 80053" label="Comprehensive Metabolic Panel" amount="$92.00" />
                  <Row code="CPT 93010" label="Electrocardiogram, report only" amount="$118.00" />

                  {/* Disputed Upcoding Line with Glowing Neon Bounding Box */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 22 }}
                    className="relative rounded-xl border-2 border-danger bg-danger/15 px-3.5 py-3 shadow-glow-danger"
                  >
                    <div className="flex items-center justify-between gap-3 text-foreground font-semibold">
                      <span className="truncate text-xs">
                        CPT 99285 — Emergency Dept Visit, high severity
                      </span>
                      <span className="shrink-0 tabular-nums text-danger font-bold text-sm">
                        $2,450.00
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between border-t border-danger/30 pt-2 text-[10px]">
                      <span className="text-danger/90">Documentation level insufficient</span>
                      <span className="rounded bg-danger text-background px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest shadow-sm">
                        UPCODING DETECTED
                      </span>
                    </div>
                  </motion.div>

                  <Row code="CPT 36415" label="Venipuncture, routine" amount="$28.00" />
                  <Row code="HCPCS J1100" label="Dexamethasone 1mg Injection" amount="$46.00" />
                  <Row code="CPT 71046" label="Chest X-ray, 2 views" amount="$204.00" />
                </div>

                {/* Total Summary Footer */}
                <div className="mt-5 border-t border-border/80 pt-3 flex items-center justify-between text-foreground">
                  <span className="uppercase tracking-widest text-[10px] text-muted-foreground">
                    Total Statement Billed
                  </span>
                  <span className="font-mono text-sm font-bold tabular-nums">$2,938.00</span>
                </div>
              </div>
            </div>

            {/* Right Column: Audit Intelligence & Appeal Generator */}
            <div className="flex min-h-0 flex-col p-6 lg:overflow-y-auto space-y-5">
              {/* Stat Cards */}
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Detected Issue"
                  value={issueTitle}
                  tone="danger"
                  icon={<ShieldAlert className="size-4 text-danger" />}
                />
                <Field
                  label="Recommended Code"
                  value={recommendedCode}
                  tone="cyan"
                  icon={<FileCheck className="size-4 text-cyan" />}
                />
              </div>

              {/* Estimated Savings Highlight Box */}
              <div className="rounded-2xl border border-emerald/35 bg-emerald/10 p-5 shadow-glow-emerald">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald/80 font-bold">
                      ESTIMATED RECOVERABLE SAVINGS
                    </p>
                    <Counter target={savings} />
                  </div>
                  <div className="grid size-12 place-items-center rounded-2xl bg-emerald/20 border border-emerald/40 text-emerald">
                    <Scale className="size-6" />
                  </div>
                </div>
              </div>

              {/* NCCI Rule Citation Banner */}
              <div className="flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                <ScrollText className="mt-0.5 size-4 shrink-0 text-cyan" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">CMS Interventional NCCI v30.1 Edits:</strong>{" "}
                  Modifier 59 invalid. Bundled services may not be reported separately when
                  performed during the same emergency encounter.
                </p>
              </div>

              {/* Tab Switcher & Content */}
              <div>
                <div className="flex gap-1.5 rounded-xl border border-border bg-surface p-1">
                  {tabs.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`relative flex-1 rounded-lg px-3.5 py-2 text-[11px] font-semibold transition-colors ${
                        tab === t
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab === t && (
                        <motion.span
                          layoutId="activeDisputeTab"
                          className="absolute inset-0 rounded-lg border border-cyan/30 bg-cyan-soft shadow-glow-cyan"
                          transition={{ type: "spring", stiffness: 320, damping: 30 }}
                        />
                      )}
                      <span className="relative">{t}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-3 rounded-2xl border border-border/80 bg-surface p-4 min-h-52">
                  <AnimatePresence mode="wait">
                    {tab === tabs[0] ? (
                      <motion.div
                        key="stepper"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="space-y-3"
                      >
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                          Agent Reasoning Stepper (Chain-of-Thought)
                        </p>

                        {reasoningSteps.map((step) => {
                          const isExpanded = expandedStep === step.number;
                          return (
                            <div
                              key={step.number}
                              className={`rounded-xl border transition-all ${
                                isExpanded
                                  ? "border-cyan/40 bg-cyan/5"
                                  : "border-border/60 bg-transparent hover:border-border"
                              }`}
                            >
                              <button
                                onClick={() => setExpandedStep(isExpanded ? null : step.number)}
                                className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-xs font-semibold text-foreground"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="grid size-5 place-items-center rounded-full bg-cyan/20 text-[10px] font-mono text-cyan">
                                    {step.number}
                                  </span>
                                  <span>{step.title}</span>
                                </div>
                                <ChevronDown
                                  className={`size-4 text-muted-foreground transition-transform ${
                                    isExpanded ? "rotate-180 text-cyan" : ""
                                  }`}
                                />
                              </button>

                              {isExpanded && (
                                <div className="px-3.5 pb-3 pt-1 text-xs leading-relaxed text-muted-foreground border-t border-border/40">
                                  <p>{step.detail}</p>
                                  <p className="mt-2 font-mono text-[10px] text-cyan/90 flex items-center gap-1.5">
                                    <Sparkles className="size-3 text-cyan" />
                                    {step.citation}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="letter"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                      >
                        <div className="flex items-center justify-between border-b border-border/60 pb-2 mb-3 font-mono text-[10px] text-cyan">
                          <span>LEGAL APPEAL DISPATCH FORM</span>
                          <span>FORM 837-DSP</span>
                        </div>
                        <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-muted-foreground">
                          {`RE: Official Dispute — Claim ${claim.id}
To: Adjudication Dept, ${claim.provider} (NPI: ${npi})
Date: ${claim.date}

We hereby contest line item CPT 99285 ($2,450.00) on statement dated ${claim.date}.
Documentation submitted fails to support Level 5 complexity under CMS 2026 E&M guidelines.

Pursuant to NCCI Chapter 1 Section E, routine venipuncture (CPT 36415) is bundled and cannot be reported via Modifier 59.

REQUEST: Re-adjudicate at CPT 99283 ($610.00) with net savings adjustment of $${savings.toLocaleString("en-US")}.00.

Respectfully Submitted,
MedAudit Autonomous Appeal Agent`}
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end border-t border-border/80 pt-4">
                <button
                  onClick={onClose}
                  className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground"
                >
                  Dismiss / Mark Valid
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onAuthorize}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald to-cyan px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-glow-emerald hover:shadow-glow-cyan transition-all"
                >
                  <Send className="size-4 text-primary-foreground" />
                  <span>Authorize Dispute &amp; Dispatch</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Row({ code, label, amount }: { code: string; label: string; amount: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg hover:bg-white/[0.02]">
      <span className="truncate">
        <strong className="text-foreground">{code}</strong> — {label}
      </span>
      <span className="shrink-0 tabular-nums text-foreground">{amount}</span>
    </div>
  );
}

function Field({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: string;
  tone: "danger" | "cyan";
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3.5 ${
        tone === "danger" ? "border-danger/30 bg-danger/10" : "border-cyan/30 bg-cyan/10"
      }`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold">
          {label}
        </p>
      </div>
      <p className={`mt-1.5 text-sm font-bold ${tone === "danger" ? "text-danger" : "text-cyan"}`}>
        {value}
      </p>
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
    <p className="mt-1 font-mono text-4xl font-extrabold tabular-nums tracking-tight text-emerald">
      ${n.toLocaleString("en-US")}
      <span className="text-emerald/60">.00</span>
    </p>
  );
}
