import { setupFastify } from "../fastify/index.js";

const app = await setupFastify();

export default async function handler(req: any, reply: any) {
  await app.ready();
  app.server.emit("request", req, reply);
}
