import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ClaimsFeed } from "@/components/medaudit/ClaimsFeed";
import { DisputeModal } from "@/components/medaudit/DisputeModal";
import { HudHeader } from "@/components/medaudit/HudHeader";
import { IngestionZone } from "@/components/medaudit/IngestionZone";
import { api, type BackendDocumentDetailResponse } from "@/lib/api";
import type { Claim, ClaimStatus } from "@/components/medaudit/data";

function mapBackendToClaim(doc: any): Claim {
  const s = String(doc.status || "").toUpperCase();
  let status: ClaimStatus = "Auditing";
  if (s === "DISPUTED" || s === "COMPLETED" || s === "FAILED" || s === "ERROR" || s === "ACTION REQUIRED") {
    status = "Action Required";
  } else if (s === "CLEARED" || s === "CLEAN") {
    status = "Clean";
  } else {
    status = "Auditing";
  }

  let savings = doc.savings || 0;
  if ("disputed_codes" in doc && Array.isArray(doc.disputed_codes) && doc.disputed_codes.length > 0) {
    savings = doc.disputed_codes.reduce((acc: number, code: any) => {
      const billed = Number(code.billed_amount || 0);
      const baseline = Number(code.medicare_baseline || 0);
      return acc + Math.max(0, billed - baseline);
    }, 0);
  }

  return {
    id: doc.id,
    provider: doc.filename,
    facility: s === "DISPUTED" ? "Dispute Ready" : String(doc.status || "").replace("_", " "),
    date: new Date(doc.created_at || Date.now()).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    savings: Math.round(savings),
    status,
    filename: doc.filename,
    disputed_codes: doc.disputed_codes,
    agent_reasoning: doc.agent_reasoning,
    dispute_letter_markdown: doc.dispute_letter_markdown,
    patient_info: doc.patient_info,
    provider_info: doc.provider_info,
  };
}

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
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  // Poll backend every 3 seconds for processed claims
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: api.getDocuments,
    refetchInterval: 3000,
  });

  // Fetch full details (audit findings & legal letter) when a claim is selected
  const { data: selectedDocument } = useQuery<BackendDocumentDetailResponse>({
    queryKey: ["document", selectedClaimId],
    queryFn: () => api.getDocumentDetail(selectedClaimId!),
    enabled: !!selectedClaimId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const { upload_url, fields, document_id, is_mock } = await api.getUploadPresignedUrl(file.name);
      // In dev/mock mode the backend has no real S3 bucket — skip the S3 upload
      if (!is_mock) {
        await api.uploadToS3(upload_url, file, fields);
      }
      await api.triggerProcessing(document_id);
      return document_id;
    },
    onSuccess: (documentId) => {
      toast.success("Document queued for audit", {
        description: `${documentId} handed to the audit agent.`,
      });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (error) => {
      toast.error("Upload failed", { description: (error as Error).message });
    },
  });

  const claims = documents.map(mapBackendToClaim);
  const activeDocs = claims.filter((c) => c.status !== "Clean").length;
  const totalRecovered = claims
    .filter((c) => c.status === "Clean")
    .reduce((sum, c) => sum + (c.savings || 0), 0);

  const handleIngest = (file: File) => {
    uploadMutation.mutate(file);
  };

  const authorizeMutation = useMutation({
    mutationFn: async (claimId: string) => {
      return await api.approveDispute(claimId);
    },
    onSuccess: (data) => {
      toast.success("Dispute dispatched", {
        description: `${data.document_id || selectedClaimId} — formal appeal queued for transmission.`,
      });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setSelectedClaimId(null);
    },
    onError: (err) => {
      toast.error("Failed to dispatch dispute", {
        description: (err as Error).message,
      });
    },
  });

  const handleAuthorize = () => {
    if (!selectedClaimId) return;
    authorizeMutation.mutate(selectedClaimId);
  };

  const selectedClaim = selectedDocument
    ? mapBackendToClaim(selectedDocument)
    : claims.find((c) => c.id === selectedClaimId) || null;

  return (
    <div className="min-h-screen void-grid bg-[#05070a] text-foreground font-sans">
      <HudHeader activeDocs={activeDocs} totalRecovered={totalRecovered || 7567} />

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
          {isLoading ? (
            <div className="flex items-center justify-center p-8 text-sm text-muted-foreground font-mono">
              Loading audited claims...
            </div>
          ) : (
            <ClaimsFeed claims={claims} onSelect={(c) => setSelectedClaimId(c.id)} />
          )}
        </div>
      </main>

      <DisputeModal
        claim={selectedClaim}
        onClose={() => setSelectedClaimId(null)}
        onAuthorize={handleAuthorize}
      />
    </div>
  );
}
