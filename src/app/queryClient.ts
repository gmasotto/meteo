import { QueryClient } from "@tanstack/react-query";
import { defaultQueryOptions } from "@/api/tanstack";

export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
});
