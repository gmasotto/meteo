import { QueryClient } from "@tanstack/react-query";

export class ApiError extends Error {
  public status;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const err = error as ApiError;

        // network error (no status): retry un paio di volte
        if (!err?.status) return failureCount < 2;

        // 5xx: retry un paio di volte
        if (err.status >= 500) return failureCount < 2;

        // 400/401/403/404/429: NON retry (inutile/spam)
        return false;
      },
      refetchOnWindowFocus: false,
      // 5 minuti
      staleTime: 1000 * 60 * 5,
    },
  },
});
