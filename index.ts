import { MessagesDatabase } from "./db";
import { FileSystemRouter, Server, ServerWebSocket } from "bun";

const messagesDatabase = new MessagesDatabase();
const connectedClients = new Set<ServerWebSocket<unknown>>(); // Maintain a set of connected WebSocket clients

const server = Bun.serve({
  async fetch(request: Request, server: Server) {
    const success = server.upgrade(request);
    if (success) {
      return undefined;
    }
    const router = new FileSystemRouter({
      dir: process.cwd() + "/routes",
      style: "nextjs",
    });

    const route = router.match(request);
    if (!route) {
      return new Response("Not found", { status: 404 });
    }
    console.log("route", route.filePath);
    // const file = Bun.file(route.filePath);
    const { default: fn } = await import(route.filePath!);
    const out = fn(request, server);
    return new Response(out);
  },
  websocket: {
    open(ws) {
      console.log("Connected", ws.remoteAddress);
      connectedClients.add(ws); // Add the new WebSocket client to the set
      // setInterval(() => {
      //   ws.send(`<header id="time">${new Date().toISOString()}</header>`);
      // }, 1000);
    },
    async message(ws, data) {
      const { message } = JSON.parse(data.toString());
      if (!message) return;

      messagesDatabase.addMessage(message);

      // Broadcast the message to all connected clients
      for (const client of connectedClients) {
        client.send(
          `<div id="messages" hx-swap-oob="beforeend"><div>You said: ${message}</div></div>`
        );
      }
    },
    close(ws) {
      connectedClients.delete(ws); // Remove the disconnected client from the set
    },
  },
});

console.log(`Listening on localhost: ${server.port}`);
