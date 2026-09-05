import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  Building2,
  ChevronDown,
  FileCheck,
  Scale,
  ScrollText,
  Sparkles,
  Send,
  X,
} from "lucide-react";
import type { Claim } from "./data";
import { approveDispute, dismissDispute } from "@/lib/api";
import { LegalLetterViewer } from "./LegalLetterViewer";

const tabs = ["Agent Logic Breakdown", "Generated Legal Dispute Letter Preview"] as const;

interface StepItem {
  number: number;
  title: string;
  detail: string;
  citation: string;
}

export function DisputeModal({
  claim,
  documentDetail,
  onClose,
  onAuthorize,
}: {
  claim: Claim | null;
  documentDetail?: any;
  onClose: () => void;
  onAuthorize: () => void;
}) {
  const [tab, setTab] = useState<(typeof tabs)[number]>(tabs[0]);
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!claim) return null;

  const handleApproveAction = async () => {
    setIsSubmitting(true);
    try {
      await approveDispute(claim.id);
    } catch (e) {
      console.error("Approve dispute error:", e);
    } finally {
      setIsSubmitting(false);
      onAuthorize();
    }
  };

  const handleDismissAction = async () => {
    setIsSubmitting(true);
    try {
      await dismissDispute(claim.id);
    } catch (e) {
      console.error("Dismiss dispute error:", e);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  const npi = claim.provider_info?.npi ?? claim.npi ?? "1092837482";
  const taxId = claim.taxId ?? "94-2849102";
  const patientId = claim.patient_info?.policy_id ?? claim.patientId ?? "PT-9938102";
  const providerName = claim.provider_info?.name ?? claim.provider;

  const issueTitle = claim.issueTitle ?? "⚠️ Potential Upcoding / Documentation Review Warranted";

  // Check backend disputed_codes
  const backendDisputed = (documentDetail?.disputed_codes || claim.disputed_codes)?.[0];
  const billedAmount = backendDisputed?.billed_amount ?? claim.billedAmount ?? 1250;
  const benchmarkRate = backendDisputed?.medicare_baseline ?? claim.benchmarkRate ?? 610;
  const recommendedCode =
    backendDisputed?.standard_description ??
    claim.recommendedCode ??
    `CPT 99283 · $${benchmarkRate.toFixed(2)}`;

  // Dynamic recovery: charged_amount - benchmark_rate
  const savings = Math.max(0, billedAmount - benchmarkRate);

  const ncciIndicator = claim.ncciModifierIndicator ?? 0;
  const confidenceScore = claim.confidenceScore ?? 89.4;
  const evidenceJustification =
    documentDetail?.agent_reasoning ??
    claim.agent_reasoning ??
    claim.evidenceJustification ??
    "CPT 99285 represents High-Complexity Medical Decision Making (MDM). Itemized billing lacks corresponding high-acuity diagnostics. Recommend verifying complete physician documentation for CPT 99283/99284 equivalence.";

  const items = claim.billedItems ?? [
    { code: "CPT 80053", label: "Comprehensive Metabolic Panel", amount: 92 },
    { code: "CPT 93010", label: "Electrocardiogram, report only", amount: 118 },
    {
      code: `CPT ${backendDisputed?.cpt_code ?? "99285"}`,
      label: backendDisputed?.billed_description ?? "Emergency Dept Visit, high severity",
      amount: billedAmount,
      disputed: true,
    },
    { code: "CPT 36415", label: "Venipuncture, routine", amount: 28 },
    { code: "CPT 71046", label: "Chest X-ray, 2 views", amount: 204 },
  ];

  const totalBilled = items.reduce((sum, item) => sum + item.amount, 0);

  const defaultSteps: StepItem[] = [
    {
      number: 1,
      title: "Documentation Deficit Analysis",
      detail:
        evidenceJustification ||
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
      title: `NCCI Modifier Indicator ${ncciIndicator} Inspection`,
      detail:
        ncciIndicator === 0
          ? "Unbundling is prohibited under CMS NCCI Chapter 1 rules. Modifier 59 cannot be used to bypass automated bundling edits for this procedure pair."
          : "Modifier 59 is only valid if clinical documentation confirms a distinct procedural service, separate site, or independent encounter.",
      citation: "CMS NCCI Policy Manual v30.1, Chap 1, Sec E",
    },
  ];

  const steps = claim.reasoningSteps ?? defaultSteps;

  const letterMarkdown =
    documentDetail?.dispute_letter_markdown ||
    claim.dispute_letter_markdown ||
    `# FORMAL MEDICAL BILLING DISPUTE & AUDIT NOTICE

**To:** ${providerName} (NPI: ${npi})  
**From:** Policyholder (Policy ID: ${patientId})  
**Statement Date:** ${claim.date}  
**Total Disputed Charges:** $${savings.toLocaleString("en-US", { minimumFractionDigits: 2 })}  

---

### Notice of Disputed Line Items
The following billed line items have been identified with compliance discrepancies:

| CPT Code | Description | Billed Amount | Medicare Baseline | Issue |
|---|---|---|---|---|
| ${backendDisputed?.cpt_code ?? "99285"} | ${backendDisputed?.billed_description ?? "Emergency Dept Visit, high severity"} | $${billedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })} | $${benchmarkRate.toFixed(2)} | UPCODING |

### Auditor Reasoning & Grounds for Appeal
${evidenceJustification}

### CMS NCCI Compliance Reference
- **NCCI Indicator:** ${ncciIndicator} (${ncciIndicator === 0 ? "Unbundling prohibited under Chapter 1 rules" : "Requires distinct modifier justification"})
- **Citation:** CMS NCCI Policy Manual v30.1, Chap 1, Sec E

### Demand for Adjustment
Please re-adjudicate line item CPT ${backendDisputed?.cpt_code ?? "99285"} to benchmark CPT 99283 ($${benchmarkRate.toFixed(2)}) with recoverable savings adjustment of **$${savings.toLocaleString("en-US", { minimumFractionDigits: 2 })}**.

Respectfully Submitted,  
**MedAudit Autonomous Billing Auditor**`;

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
          onClick={handleDismissAction}
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
              <span className="grid size-9 place-items-center rounded-xl border border-amber-500/40 bg-amber-500/15 shadow-glow-amber">
                <AlertTriangle className="size-4 text-amber-400 animate-pulse" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold tracking-tight text-foreground">
                    Dispute Desk
                  </h2>
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-mono text-[9px] font-bold text-amber-400 border border-amber-500/30 uppercase tracking-widest">
                    DOCUMENTATION DEFICIT WARNING
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                  Claim Reference <span className="text-cyan font-semibold">{claim.id}</span> ·{" "}
                  {providerName}
                </p>
              </div>
            </div>

            <button
              onClick={handleDismissAction}
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
                          {providerName}
                        </h3>
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {claim.facility} · Extracted PDF Statement
                      </p>
                    </div>
                    <span className="rounded bg-white/10 px-2 py-1 text-[9px] uppercase tracking-wider text-foreground">
                      EXTRACTED INVOICE
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-[10px]">
                    <div>
                      <span className="block text-muted-foreground/70 uppercase">NPI Reg</span>
                      <strong className="text-foreground">{npi}</strong>
                    </div>
                    <div>
                      <span className="block text-muted-foreground/70 uppercase">Tax ID</span>
                      <strong className="text-foreground">{taxId}</strong>
                    </div>
                    <div>
                      <span className="block text-muted-foreground/70 uppercase">Patient ID</span>
                      <strong className="text-foreground">{patientId}</strong>
                    </div>
                  </div>
                </div>

                {/* Line Items List */}
                <div className="mt-4 space-y-1">
                  <div className="flex items-center justify-between font-bold uppercase tracking-wider text-muted-foreground/80 pb-1 border-b border-border/40 text-[9px]">
                    <span>Procedure Line Item</span>
                    <span>Billed</span>
                  </div>
                  {items.map((item) => (
                    <div
                      key={item.code}
                      className={
                        item.disputed
                          ? "rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-200"
                          : ""
                      }
                    >
                      <Row code={item.code} label={item.label} amount={`$${item.amount.toFixed(2)}`} />
                    </div>
                  ))}
                </div>

                {/* Subtotal & Flagged Line Summary */}
                <div className="mt-4 border-t border-border/80 pt-3 flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Total Invoiced</span>
                  <span className="font-bold text-foreground font-mono">
                    ${totalBilled.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="mt-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 flex items-start gap-2.5">
                  <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-[10px] leading-relaxed">
                    <p className="font-bold text-amber-300 uppercase tracking-wider">
                      Flagged Line Item Discrepancy
                    </p>
                    <p className="mt-0.5 text-amber-200/90">
                      Line item <strong>CPT {backendDisputed?.cpt_code ?? "99285"}</strong> ($
                      {billedAmount.toFixed(2)}) is challenged for clinical upcoding. Benchmark
                      medicare rate is ${benchmarkRate.toFixed(2)}.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Dispute Desk Workspace */}
            <div className="flex flex-col p-6 lg:overflow-y-auto bg-card/60">
              <div className="flex-1 space-y-5">
                {/* Potential Recovery Banner Card */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald/30 bg-emerald/10 p-5 shadow-glow-emerald">
                  <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-emerald/20 blur-2xl" />
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-emerald/80 font-bold">
                        Recoverable Disparity Identified
                      </span>
                      <Counter target={savings > 0 ? savings : 640} />
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald/40 bg-emerald/20 px-2.5 py-1 text-[10px] font-mono font-bold text-emerald">
                      <Scale className="size-3" />
                      <span>CMS CPT Validated</span>
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Automated dynamic calculation comparing billed charges directly against CMS
                    Medicare baseline standard rates.
                  </p>
                </div>

                {/* Audit Evidence Fields */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field
                    icon={<AlertTriangle className="size-3.5 text-amber-400" />}
                    label="Audit Rule Flagged"
                    value={issueTitle}
                    tone="warning"
                  />
                  <Field
                    icon={<FileCheck className="size-3.5 text-cyan" />}
                    label="Re-Adjudicate Benchmark"
                    value={recommendedCode}
                    tone="cyan"
                  />
                </div>

                {/* Tabs: Chain-of-Thought Stepper vs Legal Dispute Letter */}
                <div>
                  <div className="flex gap-2 rounded-xl border border-border/80 bg-surface p-1">
                    {tabs.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`relative flex-1 rounded-lg px-3 py-2 font-mono text-xs font-semibold transition-all ${
                          tab === t
                            ? "text-cyan shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {tab === t && (
                          <motion.span
                            layoutId="tabPill"
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

                          {steps.map((step) => {
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
                          <LegalLetterViewer markdown={letterMarkdown} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Action Buttons Footer */}
                <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end border-t border-border/80 pt-4">
                  <button
                    onClick={handleDismissAction}
                    disabled={isSubmitting}
                    className="rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground disabled:opacity-50"
                  >
                    Dismiss / Mark Valid
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleApproveAction}
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald to-cyan px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-glow-emerald hover:shadow-glow-cyan transition-all disabled:opacity-50"
                  >
                    <Send className="size-4 text-primary-foreground" />
                    <span>{isSubmitting ? "Processing..." : "Authorize Dispute & Dispatch"}</span>
                  </motion.button>
                </div>
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
  tone: "warning" | "cyan";
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3.5 ${
        tone === "warning" ? "border-amber-500/30 bg-amber-500/10" : "border-cyan/30 bg-cyan/10"
      }`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-bold">
          {label}
        </p>
      </div>
      <p
        className={`mt-1.5 text-xs font-bold leading-tight ${tone === "warning" ? "text-amber-300" : "text-cyan"}`}
      >
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
