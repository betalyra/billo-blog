import { setupFastify } from "../dist/fastify/index.js";

const app = await setupFastify();

// api/index.js
export default async function handler(req, reply) {
  await app.ready();
  app.server.emit("request", req, reply);
}
