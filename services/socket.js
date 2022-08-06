import socketIoClient from "socket.io-client";
import { get } from "./cookies";

let socket;

export const connectMainIo = () => {
  socket = socketIoClient(process.env.REACT_APP_API_ACCOUNT_URL);
  socket.on("connect_error", err => {});
  socket.on("connect", () => {
    socket.emit("SiteSocket", {
      token: get("token"),
      site_id: 6,
    });
  });
};
