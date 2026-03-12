import { useQuery } from "@tanstack/react-query";
import { NETWORK } from "../utils/constants";

const TONCENTER_BASE =
  NETWORK === "mainnet"
    ? "https://toncenter.com/api/v2"
    : "https://testnet.toncenter.com/api/v2";

async function fetchBalance(address: string): Promise<string> {
  const res = await fetch(
    `${TONCENTER_BASE}/getAddressBalance?address=${encodeURIComponent(address)}`,
  );
  if (!res.ok) throw new Error("Failed to fetch balance");
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "getAddressBalance failed");
  return data.result as string; // value in nanoton as string
}

export function useWalletBalance(address: string | null) {
  return useQuery({
    queryKey: ["balance", address],
    queryFn: () => fetchBalance(address!),
    enabled: !!address,
    staleTime: 30_000,
    retry: 1,
  });
}
