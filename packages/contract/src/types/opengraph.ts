import { z } from "zod";
import { LanguageTag } from "./base.js";

// Basic OG Schema
export const OGBasicSchema = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  image: z.string().url().nullable(),
  url: z.string().url().nullable(),
  type: z
    .enum([
      "website",
      "article",
      "book",
      "profile",
      "music.song",
      "music.album",
      "music.playlist",
      "music.radio_station",
      "video.movie",
      "video.episode",
      "video.tv_show",
      "video.other",
    ])
    .default("article"),
  siteName: z.string().nullable(),
  locale: LanguageTag,
});

// Author Schema
const SocialProfileSchema = z.object({
  platform: z.string(),
  url: z.string().url(),
});

const AuthorSchema = z.object({
  name: z.string(),
  profileUrl: z.string().url(),
  socialProfiles: z.array(SocialProfileSchema),
});

// Article-specific OG Schema
export const OGArticleSchema = OGBasicSchema.extend({
  type: z.literal("article"),
  publishedTime: z.string().datetime(),
  modifiedTime: z.string().datetime().nullable(),
  expirationTime: z.string().datetime().nullable(),
  author: z.array(AuthorSchema),
  section: z.string().nullable(),
  tag: z.string().array().nullable(),
});

// Profile-specific OG Schema
export const OGProfileSchema = OGBasicSchema.extend({
  type: z.literal("profile"),
  firstName: z.string().nullable(),
  lastName: z.string(),
});

// Book-specific OG Schema
export const OGBookSchema = OGBasicSchema.extend({
  type: z.literal("book"),
  author: z.union([z.string(), z.string().url()]).array(),
  isbn: z.string().nullable(),
  releaseDate: z.string().datetime().nullable(),
  tag: z.string().array().nullable(),
});

// Video-specific OG Schema
export const OGVideoSchema = OGBasicSchema.extend({
  type: z.enum([
    "video.movie",
    "video.episode",
    "video.tv_show",
    "video.other",
  ]),
  actors: z.union([z.string(), z.string().url()]).array().nullable(),
  director: z.union([z.string(), z.string().url()]).array().nullable(),
  writer: z.union([z.string(), z.string().url()]).array().nullable(),
  duration: z.number().nullable(),
  releaseDate: z.string().datetime().nullable(),
  tag: z.string().array().nullable(),
});

// Music-specific OG Schema
export const OGMusicSchema = OGBasicSchema.extend({
  type: z.enum([
    "music.song",
    "music.album",
    "music.playlist",
    "music.radio_station",
  ]),
  musician: z.union([z.string(), z.string().url()]).array().nullable(),
  album: z.number().nullable(),
  duration: z.number().nullable(),
  releaseDate: z.string().datetime().nullable(),
});

// Combined OG Schema
export const OGSchema = z.union([
  OGBasicSchema,
  OGArticleSchema,
  OGProfileSchema,
  OGBookSchema,
  OGVideoSchema,
  OGMusicSchema,
]);

export type OG = z.infer<typeof OGSchema>;
export type OGArticle = z.infer<typeof OGArticleSchema>;
export type OGProfile = z.infer<typeof OGProfileSchema>;
export type OGBook = z.infer<typeof OGBookSchema>;
export type OGVideo = z.infer<typeof OGVideoSchema>;
export type OGMusic = z.infer<typeof OGMusicSchema>;
