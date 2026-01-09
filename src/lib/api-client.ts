import { ApiResponse } from "../../shared/types"
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const res = await fetch(path, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      ...init
    });
    const contentType = res.headers.get("content-type");
    let json: ApiResponse<T>;
    if (contentType && contentType.includes("application/json")) {
      try {
        json = (await res.json()) as ApiResponse<T>;
        if (json.detail) {
          console.error(`[SERVER DETAIL ${path} ${res.status}]:`, json.detail);
        }
      } catch (parseError) {
        const text = await res.clone().text();
        console.error(`[API] JSON Parse Error at ${path}. Status: ${res.status}. Content: ${text.slice(0, 100)}`);
        throw new Error(`Invalid JSON response from ${path}`);
      }
    } else {
      const text = await res.text();
      console.error(`[API] Non-JSON response from ${path} (Status ${res.status}):`, text.slice(0, 200));
      if (res.status === 500) {
        throw new Error(`Worker Error: ${text || 'Check worker logs'}`);
      }
      throw new Error(`Server returned non-JSON response: ${res.status}`);
    }
    if (!res.ok || !json.success) {
      const errorMessage = json.error || `Request failed with status ${res.status}`;
      console.warn(`[API] ${res.status} ${path}:`, errorMessage);
      throw new Error(errorMessage);
    }
    if (json.data === undefined) {
      console.error(`[API] Success true but data missing at ${path}`);
      throw new Error('API success but no data payload');
    }
    return json.data;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[API] Fatal request error for ${path}:`, msg);
    throw error;
  }
}