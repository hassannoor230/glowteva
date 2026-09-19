const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface RequestOptions extends RequestInit {
  token?: string | null;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;
    let requestToken = token;
    const isFormData = typeof FormData !== 'undefined' && fetchOptions.body instanceof FormData;
    const headers: HeadersInit = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    };

    const send = (authorizationToken?: string | null) => {
      const requestHeaders = { ...headers } as Record<string, string>;
      if (authorizationToken) requestHeaders.Authorization = `Bearer ${authorizationToken}`;
      return fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchOptions,
        headers: requestHeaders,
        credentials: 'include',
      });
    };

    let res = await send(requestToken);

    if (res.status === 401 && endpoint !== '/auth/refresh' && typeof window !== 'undefined') {
      try {
        const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          requestToken = refreshData.data?.accessToken;
          if (requestToken) {
            const { useAuthStore } = await import('@/store/auth');
            useAuthStore.getState().setToken(requestToken);
            res = await send(requestToken);
          }
        } else {
          const { useAuthStore } = await import('@/store/auth');
          await useAuthStore.getState().logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } catch {
        const { useAuthStore } = await import('@/store/auth');
        await useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    const data = await res.json();

    if (!res.ok) {
      const fieldErrors = data.errors && typeof data.errors === 'object'
        ? Object.entries(data.errors).map(([field, message]) => `${field}: ${message}`).join('\n')
        : '';
      throw new Error(fieldErrors ? `${data.message || 'Validation failed'}\n${fieldErrors}` : (data.message || 'Something went wrong'));
    }

    return data;
  }

  get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  }

  put<T>(endpoint: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient(API_URL);
