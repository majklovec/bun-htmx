import { Elysia, ws } from "elysia";
import { html } from "@elysiajs/html";

new Elysia()
  .use(html())
  .use(ws())
  .get("/", () => Bun.file("public/index.html").text())
  .ws("/ws", {
    open(ws) {
      setInterval(() => {
        ws.send(`<div id="time">${new Date().toISOString()}</div>`);
      }, 1000);
    },
  })
  .listen(3000);
