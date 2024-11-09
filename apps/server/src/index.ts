import initFastify, { setupFastify } from "./fastify/index.js";

// await initFastify();

const app = await setupFastify();

// index.js
export default async function handler(req: any, reply: any) {
  await app.ready();
  app.server.emit("request", req, reply);
}

await initFastify();
