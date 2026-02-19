import type { DefaultOptions } from "@tanstack/react-query";
import { ApiError } from "@/api/client";

export const defaultQueryOptions: DefaultOptions = {
  queries: {
    retry: (failureCount, error) => {
      const err = error as ApiError;

      if (!err?.status) return failureCount < 2;
      if (err.status >= 500) return failureCount < 2;

      return false;
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  },
};
