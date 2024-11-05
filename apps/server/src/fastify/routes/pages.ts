import { initServer } from "@ts-rest/fastify";
import { type FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { billoblogContract } from "@billo-blog/contract";
import {
  BlogServiceLive,
  GitHubServiceLive,
  EnvServiceLive,
  BlogService,
} from "@billo-blog/core";
import { fastifyCookie } from "@fastify/cookie";

import { Effect, Layer, Logger } from "effect";
import { SessionServiceLive } from "@billo-blog/core/dist/session/service.js";
import { UserServiceLive } from "@billo-blog/core/dist/services/user/service.js";

export default fp(async function (fastify: FastifyInstance) {
  const s = initServer();

  const Dependencies = BlogServiceLive.pipe(
    Layer.provideMerge(
      Layer.mergeAll(
        GitHubServiceLive,
        Logger.pretty,
        Logger.minimumLogLevel(fastify.env.LOG_LEVEL),
        SessionServiceLive,
        UserServiceLive
      )
    ),
    Layer.provideMerge(Layer.mergeAll(EnvServiceLive, fastify.postgresDrizzle))
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
        maxAge: 60_000,
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

      const cookie = fastifyCookie.serialize("session", result.id, {
        maxAge: 60_000,
        httpOnly: true,
        secure: fastify.env.SESSION_COOKIE_SECURE,
        sameSite: "lax",
        path: "/",
        domain: fastify.env.SESSION_COOKIE_URL?.split("://")[1],
      });
      return reply.header("Set-Cookie", cookie).send({ status: "ok", cookie });
    },
    createBlog: async ({ body }) => {
      return {
        status: 200,
        body: {
          id: "1",
          name: "Blog 1",
        },
      };
    },
    getBlogs: async ({ query }) => {
      return {
        status: 200,
        body: {
          blogs: [],
          count: 0,
          page: 0,
          limit: 0,
        },
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
          id: "1",
          name: "Blog 1",
        },
      };
    },
    deleteBlog: async ({ params: { blogId } }) => {
      return {
        status: 200,
        body: {},
      };
    },
    createArticle: async ({ params: { blogId }, body }) => {
      return {
        status: 200,
        body: {
          id: "1",
          slug: "article-1",
        },
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
          id: "1",
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
          id: "1",
          slug: "article-1",
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
