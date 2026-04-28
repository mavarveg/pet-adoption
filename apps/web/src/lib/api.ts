const BASE_URL = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    const msg = Array.isArray(body.message) ? body.message.join(', ') : (body.message ?? res.statusText);
    throw new ApiError(res.status, msg);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthResult {
  accessToken: string;
  user: { id: string; email: string; name: string; role: string };
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age: number | null;
  description: string | null;
  imageUrl: string | null;
  status: 'available' | 'pending' | 'adopted';
  createdAt: string;
}

export interface PaginatedPets {
  data: Pet[];
  total: number;
  page: number;
  limit: number;
}

export interface Application {
  id: string;
  petId: string;
  petName: string;
  petSpecies: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string | null;
  createdAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    request<AuthResult>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<AuthResult>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
};

// ─── Pets ─────────────────────────────────────────────────────────────────────

export const petsApi = {
  list: (params: { page?: number; limit?: number; species?: string }) => {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.species) q.set('species', params.species);
    return request<PaginatedPets>(`/pets?${q.toString()}`);
  },

  getById: (id: string) => request<Pet>(`/pets/${id}`),

  create: (token: string, body: Partial<Pet>) =>
    request<Pet>('/pets', { method: 'POST', body: JSON.stringify(body) }, token),

  update: (token: string, id: string, body: Partial<Pet>) =>
    request<Pet>(`/pets/${id}`, { method: 'PATCH', body: JSON.stringify(body) }, token),
};

// ─── Applications ─────────────────────────────────────────────────────────────

export const applicationsApi = {
  submit: (token: string, body: { petId: string; message?: string }) =>
    request<Application>('/applications', { method: 'POST', body: JSON.stringify(body) }, token),

  mine: (token: string) =>
    request<Application[]>('/applications/me', {}, token),

  all: (token: string) =>
    request<Application[]>('/applications', {}, token),

  approve: (token: string, id: string) =>
    request<void>(`/applications/${id}/approve`, { method: 'PATCH', body: JSON.stringify({}) }, token),

  reject: (token: string, id: string) =>
    request<void>(`/applications/${id}/reject`, { method: 'PATCH', body: JSON.stringify({}) }, token),
};
