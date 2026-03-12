import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

export function useAresScore(address: string | null) {
  return useQuery({
    queryKey: ["score", address],
    queryFn: () => api.getScore(address!),
    enabled: !!address,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
