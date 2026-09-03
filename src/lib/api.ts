// src/lib/api.ts

// This represents the environment variable for your FastAPI backend
// In Vite, this would typically be import.meta.env.VITE_API_URL
const API_BASE = "http://localhost:8000/api/v1";

// Simple helper to grab the token (to be implemented with real Auth)
function getAuthToken() {
  return localStorage.getItem("medaudit_token") || "";
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

  getUploadPresignedUrl: (filename: string): Promise<{ presigned_url: string; document_id: string }> => {
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

  uploadToS3: async (presignedUrl: string, file: File) => {
    const response = await fetch(presignedUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });
    if (!response.ok) {
      throw new Error(`S3 Upload Error: ${response.statusText}`);
    }
    return true;
  },
};
