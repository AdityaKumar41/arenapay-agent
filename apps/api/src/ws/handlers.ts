import { Server, Socket } from "socket.io";
import { logger } from "../lib/logger";

export function setupWebSocket(io: Server) {
  io.on("connection", (socket: Socket) => {
    logger.info("WebSocket client connected", { id: socket.id });

    socket.on("subscribe", (data: { channel: string; address: string }) => {
      const room = `${data.channel}:${data.address}`;
      socket.join(room);
      logger.info("Client subscribed", { id: socket.id, room });
    });

    socket.on("unsubscribe", (data: { channel: string; address: string }) => {
      const room = `${data.channel}:${data.address}`;
      socket.leave(room);
    });

    socket.on("disconnect", () => {
      logger.info("WebSocket client disconnected", { id: socket.id });
    });
  });
}

export function emitScoreUpdate(
  io: Server,
  address: string,
  data: Record<string, unknown>,
) {
  io.to(`score:${address}`).emit("score_update", data);
}

export function emitThreatAlert(
  io: Server,
  address: string,
  data: Record<string, unknown>,
) {
  io.to(`score:${address}`).emit("threat_alert", data);
}
