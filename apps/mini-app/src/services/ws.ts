import { io, Socket } from "socket.io-client";
import { WS_URL } from "../utils/constants";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(WS_URL, {
      transports: ["websocket", "polling"],
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(): void {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}

export function subscribeToScore(address: string): void {
  const s = getSocket();
  s.emit("subscribe", { channel: "score", address });
}

export function unsubscribeFromScore(address: string): void {
  const s = getSocket();
  s.emit("unsubscribe", { channel: "score", address });
}
