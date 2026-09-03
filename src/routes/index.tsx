import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HudHeader } from "@/components/medaudit/HudHeader";
import { IngestionZone } from "@/components/medaudit/IngestionZone";
import { ClaimsFeed } from "@/components/medaudit/ClaimsFeed";
import { DisputeModal } from "@/components/medaudit/DisputeModal";
import { type Claim } from "@/components/medaudit/data";
import { api, type DocumentResponse, type DocumentDetailResponse } from "@/lib/api";

const mapBackendToClaim = (doc: DocumentResponse): Claim => {
  let status: Claim["status"] = "Auditing";
  if (doc.status === "COMPLETED") status = "Action Required";
  if (doc.status === "CLEAN") status = "Clean";
  if (doc.status === "FAILED") status = "Action Required"; // Or handle failure appropriately

  return {
    id: doc.id,
    provider: doc.filename, // We use filename as a fallback until full details are loaded
    facility: doc.status.replace("_", " "),
    date: new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    savings: 0, // In a real app, savings would come from the dispute details
    status,
  };
};

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
  const queryClient = useQueryClient();
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: api.getDocuments,
    refetchInterval: 5000, // Poll every 5s while audits run
  });

  const { data: selectedDocument } = useQuery({
    queryKey: ["document", selectedClaimId],
    queryFn: () => api.getDocumentDetail(selectedClaimId!),
    enabled: !!selectedClaimId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const { presigned_url, document_id } = await api.getUploadPresignedUrl(file.name);
      await api.uploadToS3(presigned_url, file);
      await api.triggerProcessing(document_id);
      return document_id;
    },
    onSuccess: (documentId) => {
      toast.success("Document queued", { description: `${documentId} handed to the audit agent.` });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
    onError: (error) => {
      toast.error("Upload failed", { description: (error as Error).message });
    },
  });

  const claims = documents.map(mapBackendToClaim);
  const activeDocs = claims.filter((c) => c.status !== "Clean").length;

  const handleIngest = (file: File) => {
    uploadMutation.mutate(file);
  };

  const handleAuthorize = () => {
    if (!selectedClaimId) return;
    toast.success("Dispute dispatched", {
      description: `${selectedClaimId} — letter sent, pending recovery.`,
    });
    setSelectedClaimId(null);
  };

  // Map the selectedDocument detail back to a Claim for the modal if needed
  const selectedClaim = selectedDocument ? mapBackendToClaim(selectedDocument) : null;

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
          {isLoading ? (
            <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">Loading claims...</div>
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
