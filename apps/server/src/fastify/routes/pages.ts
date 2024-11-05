import { initServer } from "@ts-rest/fastify";
import { type FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { billoblogContract } from "@billo-blog/contract";
import {
  BlogServiceLive,
  GitHubServiceLive,
  EnvServiceLive,
  BlogService,
  DrizzlePostgresProviderLive,
  DrizzlePostgresProvider,
} from "@billo-blog/core";
import { fastifyCookie } from "@fastify/cookie";

import { Effect, Either, Layer, Logger, Option } from "effect";
import { SessionServiceLive } from "@billo-blog/core/dist/session/service.js";
import { UserServiceLive } from "@billo-blog/core/dist/services/user/service.js";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { JWTServiceLive } from "@billo-blog/core/dist/services/auth/token.js";
import { TokenProvider } from "@billo-blog/core/dist/services/auth/token-provider.js";
import { BlogStoreServiceLive } from "@billo-blog/core/dist/services/store/blog/service.js";

export default fp(async function (fastify: FastifyInstance) {
  const s = initServer();
  const client = postgres(fastify.env.POSTGRES_URL, {
    // max: 1,
    ssl: fastify.env.POSTGRES_SSL_CERTIFICATE
      ? {
          mode: "verify-ca",
          sslrootcert: Buffer.from(
            fastify.env.POSTGRES_SSL_CERTIFICATE,
            "base64"
          ),
          rejectUnauthorized: false,
        }
      : false,
  });
  const postgresDrizzle = drizzle(client, {
    casing: "snake_case",
  });
  const PostgresProvider = Layer.succeed(DrizzlePostgresProvider)({
    postgresDrizzle,
  });
  const Dependencies = BlogServiceLive.pipe(
    Layer.provideMerge(
      Layer.mergeAll(
        GitHubServiceLive,
        Logger.pretty,
        Logger.minimumLogLevel(fastify.env.LOG_LEVEL),
        SessionServiceLive,
        UserServiceLive,
        JWTServiceLive,
        BlogStoreServiceLive
      )
    ),
    Layer.provideMerge(PostgresProvider),
    Layer.provideMerge(EnvServiceLive)
  );
  const router = s.router(billoblogContract, {
    createOAuth: async ({ params: { provider }, reply }) => {
      const program = Effect.gen(function* () {
        const { createOAuth } = yield* BlogService;
        return yield* createOAuth({ provider });
      });

      const runnable = Effect.provide(program, Dependencies);
      const result = await Effect.runPromise(runnable);

      const cookie = fastifyCookie.serialize("state", result.state, {
        maxAge: 60 * 5,
        httpOnly: true,
        secure: fastify.env.SESSION_COOKIE_SECURE,
        sameSite: "lax",
        path: "/",
        domain: fastify.env.SESSION_COOKIE_URL?.split("://")[1],
      });

      return reply.header("Set-Cookie", cookie).redirect(result.url.toString());
    },
    validateOAuth: async ({
      params: { provider },
      query: { code, state },
      request,
      reply,
    }) => {
      const storedState = request.cookies.state;
      if (!storedState || storedState !== state) {
        console.error(
          `Invalid state: storedState: ${storedState} state: ${state}`
        );
        return reply.status(400).send({ error: "Invalid state" });
      }

      const program = Effect.gen(function* () {
        const { validateOAuth } = yield* BlogService;
        return yield* validateOAuth({ provider }, { code, state });
      });

      const runnable = Effect.provide(program, Dependencies);
      const result = await Effect.runPromise(runnable);

      return { status: 200, body: result };
    },
    createBlog: async ({ body, request }) => {
      const token = request.bearerToken;
      if (!token) {
        return { status: 401, body: { error: "Unauthorized" } };
      }

      const Deps = Dependencies.pipe(
        Layer.provideMerge(
          Layer.succeed(TokenProvider)({
            accessToken: Option.some(token),
          })
        )
      );
      const program = Effect.gen(function* () {
        const { createBlog } = yield* BlogService;
        return yield* createBlog(body);
      });

      const runnable = Effect.provide(program, Deps);
      const result = await Effect.runPromise(runnable);

      return {
        status: 200,
        body: { publicId: result.publicId },
      };
    },
    getBlogs: async ({ query, request }) => {
      const token = request.bearerToken;
      if (!token) {
        return { status: 401, body: { error: "Unauthorized" } };
      }

      const Deps = Dependencies.pipe(
        Layer.provideMerge(
          Layer.succeed(TokenProvider)({
            accessToken: Option.some(token),
          })
        )
      );
      const program = Effect.gen(function* () {
        const { getBlogs } = yield* BlogService;
        return yield* getBlogs(query);
      });

      const runnable = Effect.provide(program, Deps);
      const result = await Effect.runPromise(runnable);

      return {
        status: 200,
        body: result,
      };
    },
    getBlog: async ({ params: { blogId } }) => {
      return {
        status: 200,
        body: {
          id: "1",
          name: "Blog 1",
          slug: "blog-1",
          publicId: "1",
          created: "2021-01-01",
        },
      };
    },
    updateBlog: async ({ params: { blogId }, body }) => {
      return {
        status: 200,
        body: {
          publicId: "1",
        },
      };
    },
    deleteBlog: async ({ params: { blogId } }) => {
      return {
        status: 200,
        body: {},
      };
    },
    createArticle: async ({ params: { blogId }, body, request }) => {
      const token = request.bearerToken;
      if (!token) {
        return { status: 401, body: { error: "Unauthorized" } };
      }

      const Deps = Dependencies.pipe(
        Layer.provideMerge(
          Layer.succeed(TokenProvider)({
            accessToken: Option.some(token),
          })
        )
      );
      const program = Effect.gen(function* () {
        const { createArticle } = yield* BlogService;
        return yield* createArticle({ blogId }, body);
      });

      const runnable = Effect.provide(program, Deps);
      const result = await Effect.runPromise(runnable);

      return {
        status: 200,
        body: { publicId: result.publicId },
      };
    },
    getArticles: async ({ params: { blogId }, query: { limit, page } }) => {
      return {
        status: 200,
        body: {
          articles: [],
          count: 0,
          page: 0,
          limit: 0,
        },
      };
    },
    getArticle: async ({ params: { blogId, articleId } }) => {
      return {
        status: 200,
        body: {
          publicId: "1",
          slug: "article-1",
          authors: ["1"],
          og: {
            title: "Article 1",
            description: "Article 1",
            image: "https://example.com/image.jpg",
            url: "https://example.com/article-1",
            type: "article",
            siteName: "Site 1",
            locale: "en-US",
          },
          ogArticle: {
            type: "article",
            title: "Article 1",
            description: "Article 1",
            image: "https://example.com/image.jpg",
            url: "https://example.com/article-1",
            siteName: "Site 1",
            publishedTime: "2021-01-01",
            modifiedTime: "2021-01-01",
            expirationTime: "2021-01-01",
            author: [
              {
                name: "Author 1",
                profileUrl: "https://example.com/author-1",
                socialProfiles: [
                  {
                    platform: "twitter",
                    url: "https://example.com/author-1",
                  },
                ],
              },
            ],
            section: "1",
            tag: ["1"],
          },
          blocks: [],
        },
      };
    },
    updateArticle: async ({ params: { blogId, articleId }, body }) => {
      return {
        status: 200,
        body: {
          publicId: "1",
        },
      };
    },
    deleteArticle: async ({ params: { blogId, articleId } }) => {
      return {
        status: 200,
        body: {},
      };
    },
  });
  fastify.register(s.plugin(router), {});
});
