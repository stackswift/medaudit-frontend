// src/lib/api.ts

// This represents the environment variable for your FastAPI backend
// In Vite, this would typically be import.meta.env.VITE_API_URL
const API_BASE = "http://localhost:8000/api/v1";

// Simple helper to grab the token (to be implemented with real Auth)
function getAuthToken() {
  // Use a mock token by default in development so backend Auth passes
  return localStorage.getItem("medaudit_token") || "mock-token-dev-user";
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export type DocumentResponse = {
  id: string;
  filename: string;
  status: string;
  savings?: number | null;
  created_at: string;
  updated_at: string;
};

export type DocumentDetailResponse = DocumentResponse & {
  patient_info: string | null;
  provider_info: string | null;
  disputed_codes: any[] | null;
  agent_reasoning: string | null;
  dispute_letter_markdown: string | null;
};

export const api = {
  getDocuments: (): Promise<DocumentResponse[]> => {
    return fetchWithAuth("/documents");
  },

  getDocumentDetail: (id: string): Promise<DocumentDetailResponse> => {
    return fetchWithAuth(`/documents/${id}`);
  },

  getUploadPresignedUrl: (filename: string): Promise<{ upload_url: string; document_id: string; fields: Record<string, string>; is_mock?: boolean }> => {
    return fetchWithAuth("/presign", {
      method: "POST",
      body: JSON.stringify({ filename }),
    });
  },

  triggerProcessing: (id: string): Promise<{ message: string; document_id: string; status: string }> => {
    return fetchWithAuth(`/documents/${id}/process`, {
      method: "POST",
    });
  },

  approveDispute: (id: string): Promise<{ id: string; document_id: string; status: string; message: string }> => {
    return fetchWithAuth(`/disputes/${id}/approve`, {
      method: "POST",
    });
  },

  dismissDispute: (id: string): Promise<{ id: string; document_id: string; status: string; message: string }> => {
    return fetchWithAuth(`/disputes/${id}/dismiss`, {
      method: "POST",
    });
  },

  // S3 presigned POST — sends a multipart/form-data body with the
  // signed fields returned by the backend, then appends the file last.
  uploadToS3: async (uploadUrl: string, file: File, fields: Record<string, string>) => {
    const form = new FormData();
    // S3 requires all policy fields before the file
    for (const [key, value] of Object.entries(fields)) {
      form.append(key, value);
    }
    form.append("file", file);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: form,
    });
    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error(`S3 Upload Error: ${text || response.statusText}`);
    }
    return true;
  },
};
