// src/lib/api.ts
import type {
  ClaimStatus,
  DisputedCodeItem,
  PatientInfo,
  ProviderInfo,
} from "@/components/medaudit/data";

// In Vite/Vercel, configure VITE_API_URL (e.g. https://api.yourdomain.com)
const rawApiUrl =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
  "http://localhost:8000";

export const API_BASE = rawApiUrl.endsWith("/api/v1") ? rawApiUrl : `${rawApiUrl}/api/v1`;

// Simple helper to grab the token (to be implemented with real Auth / Cognito)
export function getAuthToken(): string {
  if (typeof window === "undefined") return "mock-token-dev-user";
  return localStorage.getItem("medaudit_token") || "mock-token-dev-user";
}

export async function fetchWithAuth<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => response.statusText);
    throw new Error(`API Error [${response.status}]: ${errorText || response.statusText}`);
  }

  return response.json();
}

export interface PresignResponse {
  upload_url: string;
  document_id: string;
  fields: Record<string, string>;
  is_mock?: boolean;
}

export interface BackendDocumentResponse {
  id: string;
  filename: string;
  status: ClaimStatus | string;
  savings?: number | null;
  created_at: string;
  updated_at: string;
}

export interface BackendDocumentDetailResponse extends BackendDocumentResponse {
  patient_info?: PatientInfo | string | null;
  provider_info?: ProviderInfo | string | null;
  disputed_codes?: DisputedCodeItem[] | any[] | null;
  agent_reasoning?: string | null;
  dispute_letter_markdown?: string | null;
}

export interface DisputeActionResponse {
  id: string;
  document_id: string;
  status: "APPROVED" | "DISMISSED" | string;
  message: string;
  timestamp?: string;
}

export type DocumentResponse = BackendDocumentResponse;
export type DocumentDetailResponse = BackendDocumentDetailResponse;

/**
 * 1. Request AWS S3 Presigned Upload URL
 */
export async function presignUpload(filename: string): Promise<PresignResponse> {
  return fetchWithAuth<PresignResponse>("/presign", {
    method: "POST",
    body: JSON.stringify({ filename }),
  });
}

/**
 * 2. Upload file directly to S3 bucket via presigned multipart POST
 */
export async function uploadToS3(
  presignOrUrl: PresignResponse | string,
  file: File,
  fields?: Record<string, string>,
): Promise<boolean> {
  const uploadUrl = typeof presignOrUrl === "string" ? presignOrUrl : presignOrUrl.upload_url;
  const formFields = typeof presignOrUrl === "string" ? (fields || {}) : (presignOrUrl.fields || {});

  const form = new FormData();
  // S3 requires all signed policy fields before the file entry
  for (const [key, value] of Object.entries(formFields)) {
    form.append(key, value);
  }
  form.append("file", file);

  const res = await fetch(uploadUrl, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText);
    throw new Error(`S3 Upload failed with status [${res.status}]: ${errorText || res.statusText}`);
  }
  return true;
}

/**
 * 3. Trigger document OCR/LLM audit pipeline
 */
export async function triggerDocumentProcess(
  documentId: string,
): Promise<{ message: string; document_id: string; status?: string }> {
  return fetchWithAuth<{ message: string; document_id: string; status?: string }>(
    `/documents/${documentId}/process`,
    {
      method: "POST",
    },
  );
}

/**
 * 4. List all documents and statuses
 */
export async function getDocuments(): Promise<BackendDocumentResponse[]> {
  return fetchWithAuth<BackendDocumentResponse[]>("/documents");
}

/**
 * 5. Get full detail for single document with dispute audit findings
 */
export async function getDocumentDetail(
  documentId: string,
): Promise<BackendDocumentDetailResponse> {
  return fetchWithAuth<BackendDocumentDetailResponse>(`/documents/${documentId}`);
}

/**
 * 6. Approve dispute and queue formal letter dispatch
 */
export async function approveDispute(disputeId: string): Promise<DisputeActionResponse> {
  return fetchWithAuth<DisputeActionResponse>(`/disputes/${disputeId}/approve`, {
    method: "POST",
  });
}

/**
 * 7. Dismiss dispute
 */
export async function dismissDispute(disputeId: string): Promise<DisputeActionResponse> {
  return fetchWithAuth<DisputeActionResponse>(`/disputes/${disputeId}/dismiss`, {
    method: "POST",
  });
}

export const api = {
  getDocuments,
  getDocumentDetail,
  getUploadPresignedUrl: presignUpload,
  triggerProcessing: triggerDocumentProcess,
  approveDispute,
  dismissDispute,
  uploadToS3,
};
