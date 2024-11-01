import { initServer } from "@ts-rest/fastify";
import { type FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import pino from "pino";
import { billoblogContract } from "@billo-blog/contract";

import { Effect, Either, Layer, Option, pipe } from "effect";

const logger = pino.default();

export default fp(async function (fastify: FastifyInstance) {
  const s = initServer();

  const router = s.router(billoblogContract, {
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
          author: "1",
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
  });
  fastify.register(s.plugin(router), {});
});
