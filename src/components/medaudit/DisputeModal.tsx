import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Gavel, ScrollText, Sparkles, X } from "lucide-react";
import type { Claim } from "./data";

const tabs = ["Agent Logic Summary", "Generated Legal Letter Preview"] as const;

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
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-border bg-card/85 shadow-panel backdrop-blur-2xl sm:rounded-2xl"
          >
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <span className="grid size-8 place-items-center rounded-lg border border-danger/30 bg-danger/10">
                <Gavel className="size-4 text-danger" />
              </span>
              <div>
                <h2 className="text-sm font-semibold tracking-tight">Dispute Desk</h2>
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
              {/* Left: mock PDF */}
              <div className="relative border-b border-border p-5 lg:border-b-0 lg:border-r lg:overflow-y-auto">
                <div className="pointer-events-none absolute inset-0 opacity-60 void-grid" />
                <div className="relative rounded-xl border border-border bg-white/[0.04] p-5 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  <div className="flex items-center justify-between border-b border-border pb-3 text-foreground/80">
                    <span className="uppercase tracking-widest">Itemized Statement</span>
                    <span>{claim.date}</span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Row code="CPT 80053" label="Comprehensive Metabolic Panel" amount="$92.00" />
                    <Row code="CPT 93010" label="Electrocardiogram, report only" amount="$118.00" />

                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.18, type: "spring", stiffness: 220, damping: 22 }}
                      className="relative rounded-lg border border-danger/60 bg-danger/10 px-3 py-2.5 shadow-glow-danger"
                    >
                      <div className="flex items-center justify-between gap-3 text-foreground">
                        <span className="truncate">
                          CPT 99285 — Emergency Dept Visit, high severity
                        </span>
                        <span className="shrink-0 tabular-nums text-danger">$2,450.00</span>
                      </div>
                      <span className="absolute -top-2.5 left-3 rounded bg-danger px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-background">
                        Flagged
                      </span>
                    </motion.div>

                    <Row code="CPT 36415" label="Venipuncture, routine" amount="$28.00" />
                    <Row code="HCPCS J1100" label="Dexamethasone 1mg" amount="$46.00" />
                    <Row code="CPT 71046" label="Chest X-ray, 2 views" amount="$204.00" />
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-foreground/80">
                    <span className="uppercase tracking-widest">Total billed</span>
                    <span className="tabular-nums">$2,938.00</span>
                  </div>
                </div>
              </div>

              {/* Right: inspector */}
              <div className="flex min-h-0 flex-col p-5 lg:overflow-y-auto">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Detected Issue" value="Upcoding / Code Unbundling" tone="danger" />
                  <Field label="Recommended Code" value="CPT 99283 · $610.00" tone="cyan" />
                </div>

                <div className="mt-4 rounded-xl border border-emerald/25 bg-emerald/[0.08] px-5 py-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Estimated Savings
                  </p>
                  <Counter target={1840} />
                </div>

                <div className="mt-4 flex items-start gap-3 rounded-xl border border-border bg-surface px-4 py-3">
                  <ScrollText className="mt-0.5 size-4 shrink-0 text-cyan" />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    <span className="text-foreground">CMS Interventional Coding Rules</span> —
                    Modifier 59 Invalid. Bundled services may not be reported separately when
                    performed in the same encounter.
                  </p>
                </div>

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
                            transition={{ type: "spring", stiffness: 320, damping: 30 }}
                          />
                        )}
                        <span className="relative">{t}</span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 min-h-40 rounded-xl border border-border bg-surface p-4">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={tab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                      >
                        {tab === tabs[0] ? (
                          <ul className="space-y-2.5 text-xs leading-relaxed text-muted-foreground">
                            {[
                              "Encounter documentation supports moderate complexity MDM, not high severity with threat to life.",
                              "No critical care time recorded; vitals remained within stable thresholds for the full visit.",
                              "Modifier 59 appended to venipuncture despite same-session bundling under NCCI edits.",
                              "Level downgrade 99285 → 99283 aligns with documented history, exam, and MDM.",
                            ].map((line) => (
                              <li key={line} className="flex gap-2.5">
                                <Sparkles className="mt-0.5 size-3.5 shrink-0 text-cyan" />
                                <span>{line}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-muted-foreground">
                            {`RE: Claim ${claim.id} — Request for Corrected Adjudication

To the Billing Department of ${claim.provider}:

We have reviewed the itemized statement dated ${claim.date}.
Line item CPT 99285 does not meet the documentation
threshold defined by CMS for high-severity emergency
services. Additionally, Modifier 59 has been applied to a
bundled service in violation of NCCI edits.

We request re-adjudication at CPT 99283 ($610.00) and
removal of the improperly unbundled line, a net reduction
of $1,840.00. Please confirm within 30 days.

Respectfully,
MedAudit — Autonomous Audit Agent`}
                          </pre>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    onClick={onClose}
                    className="rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Dismiss
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

function Row({ code, label, amount }: { code: string; label: string; amount: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-1.5">
      <span className="truncate">
        {code} — {label}
      </span>
      <span className="shrink-0 tabular-nums">{amount}</span>
    </div>
  );
}

function Field({ label, value, tone }: { label: string; value: string; tone: "danger" | "cyan" }) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        tone === "danger" ? "border-danger/25 bg-danger/[0.07]" : "border-cyan/25 bg-cyan-soft"
      }`}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-1.5 text-sm font-medium ${tone === "danger" ? "text-danger" : "text-cyan"}`}
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
    <p className="mt-1 font-mono text-4xl font-bold tabular-nums tracking-tight text-emerald">
      ${n.toLocaleString("en-US")}
      <span className="text-emerald/60">.00</span>
    </p>
  );
}
