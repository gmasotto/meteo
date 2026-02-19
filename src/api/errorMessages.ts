import { isApiError } from "@/api/client";

export function getApiStatusMessage(error: unknown, fallback: string): string {
  if (!isApiError(error) || !error.status) {
    return fallback;
  }

  if (error.status === 404) {
    return `${fallback} (not found).`;
  }

  if (error.status === 401) {
    return `${fallback} (unauthorized API key).`;
  }

  if (error.status === 429) {
    return `${fallback} (rate limit reached).`;
  }

  if (error.status >= 500) {
    return `${fallback} (server error).`;
  }

  return `${fallback} (HTTP ${error.status}).`;
}
