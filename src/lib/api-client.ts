import { ApiResponse } from "../../shared/types"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  // Ensure we don't have double slashes if path starts with /
  const url = path.startsWith('/') ? path : `/${path}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Platform-Request': 'true'
      },
      ...init
    });
    const contentType = res.headers.get("content-type");
    let json: ApiResponse<T>;
    if (contentType && contentType.includes("application/json")) {
      try {
        json = (await res.json()) as ApiResponse<T>;
        if (json.detail) {
          console.error(`[API DETAIL ${url}]:`, json.detail);
        }
      } catch (parseError) {
        const text = await res.clone().text();
        throw new Error(`Invalid JSON response from ${url}: ${text.slice(0, 50)}`);
      }
    } else {
      const text = await res.text();
      if (res.status === 404) {
        throw new Error(`API Route Not Found: ${url}`);
      }
      throw new Error(`Server returned non-JSON response (${res.status}): ${text.slice(0, 100)}`);
    }
    if (!res.ok || !json.success) {
      const errorMessage = json.error || `Request failed with status ${res.status}`;
      throw new Error(errorMessage);
    }
    if (json.data === undefined) {
      throw new Error('API success but no data payload');
    }
    return json.data;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[API FATAL] ${url}:`, msg);
    throw error;
  }
}