import { type FastifyInstance, type FastifyRequest } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyRequest {
    bearerToken?: string;
  }
}

/**
 * This plugin adds bearer token extraction to Fastify requests
 *
 * @see https://github.com/fastify/fastify-plugin
 */
export default fp(async function (fastify: FastifyInstance) {
  fastify.log.info("💍 Registering bearer token plugin");

  fastify.addHook("onRequest", async (request: FastifyRequest) => {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return;
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new Error("No valid bearer token provided");
    }

    request.bearerToken = token;
  });

  fastify.decorateRequest("hasBearerToken", function (this: FastifyRequest) {
    return !!this.bearerToken;
  });
});
