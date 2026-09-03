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

  const handleIngest = () => {
    const id = `CLM-${88300 + claims.length}`;
    setClaims((prev) => [
      {
        id,
        provider: "Incoming Upload",
        facility: "Parsing document",
        date: "Sep 3, 2026",
        savings: 0,
        status: "Auditing",
      },
      ...prev,
    ]);
    toast.success("Document queued", { description: `${id} handed to the audit agent.` });
  };

  const handleAuthorize = () => {
    if (!selected) return;
    setClaims((prev) =>
      prev.map((c) => (c.id === selected.id ? { ...c, status: "Clean" as const } : c)),
    );
    toast.success("Dispute dispatched", {
      description: `${selected.id} — letter sent, $1,840.00 pending recovery.`,
    });
    setSelected(null);
  };

  return (
    <div className="min-h-screen void-grid">
      <HudHeader activeDocs={activeDocs} />

      <main className="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6">
        <div className="max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan">
            Audit console
          </p>
          <h1 className="mt-3 text-pretty text-3xl font-semibold tracking-tight sm:text-4xl">
            Every claim, line by line, against the coding rulebook.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The agent runs continuously across incoming statements, surfacing only what needs a
            human signature.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
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
