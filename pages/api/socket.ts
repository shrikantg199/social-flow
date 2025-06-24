import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";

const ioHandler = (req: NextApiRequest, res: NextApiResponse) => {
  if (!(res.socket as any).server.io) {
    console.log("*First use, starting socket.io");

    const io = new Server((res.socket as any).server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });

    io.on("connection", (socket) => {
      console.log("Socket.io: A user connected", socket.id);

      socket.on("joinConversation", (conversationId: string) => {
        socket.join(conversationId);
        console.log(`Socket.io: User ${socket.id} joined room ${conversationId}`);
      });

      socket.on("sendMessage", (data) => {
        io.to(data.conversationId).emit("newMessage", data);
        console.log(`Socket.io: Message sent in room ${data.conversationId}`);
      });

      socket.on("disconnect", () => {
        console.log("Socket.io: A user disconnected", socket.id);
      });
    });

    (res.socket as any).server.io = io;
  }
  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler; 