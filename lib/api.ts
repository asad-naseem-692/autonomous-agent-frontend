import { getToken, clearSession } from "./auth";

const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const formattedBaseUrl =
  rawBaseUrl.startsWith("http://") || rawBaseUrl.startsWith("https://")
    ? rawBaseUrl
    : `https://${rawBaseUrl}`;
const BASE_URL = formattedBaseUrl.replace(/\/+$/, "");

export interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, headers = {}, ...rest } = options;
  const token = getToken();

  const reqHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (token && !skipAuth) {
    reqHeaders["Authorization"] = `Bearer ${token}`;
  }

  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...rest,
    headers: reqHeaders,
  });

  if (response.status === 401 && !skipAuth) {
    clearSession();
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
  }

  if (!response.ok) {
    let errorDetail = "An unexpected error occurred.";
    try {
      const errorJson = await response.json();
      if (typeof errorJson.detail === "string") {
        errorDetail = errorJson.detail;
      } else if (Array.isArray(errorJson.detail) && errorJson.detail.length > 0) {
        errorDetail = errorJson.detail
          .map((item: { msg?: string }) => item.msg || JSON.stringify(item))
          .join(", ");
      } else if (errorJson.message) {
        errorDetail = errorJson.message;
      }
    } catch {
      errorDetail = response.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }

  // Handle empty bodies (e.g. 204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

apiClient.get = <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  return apiClient<T>(endpoint, { ...options, method: "GET" });
};

apiClient.post = <T>(endpoint: string, body?: any, options: RequestOptions = {}): Promise<T> => {
  return apiClient<T>(endpoint, {
    ...options,
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
};

apiClient.put = <T>(endpoint: string, body?: any, options: RequestOptions = {}): Promise<T> => {
  return apiClient<T>(endpoint, {
    ...options,
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
};

apiClient.patch = <T>(endpoint: string, body?: any, options: RequestOptions = {}): Promise<T> => {
  return apiClient<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
};

apiClient.delete = <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  return apiClient<T>(endpoint, { ...options, method: "DELETE" });
};
