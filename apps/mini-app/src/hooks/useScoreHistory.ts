import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

export function useScoreHistory(address: string | null, days = 30) {
  return useQuery({
    queryKey: ["scoreHistory", address, days],
    queryFn: () => api.getScoreHistory(address!, days),
    enabled: !!address,
    staleTime: 60_000,
  });
}
