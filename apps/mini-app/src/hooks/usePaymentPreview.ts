import { useMutation } from "@tanstack/react-query";
import { api } from "../services/api";

export function usePaymentPreview() {
  return useMutation({
    mutationFn: ({
      senderAddress,
      recipientAddress,
      amountNanoton,
    }: {
      senderAddress: string;
      recipientAddress: string;
      amountNanoton: number;
    }) => api.previewPayment(senderAddress, recipientAddress, amountNanoton),
  });
}
