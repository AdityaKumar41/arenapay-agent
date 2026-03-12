import { API_URL } from "../utils/constants";
import type {
  ScoreResponse,
  PaymentPreview,
  PaymentExecution,
  ThreatAssessment,
  ScoreHistoryEntry,
  PaymentHistoryItem,
} from "../types";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

export const api = {
  getScore: (address: string) =>
    apiFetch<ScoreResponse>(`/api/v1/reputation/${address}`),

  refreshScore: (address: string) =>
    apiFetch<ScoreResponse>(`/api/v1/reputation/${address}/refresh`, {
      method: "POST",
    }),

  getScoreHistory: (address: string, days = 30) =>
    apiFetch<ScoreHistoryEntry[]>(
      `/api/v1/reputation/${address}/history?days=${days}`,
    ),

  previewPayment: (
    senderAddress: string,
    recipientAddress: string,
    amountNanoton: number,
  ) =>
    apiFetch<PaymentPreview>("/api/v1/payment/preview", {
      method: "POST",
      body: JSON.stringify({ senderAddress, recipientAddress, amountNanoton }),
    }),

  executePayment: (
    senderAddress: string,
    recipientAddress: string,
    amountNanoton: number,
  ) =>
    apiFetch<PaymentExecution>("/api/v1/payment/execute", {
      method: "POST",
      body: JSON.stringify({ senderAddress, recipientAddress, amountNanoton }),
    }),

  verifyIdentity: (tonAddress: string) =>
    apiFetch<{
      did: string;
      verified: boolean;
      credentials: unknown[];
      sessionId: string;
      verificationUrl?: string;
    }>("/api/v1/identity/verify", {
      method: "POST",
      body: JSON.stringify({ tonAddress }),
    }),

  checkThreat: (
    senderAddress: string,
    destinationAddress: string,
    amount: number,
  ) =>
    apiFetch<ThreatAssessment>("/api/v1/threat/check", {
      method: "POST",
      body: JSON.stringify({ senderAddress, destinationAddress, amount }),
    }),

  getPaymentHistory: (address: string, limit = 20) =>
    apiFetch<PaymentHistoryItem[]>(
      `/api/v1/payment/history/${address}?limit=${limit}`,
    ),
};
