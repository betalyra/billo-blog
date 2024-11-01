import { type FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import pino from "pino";
import * as fs from "fs/promises";

import { billoblogContract } from "@billo-blog/contract";
import { generateOpenApi } from "@ts-rest/open-api";

const logger = pino.default();

export default fp(async function (fastify: FastifyInstance) {
  logger.info(`Registering openapi.`);

  // const logo = await fs.readFile(`./logo.png`);
  const openApiDocument = generateOpenApi(billoblogContract, {
    info: {
      title: "billo.blog API",
      version: "1.0.0",
    },
  });

  await fastify.register(fastifySwagger, {
    transformObject: () => openApiDocument,
  });
  await fastify.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    // logo: { type: "image/png", content: logo },
  });
});
