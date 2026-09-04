import type {
  ClaimStatus,
  DisputedCodeItem,
  PatientInfo,
  ProviderInfo,
} from "@/components/medaudit/data";

const API_BASE_URL =
  (typeof process !== "undefined" && process.env["NEXT_PUBLIC_API_BASE_URL"]) ||
  "http://localhost:8000";

export interface PresignResponse {
  upload_url: string;
  document_id: string;
  fields: Record<string, string>;
}

export interface BackendDocumentResponse {
  id: string;
  filename: string;
  status: ClaimStatus;
  created_at: string;
  updated_at: string;
}

export interface BackendDocumentDetailResponse extends BackendDocumentResponse {
  patient_info?: PatientInfo;
  provider_info?: ProviderInfo;
  disputed_codes?: DisputedCodeItem[];
  agent_reasoning?: string;
  dispute_letter_markdown?: string;
}

export interface DisputeActionResponse {
  id: string;
  document_id: string;
  status: "APPROVED" | "DISMISSED";
  message: string;
  timestamp: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error [${response.status}]: ${errorText || response.statusText}`);
  }

  return response.json();
}

/**
 * 1. Request AWS S3 Presigned Upload URL
 */
export async function presignUpload(filename: string): Promise<PresignResponse> {
  return request<PresignResponse>("/api/v1/presign", {
    method: "POST",
    body: JSON.stringify({
      filename,
      content_type: "application/pdf",
    }),
  });
}

/**
 * 2. Upload file directly to S3 bucket
 */
export async function uploadToS3(presign: PresignResponse, file: File): Promise<void> {
  const form = new FormData();
  Object.entries(presign.fields || {}).forEach(([k, v]) => form.append(k, v));
  form.append("file", file);

  const res = await fetch(presign.upload_url, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    throw new Error(`S3 Upload failed with status ${res.status}`);
  }
}

/**
 * 3. Trigger document OCR/LLM audit pipeline
 */
export async function triggerDocumentProcess(
  documentId: string,
): Promise<{ message: string; document_id: string }> {
  return request<{ message: string; document_id: string }>(
    `/api/v1/documents/${documentId}/process`,
    {
      method: "POST",
    },
  );
}

/**
 * 4. List all documents and statuses
 */
export async function getDocuments(): Promise<BackendDocumentResponse[]> {
  return request<BackendDocumentResponse[]>("/api/v1/documents");
}

/**
 * 5. Get full detail for single document with dispute audit findings
 */
export async function getDocumentDetail(
  documentId: string,
): Promise<BackendDocumentDetailResponse> {
  return request<BackendDocumentDetailResponse>(`/api/v1/documents/${documentId}`);
}

/**
 * 6. Approve dispute and queue formal letter dispatch
 */
export async function approveDispute(disputeId: string): Promise<DisputeActionResponse> {
  return request<DisputeActionResponse>(`/api/v1/disputes/${disputeId}/approve`, {
    method: "POST",
  });
}

/**
 * 7. Dismiss dispute
 */
export async function dismissDispute(disputeId: string): Promise<DisputeActionResponse> {
  return request<DisputeActionResponse>(`/api/v1/disputes/${disputeId}/dismiss`, {
    method: "POST",
  });
}
