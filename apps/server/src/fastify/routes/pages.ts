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
    createApiToken: async ({ body, request }) => {
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
        const { createApiToken } = yield* BlogService;
        return yield* createApiToken(body);
      }).pipe(Effect.either);
      const runnable = Effect.provide(program, Deps);
      const result = await Effect.runPromise(runnable);
      if (Either.isLeft(result)) {
        return { status: 500, body: { error: "Internal server error" } };
      }
      return { status: 200, body: result.right };
    },
    getApiToken: async ({ params: { tokenId }, request }) => {
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
        const { getApiToken } = yield* BlogService;
        return yield* getApiToken({ tokenId });
      }).pipe(Effect.either);
      const runnable = Effect.provide(program, Deps);
      const result = await Effect.runPromise(runnable);
      if (Either.isLeft(result)) {
        return { status: 500, body: { error: "Internal server error" } };
      }
      if (Option.isNone(result.right)) {
        return { status: 404, body: { error: "Token not found" } };
      }
      return { status: 200, body: result.right.value };
    },
    getApiTokens: async ({ query, request }) => {
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
        const { getApiTokens } = yield* BlogService;
        return yield* getApiTokens(query);
      }).pipe(Effect.either);
      const runnable = Effect.provide(program, Deps);
      const result = await Effect.runPromise(runnable);
      if (Either.isLeft(result)) {
        return { status: 500, body: { error: "Internal server error" } };
      }
      return { status: 200, body: result.right };
    },
    revokeApiToken: async ({ params: { tokenId }, request }) => {
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
        const { revokeApiToken } = yield* BlogService;
        return yield* revokeApiToken({ tokenId });
      }).pipe(Effect.either);
      const runnable = Effect.provide(program, Deps);
      const result = await Effect.runPromise(runnable);
      if (Either.isLeft(result)) {
        return { status: 500, body: { error: "Internal server error" } };
      }
      return { status: 200, body: result.right };
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
        body: { blogId: result.blogId },
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
    getBlog: async ({ params: { blogId }, request }) => {
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
        const { getBlog } = yield* BlogService;
        return yield* getBlog({ blogId });
      });
      const runnable = Effect.provide(program, Deps);
      const result = await Effect.runPromise(runnable);

      if (Option.isNone(result)) {
        return { status: 404, body: { error: "Blog not found" } };
      }

      return {
        status: 200,
        body: result.value,
      };
    },
    updateBlog: async ({ params: { blogId }, body }) => {
      return {
        status: 200,
        body: {
          blogId: "1",
        },
      };
    },
    deleteBlog: async ({ params: { blogId } }) => {
      return {
        status: 200,
        body: {},
      };
    },
    createDraft: async ({ params: { blogId }, body, request }) => {
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
        const { createDraft } = yield* BlogService;
        return yield* createDraft({ blogId }, body);
      }).pipe(Effect.either);

      const runnable = Effect.provide(program, Deps);
      const result = await Effect.runPromise(runnable);

      if (Either.isLeft(result)) {
        fastify.log.error(result.left);
        return {
          status: 500,
          body: { error: "Internal server error" },
        };
      }
      return {
        status: 200,
        body: result.right,
      };
    },
    getDrafts: async ({
      params: { blogId },
      query: { limit, page },
      request,
    }) => {
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
        const { getDrafts } = yield* BlogService;
        return yield* getDrafts({ blogId }, { limit, page });
      });
      const runnable = Effect.provide(program, Deps);
      const result = await Effect.runPromise(runnable);

      return {
        status: 200,
        body: result,
      };
    },
    getDraft: async ({ params: { blogId, draftId }, request }) => {
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
        const { getDraft } = yield* BlogService;
        return yield* getDraft({ blogId, draftId });
      });
      const runnable = Effect.provide(program, Deps);
      const result = await Effect.runPromise(runnable);

      if (Option.isNone(result)) {
        return { status: 404, body: { error: "Draft not found" } };
      }

      return {
        status: 200,
        body: result.value,
      };
    },
    updateDraft: async ({ params: { blogId, draftId }, body, request }) => {
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
        const { updateDraft } = yield* BlogService;
        return yield* updateDraft({ blogId, draftId }, body);
      }).pipe(Effect.either);
      const runnable = Effect.provide(program, Deps);
      const result = await Effect.runPromise(runnable);

      if (Either.isLeft(result)) {
        fastify.log.error(result.left);
        return {
          status: 500,
          body: { error: "Internal server error" },
        };
      }
      return {
        status: 200,
        body: result.right,
      };
    },
    deleteDraft: async ({ params: { blogId, draftId }, request }) => {
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
        const { deleteDraft } = yield* BlogService;
        return yield* deleteDraft({ blogId, draftId });
      }).pipe(Effect.either);
      const runnable = Effect.provide(program, Deps);
      const result = await Effect.runPromise(runnable);

      if (Either.isLeft(result)) {
        fastify.log.error(result.left);
        return {
          status: 500,
          body: { error: "Internal server error" },
        };
      }
      return {
        status: 200,
        body: result.right,
      };
    },
    getDraftVersions: async ({ params: { blogId, draftId } }) => {
      return {
        status: 200,
        body: {
          count: 1,
          limit: 10,
          page: 1,
          versions: [],
        },
      };
    },
    publishDraft: async ({ params: { blogId, draftId }, request }) => {
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
        const { publishDraft } = yield* BlogService;
        return yield* publishDraft({ blogId, draftId });
      }).pipe(Effect.either);
      const runnable = Effect.provide(program, Deps);
      const result = await Effect.runPromise(runnable);

      if (Either.isLeft(result)) {
        fastify.log.error(result.left);
        return {
          status: 500,
          body: { error: "Internal server error" },
        };
      }
      return {
        status: 200,
        body: result.right,
      };
    },
    deleteArticle: async ({ params: { blogId, articleId }, request }) => {
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
        const { deleteArticle } = yield* BlogService;
        return yield* deleteArticle({ blogId, articleId });
      }).pipe(Effect.either);
      const runnable = Effect.provide(program, Deps);
      const result = await Effect.runPromise(runnable);

      if (Either.isLeft(result)) {
        fastify.log.error(result.left);
        return {
          status: 500,
          body: { error: "Internal server error" },
        };
      }
      return {
        status: 200,
        body: {},
      };
    },
    getArticles: async ({
      params: { blogId },
      query: { limit, page },
      request,
    }) => {
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
        const { getArticles } = yield* BlogService;
        return yield* getArticles({ blogId }, { limit, page });
      }).pipe(Effect.either);

      const runnable = Effect.provide(program, Deps);
      const result = await Effect.runPromise(runnable);

      if (Either.isLeft(result)) {
        fastify.log.error(result.left);
        return {
          status: 500,
          body: { error: "Internal server error" },
        };
      }
      return {
        status: 200,
        body: result.right,
      };
    },
    getArticle: async ({ params: { blogId, articleId }, request }) => {
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
        const { getArticle } = yield* BlogService;
        return yield* getArticle({ blogId, articleId });
      }).pipe(Effect.either);
      const runnable = Effect.provide(program, Deps);
      const result = await Effect.runPromise(runnable);

      if (Either.isLeft(result)) {
        fastify.log.error(result.left);
        return {
          status: 500,
          body: { error: "Internal server error" },
        };
      }

      if (Option.isNone(result.right)) {
        return { status: 404, body: { error: "Article not found" } };
      }

      return {
        status: 200,
        body: result.right.value,
      };
    },
  });
  fastify.register(s.plugin(router), {});
});
