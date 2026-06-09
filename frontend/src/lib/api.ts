import { createSupabaseBrowserClient } from "./supabase/client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

async function getToken(): Promise<string | null> {
  const sb = createSupabaseBrowserClient();
  const { data } = await sb.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? "API error");
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path: string) => apiFetch(path, { method: "DELETE" }),
};

// Knowledge Documents
export const knowledgeApi = {
  list: (doc_type?: string) =>
    apiFetch<KnowledgeDocument[]>(doc_type ? `/knowledge?doc_type=${encodeURIComponent(doc_type)}` : "/knowledge"),
  create: (data: { title: string; content: string; doc_type: string }) =>
    apiFetch<KnowledgeDocument>("/knowledge", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<{ title: string; content: string; is_active: boolean }>) =>
    apiFetch<KnowledgeDocument>(`/knowledge/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch(`/knowledge/${id}`, { method: "DELETE" }),
};

// Features
export const featuresApi = {
  listTemplates: () => apiFetch<BusinessTemplate[]>("/features/templates"),
  getTenantFeatures: () => apiFetch<TenantFeature[]>("/features/tenant-features"),
  assignTemplate: (template_key: string) =>
    apiFetch("/features/tenant-features/assign", { method: "POST", body: JSON.stringify({ template_key }) }),
  toggleFeature: (key: string, enabled: boolean) =>
    apiFetch(`/features/tenant-features/${key}`, { method: "PATCH", body: JSON.stringify({ enabled }) }),
};

// Agent toggle
export const agentApi = {
  getStatus: () => apiFetch<{ enabled: boolean }>("/settings/agent-status"),
  toggle: () => apiFetch<{ enabled: boolean }>("/settings/agent-toggle", { method: "POST" }),
};

// Shared types
export interface KnowledgeDocument {
  id: string;
  tenant_id: string;
  title: string;
  content: string;
  doc_type: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessTemplate {
  id: string;
  key: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
}

export interface TenantFeature {
  id: string;
  feature_id: string;
  enabled: boolean;
  key: string;
  name: string;
}

export interface TenantSettings {
  id: string;
  business_name: string;
  ai_tone: string | null;
  ai_language: string | null;
  ai_custom_instructions: string | null;
  ai_agent_name: string | null;
  ai_strictness: string | null;
  business_type: string | null;
  template_key: string | null;
  business_hours: string | null;
  owner_phone: string | null;
}
