import { ApiResponse } from "../../shared/types"
/**
 * Universal API client for fetching data from both Worker and Serverless environments.
 * Optimized for high reliability and detailed error reporting.
 */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith('/') ? path : `/${path}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-FiscalFlow-Client': 'web'
      },
      ...init
    });
    const contentType = res.headers.get("content-type");
    let json: ApiResponse<T>;
    if (contentType && contentType.includes("application/json")) {
      try {
        json = (await res.json()) as ApiResponse<T>;
        if (json.detail) {
          console.warn(`[API INFO ${url}]:`, json.detail);
        }
      } catch (parseError) {
        const text = await res.clone().text();
        throw new Error(`Data format error from ${url}: ${text.slice(0, 50)}...`);
      }
    } else {
      const text = await res.text();
      if (res.status === 404) {
        throw new Error(`Endpoint not found: ${url}`);
      }
      throw new Error(`Unexpected server response (${res.status}): ${text.slice(0, 100)}`);
    }
    if (!res.ok || !json.success) {
      const errorMessage = json.error || `Request failed (${res.status})`;
      throw new Error(errorMessage);
    }
    if (json.data === undefined) {
      throw new Error('Server returned success but missing data payload');
    }
    return json.data;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    // Silent logging for production, visible for debugging
    console.error(`[API FAIL] ${url}:`, msg);
    throw error;
  }
}