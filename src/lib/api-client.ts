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
    let json: ApiResponse<T>;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        json = (await res.json()) as ApiResponse<T>;
      } catch (parseError) {
        console.error(`[API] JSON Parse Error at ${path}:`, parseError);
        throw new Error(`Invalid JSON response from ${path}`);
      }
    } else {
      const text = await res.text();
      console.error(`[API] Non-JSON response from ${path} (Status ${res.status}):`, text);
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
    console.error(`[API] Fatal request error for ${path}:`, error);
    throw error;
  }
}