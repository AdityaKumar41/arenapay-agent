import { useTonAddress } from "@tonconnect/ui-react";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "../stores/appStore";
import { api } from "../services/api";
import TransactionRow from "../components/TransactionRow";
import EmptyState from "../components/EmptyState";
import { SkeletonBlock } from "../components/SkeletonLoader";
import type { PaymentHistoryItem } from "../types";

function groupByDate(items: PaymentHistoryItem[]): { label: string; items: PaymentHistoryItem[] }[] {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const groups: Map<string, PaymentHistoryItem[]> = new Map();
  for (const item of items) {
    const d = new Date(item.createdAt);
    let label: string;
    if (d.toDateString() === today.toDateString()) {
      label = "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      label = "Yesterday";
    } else {
      label = d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
    }
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(item);
  }

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

export default function HistoryScreen() {
  const address = useTonAddress();
  const { setScreen } = useAppStore();

  const {
    data: history,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["payment-history", address],
    queryFn: () => api.getPaymentHistory(address!, 50),
    enabled: !!address,
    staleTime: 30_000,
  });

  const groups = history ? groupByDate(history) : [];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Tab-screen inline header */}
      <div className="px-4 pt-5 pb-4">
        <h1 className="text-xl font-bold">History</h1>
        {history && history.length > 0 && (
          <p className="text-xs text-white/40 mt-1">{history.length} transactions</p>
        )}
      </div>

      <div className="flex-1 px-4 pb-6 space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-[72px]" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon="alert"
            title="Failed to load history"
            description="Check your connection and try again"
            action={{ label: "Retry", onClick: () => refetch() }}
          />
        ) : !history || history.length === 0 ? (
          <EmptyState
            icon="send"
            title="No transactions yet"
            description="Your payment history will appear here after your first transaction"
            action={{ label: "Send Payment", onClick: () => setScreen("send-payment") }}
          />
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              <p className="text-[11px] font-semibold text-white/35 uppercase tracking-wider mb-2 px-1">
                {group.label}
              </p>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <TransactionRow key={item.id} item={item} myAddress={address!} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
