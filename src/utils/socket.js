// src/utils/socket.js
import { io } from "socket.io-client";

let socket;

export function getSocket(baseURL) {
  if (!socket) {
    socket = io(baseURL, {
      transports: ["websocket", "polling"],
      withCredentials: false,
    });
  }
  return socket;
}
