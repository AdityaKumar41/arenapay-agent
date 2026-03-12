import { useMutation } from "@tanstack/react-query";
import { api } from "../services/api";

export function useIdentityVerify() {
  return useMutation({
    mutationFn: (tonAddress: string) => api.verifyIdentity(tonAddress),
  });
}
