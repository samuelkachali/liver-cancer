const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiError {
  detail: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (data: {
      email: string;
      full_name: string;
      password: string;
      role: 'nurse' | 'doctor' | 'admin';
      specialization?: string;
    }) =>
      apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logout: () =>
      apiRequest('/api/auth/logout', {
        method: 'POST',
      }),
    me: () => apiRequest('/api/auth/me'),
  },
  patients: {
    list: () => apiRequest('/api/patients'),
    create: (data: {
      hospital_number: string;
      name: string;
      age: number;
      gender: string;
      contact?: string;
      address?: string;
      symptoms?: string;
      file_url?: string;
      assigned_doctor_id?: string;
    }) =>
      apiRequest('/api/patients', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiRequest(`/api/patients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    assignDoctor: (id: string, doctor_id: string) =>
      apiRequest(`/api/patients/${id}/assign-doctor`, {
        method: 'POST',
        body: JSON.stringify({ doctor_id }),
      }),
  },
  diagnoses: {
    list: () => apiRequest('/api/diagnoses'),
    create: (data: {
      patient_id: string;
      confidence: number;
      scan_url?: string;
      notes?: string;
    }) =>
      apiRequest('/api/diagnoses', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { notes?: string; status?: string }) =>
      apiRequest(`/api/diagnoses/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
  admin: {
    users: () => apiRequest('/api/admin/users'),
    pendingUsers: () => apiRequest('/api/admin/users/pending'),
    verifyUser: (id: string) =>
      apiRequest(`/api/admin/users/${id}/verify`, {
        method: 'PATCH',
      }),
    rejectUser: (id: string) =>
      apiRequest(`/api/admin/users/${id}/reject`, {
        method: 'PATCH',
      }),
    deleteUser: (id: string) =>
      apiRequest(`/api/admin/users/${id}`, {
        method: 'DELETE',
      }),
    doctors: () => apiRequest('/api/admin/doctors'),
    logs: (action?: string) =>
      apiRequest(`/api/logs${action ? `?action=${encodeURIComponent(action)}` : ''}`),
  },
};
