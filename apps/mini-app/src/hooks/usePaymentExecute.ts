import { useMutation } from "@tanstack/react-query";
import { api } from "../services/api";

export function usePaymentExecute() {
  return useMutation({
    mutationFn: ({
      senderAddress,
      recipientAddress,
      amountNanoton,
    }: {
      senderAddress: string;
      recipientAddress: string;
      amountNanoton: number;
    }) => api.executePayment(senderAddress, recipientAddress, amountNanoton),
  });
}
