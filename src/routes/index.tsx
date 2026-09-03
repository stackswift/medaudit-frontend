import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { HudHeader } from "@/components/medaudit/HudHeader";
import { IngestionZone } from "@/components/medaudit/IngestionZone";
import { ClaimsFeed } from "@/components/medaudit/ClaimsFeed";
import { DisputeModal } from "@/components/medaudit/DisputeModal";
import { claims as seedClaims, type Claim } from "@/components/medaudit/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MedAudit — Autonomous Medical Billing Auditor" },
      {
        name: "description",
        content:
          "MedAudit audits medical claims autonomously: detects upcoding and unbundling, cites CMS rules, and dispatches disputes that recover real dollars.",
      },
      { property: "og:title", content: "MedAudit — Autonomous Medical Billing Auditor" },
      {
        property: "og:description",
        content:
          "Drop in EOBs and itemized bills. MedAudit flags coding violations, quantifies savings, and generates the dispute letter.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [claims, setClaims] = useState<Claim[]>(seedClaims);
  const [selected, setSelected] = useState<Claim | null>(null);

  const activeDocs = claims.filter((c) => c.status !== "Clean").length;
  const totalRecovered = claims
    .filter((c) => c.status === "Clean")
    .reduce((acc, c) => acc + c.savings, 7567);

  const handleIngest = (file: File) => {
    const claimId = `CLM-${Math.floor(10000 + Math.random() * 90000)}`;
    const cleanProviderName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const todayDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const newClaim: Claim = {
      id: claimId,
      provider: cleanProviderName || "Uploaded Medical Document",
      facility: file.type.includes("pdf") ? "PDF Statement Ingestion" : "OCR Image Scan",
      date: todayDate,
      savings: 0,
      status: "Parsing",
      npi: "1092837482",
      taxId: "94-2849102",
      patientId: `PT-${Math.floor(1000000 + Math.random() * 9000000)}`,
    };

    setClaims((prev) => [newClaim, ...prev]);
    toast.success("Audit initialized", {
      description: `${claimId} (${file.name}) prepended to Live Feed.`,
    });

    // Pipeline Step 1: Transition Parsing -> Cross-Referencing after 1.5s
    setTimeout(() => {
      setClaims((prev) =>
        prev.map((c) => (c.id === claimId ? { ...c, status: "Cross-Referencing" as const } : c)),
      );

      // Pipeline Step 2: Transition Cross-Referencing -> Action Required with audit breakdown after another 1.5s
      setTimeout(() => {
        setClaims((prev) =>
          prev.map((c) =>
            c.id === claimId
              ? {
                  ...c,
                  status: "Action Required" as const,
                  savings: 1840,
                  issueTitle: "Upcoding / Level 5 Emergency",
                  recommendedCode: "CPT 99283 · $610.00",
                }
              : c,
          ),
        );
        toast.info("Audit Action Required", {
          description: `${claimId} — Upcoding violation detected. Click row to open Dispute Desk.`,
        });
      }, 1600);
    }, 1400);
  };

  const handleAuthorize = () => {
    if (!selected) return;
    const recoveredAmount = selected.savings > 0 ? selected.savings : 1840;
    setClaims((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, status: "Clean" as const } : c)),
    );
    toast.success("Dispute Dispatched", {
      description: `${selected.id} — Form 837-DSP dispatched. $${recoveredAmount.toLocaleString("en-US")} marked for recovery.`,
    });
    setSelected(null);
  };

  return (
    <div className="min-h-screen void-grid bg-[#05070a] text-foreground font-sans">
      <HudHeader activeDocs={activeDocs} totalRecovered={totalRecovered} />

      <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-10 sm:px-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan shadow-glow-cyan">
            <span className="size-1.5 rounded-full bg-cyan animate-ping" />
            <span>Autonomous Audit Console</span>
          </div>
          <h1 className="mt-4 text-pretty text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground leading-tight">
            Every claim, line by line, against the{" "}
            <span className="text-gradient-emerald-cyan">coding rulebook.</span>
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground max-w-2xl">
            MedAudit agent runs continuously across incoming EOBs and 837P statements, flagging
            upcoding and unbundling violations, citing CMS NCCI rules, and dispatching appeals.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <IngestionZone onIngest={handleIngest} />
          <ClaimsFeed claims={claims} onSelect={setSelected} />
        </div>
      </main>

      <DisputeModal
        claim={selected}
        onClose={() => setSelected(null)}
        onAuthorize={handleAuthorize}
      />
    </div>
  );
}
