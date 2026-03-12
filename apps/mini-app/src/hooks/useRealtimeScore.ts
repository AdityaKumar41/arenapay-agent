import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket, connectSocket, subscribeToScore, unsubscribeFromScore, disconnectSocket } from "../services/ws";
import { useAppStore } from "../stores/appStore";

export function useRealtimeScore(address: string | null) {
  const queryClient = useQueryClient();
  const { setScore, addNotification } = useAppStore();

  useEffect(() => {
    if (!address) return;

    connectSocket();
    subscribeToScore(address);

    const socket = getSocket();

    const handleScoreUpdate = (data: {
      data: { address: string; score: number; tier: string };
    }) => {
      const { score, tier } = data.data;
      setScore(score, tier);
      queryClient.invalidateQueries({ queryKey: ["score", address] });
      addNotification({
        id: `score-${Date.now()}`,
        type: "score_update",
        message: `Score updated to ${score} (${tier})`,
        timestamp: Date.now(),
      });
    };

    const handleThreatAlert = (data: {
      data: { riskScore: number; flags: string[]; action: string };
    }) => {
      addNotification({
        id: `threat-${Date.now()}`,
        type: "threat_alert",
        message: `Threat detected: ${data.data.flags.join(", ")}`,
        timestamp: Date.now(),
      });
    };

    socket.on("score_update", handleScoreUpdate);
    socket.on("threat_alert", handleThreatAlert);

    return () => {
      socket.off("score_update", handleScoreUpdate);
      socket.off("threat_alert", handleThreatAlert);
      unsubscribeFromScore(address);
      disconnectSocket();
    };
  }, [address, queryClient, setScore, addNotification]);
}
