import { z } from "zod";
import { Block } from "../types/blocknote.js";
export * from "../types/blocknote.js";
export declare const ID: z.ZodString;
export type ID = z.infer<typeof ID>;
export declare const Paginated: z.ZodObject<{
    limit: z.ZodOptional<z.ZodNumber>;
    page: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit?: number | undefined;
    page?: number | undefined;
}, {
    limit?: number | undefined;
    page?: number | undefined;
}>;
export type Paginated = z.infer<typeof Paginated>;
export declare const Counted: z.ZodObject<{
    count: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    count: number;
}, {
    count: number;
}>;
export type Counted = z.infer<typeof Counted>;
export declare const PaginatedAndCounted: z.ZodObject<z.objectUtil.extendShape<{
    limit: z.ZodOptional<z.ZodNumber>;
    page: z.ZodOptional<z.ZodNumber>;
}, {
    count: z.ZodNumber;
}>, "strip", z.ZodTypeAny, {
    count: number;
    limit?: number | undefined;
    page?: number | undefined;
}, {
    count: number;
    limit?: number | undefined;
    page?: number | undefined;
}>;
export type PaginatedAndCounted = z.infer<typeof PaginatedAndCounted>;
export declare const GetBlogPathParams: z.ZodObject<{
    blogId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    blogId: string;
}, {
    blogId: string;
}>;
export type GetBlogPathParams = z.infer<typeof GetBlogPathParams>;
export declare const GetBlogResponse: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string | null;
    id: string;
}, {
    name: string | null;
    id: string;
}>;
export type GetBlogResponse = z.infer<typeof GetBlogResponse>;
export declare const GetBlogsResponse: z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
    limit: z.ZodOptional<z.ZodNumber>;
    page: z.ZodOptional<z.ZodNumber>;
}, {
    count: z.ZodNumber;
}>, {
    blogs: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string | null;
        id: string;
    }, {
        name: string | null;
        id: string;
    }>, "many">;
}>, "strip", z.ZodTypeAny, {
    count: number;
    blogs: {
        name: string | null;
        id: string;
    }[];
    limit?: number | undefined;
    page?: number | undefined;
}, {
    count: number;
    blogs: {
        name: string | null;
        id: string;
    }[];
    limit?: number | undefined;
    page?: number | undefined;
}>;
export type GetBlogsResponse = z.infer<typeof GetBlogsResponse>;
export declare const GetArticleResponse: z.ZodObject<{
    id: z.ZodString;
    slug: z.ZodString;
    author: z.ZodString;
    og: z.ZodObject<{
        title: z.ZodNullable<z.ZodString>;
        description: z.ZodNullable<z.ZodString>;
        image: z.ZodNullable<z.ZodString>;
        url: z.ZodNullable<z.ZodString>;
        type: z.ZodDefault<z.ZodEnum<["website", "article", "book", "profile", "music.song", "music.album", "music.playlist", "music.radio_station", "video.movie", "video.episode", "video.tv_show", "video.other"]>>;
        siteName: z.ZodNullable<z.ZodString>;
        locale: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other";
        title: string | null;
        description: string | null;
        image: string | null;
        url: string | null;
        siteName: string | null;
        locale: string;
    }, {
        title: string | null;
        description: string | null;
        image: string | null;
        url: string | null;
        siteName: string | null;
        type?: "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other" | undefined;
        locale?: string | undefined;
    }>;
    ogArticle: z.ZodObject<z.objectUtil.extendShape<{
        title: z.ZodNullable<z.ZodString>;
        description: z.ZodNullable<z.ZodString>;
        image: z.ZodNullable<z.ZodString>;
        url: z.ZodNullable<z.ZodString>;
        type: z.ZodDefault<z.ZodEnum<["website", "article", "book", "profile", "music.song", "music.album", "music.playlist", "music.radio_station", "video.movie", "video.episode", "video.tv_show", "video.other"]>>;
        siteName: z.ZodNullable<z.ZodString>;
        locale: z.ZodDefault<z.ZodString>;
    }, {
        type: z.ZodLiteral<"article">;
        publishedTime: z.ZodString;
        modifiedTime: z.ZodNullable<z.ZodString>;
        expirationTime: z.ZodNullable<z.ZodString>;
        author: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            profileUrl: z.ZodString;
            socialProfiles: z.ZodArray<z.ZodObject<{
                platform: z.ZodString;
                url: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                url: string;
                platform: string;
            }, {
                url: string;
                platform: string;
            }>, "many">;
        }, "strip", z.ZodTypeAny, {
            name: string;
            profileUrl: string;
            socialProfiles: {
                url: string;
                platform: string;
            }[];
        }, {
            name: string;
            profileUrl: string;
            socialProfiles: {
                url: string;
                platform: string;
            }[];
        }>, "many">;
        section: z.ZodNullable<z.ZodString>;
        tag: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
    }>, "strip", z.ZodTypeAny, {
        type: "article";
        title: string | null;
        description: string | null;
        image: string | null;
        url: string | null;
        siteName: string | null;
        locale: string;
        publishedTime: string;
        modifiedTime: string | null;
        expirationTime: string | null;
        author: {
            name: string;
            profileUrl: string;
            socialProfiles: {
                url: string;
                platform: string;
            }[];
        }[];
        section: string | null;
        tag: string[] | null;
    }, {
        type: "article";
        title: string | null;
        description: string | null;
        image: string | null;
        url: string | null;
        siteName: string | null;
        publishedTime: string;
        modifiedTime: string | null;
        expirationTime: string | null;
        author: {
            name: string;
            profileUrl: string;
            socialProfiles: {
                url: string;
                platform: string;
            }[];
        }[];
        section: string | null;
        tag: string[] | null;
        locale?: string | undefined;
    }>;
    blocks: z.ZodArray<z.ZodType<Block, z.ZodTypeDef, Block>, "many">;
}, "strip", z.ZodTypeAny, {
    author: string;
    id: string;
    slug: string;
    og: {
        type: "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other";
        title: string | null;
        description: string | null;
        image: string | null;
        url: string | null;
        siteName: string | null;
        locale: string;
    };
    ogArticle: {
        type: "article";
        title: string | null;
        description: string | null;
        image: string | null;
        url: string | null;
        siteName: string | null;
        locale: string;
        publishedTime: string;
        modifiedTime: string | null;
        expirationTime: string | null;
        author: {
            name: string;
            profileUrl: string;
            socialProfiles: {
                url: string;
                platform: string;
            }[];
        }[];
        section: string | null;
        tag: string[] | null;
    };
    blocks: Block[];
}, {
    author: string;
    id: string;
    slug: string;
    og: {
        title: string | null;
        description: string | null;
        image: string | null;
        url: string | null;
        siteName: string | null;
        type?: "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other" | undefined;
        locale?: string | undefined;
    };
    ogArticle: {
        type: "article";
        title: string | null;
        description: string | null;
        image: string | null;
        url: string | null;
        siteName: string | null;
        publishedTime: string;
        modifiedTime: string | null;
        expirationTime: string | null;
        author: {
            name: string;
            profileUrl: string;
            socialProfiles: {
                url: string;
                platform: string;
            }[];
        }[];
        section: string | null;
        tag: string[] | null;
        locale?: string | undefined;
    };
    blocks: Block[];
}>;
export type GetArticleResponse = z.infer<typeof GetArticleResponse>;
export declare const GetArticlesParams: z.ZodObject<{
    blogId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    blogId: string;
}, {
    blogId: string;
}>;
export type GetArticlesParams = z.infer<typeof GetArticlesParams>;
export declare const GetArticlesResponse: z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
    limit: z.ZodOptional<z.ZodNumber>;
    page: z.ZodOptional<z.ZodNumber>;
}, {
    count: z.ZodNumber;
}>, {
    articles: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        slug: z.ZodString;
        author: z.ZodString;
        og: z.ZodObject<{
            title: z.ZodNullable<z.ZodString>;
            description: z.ZodNullable<z.ZodString>;
            image: z.ZodNullable<z.ZodString>;
            url: z.ZodNullable<z.ZodString>;
            type: z.ZodDefault<z.ZodEnum<["website", "article", "book", "profile", "music.song", "music.album", "music.playlist", "music.radio_station", "video.movie", "video.episode", "video.tv_show", "video.other"]>>;
            siteName: z.ZodNullable<z.ZodString>;
            locale: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other";
            title: string | null;
            description: string | null;
            image: string | null;
            url: string | null;
            siteName: string | null;
            locale: string;
        }, {
            title: string | null;
            description: string | null;
            image: string | null;
            url: string | null;
            siteName: string | null;
            type?: "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other" | undefined;
            locale?: string | undefined;
        }>;
        ogArticle: z.ZodObject<z.objectUtil.extendShape<{
            title: z.ZodNullable<z.ZodString>;
            description: z.ZodNullable<z.ZodString>;
            image: z.ZodNullable<z.ZodString>;
            url: z.ZodNullable<z.ZodString>;
            type: z.ZodDefault<z.ZodEnum<["website", "article", "book", "profile", "music.song", "music.album", "music.playlist", "music.radio_station", "video.movie", "video.episode", "video.tv_show", "video.other"]>>;
            siteName: z.ZodNullable<z.ZodString>;
            locale: z.ZodDefault<z.ZodString>;
        }, {
            type: z.ZodLiteral<"article">;
            publishedTime: z.ZodString;
            modifiedTime: z.ZodNullable<z.ZodString>;
            expirationTime: z.ZodNullable<z.ZodString>;
            author: z.ZodArray<z.ZodObject<{
                name: z.ZodString;
                profileUrl: z.ZodString;
                socialProfiles: z.ZodArray<z.ZodObject<{
                    platform: z.ZodString;
                    url: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    url: string;
                    platform: string;
                }, {
                    url: string;
                    platform: string;
                }>, "many">;
            }, "strip", z.ZodTypeAny, {
                name: string;
                profileUrl: string;
                socialProfiles: {
                    url: string;
                    platform: string;
                }[];
            }, {
                name: string;
                profileUrl: string;
                socialProfiles: {
                    url: string;
                    platform: string;
                }[];
            }>, "many">;
            section: z.ZodNullable<z.ZodString>;
            tag: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
        }>, "strip", z.ZodTypeAny, {
            type: "article";
            title: string | null;
            description: string | null;
            image: string | null;
            url: string | null;
            siteName: string | null;
            locale: string;
            publishedTime: string;
            modifiedTime: string | null;
            expirationTime: string | null;
            author: {
                name: string;
                profileUrl: string;
                socialProfiles: {
                    url: string;
                    platform: string;
                }[];
            }[];
            section: string | null;
            tag: string[] | null;
        }, {
            type: "article";
            title: string | null;
            description: string | null;
            image: string | null;
            url: string | null;
            siteName: string | null;
            publishedTime: string;
            modifiedTime: string | null;
            expirationTime: string | null;
            author: {
                name: string;
                profileUrl: string;
                socialProfiles: {
                    url: string;
                    platform: string;
                }[];
            }[];
            section: string | null;
            tag: string[] | null;
            locale?: string | undefined;
        }>;
        blocks: z.ZodArray<z.ZodType<Block, z.ZodTypeDef, Block>, "many">;
    }, "strip", z.ZodTypeAny, {
        author: string;
        id: string;
        slug: string;
        og: {
            type: "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other";
            title: string | null;
            description: string | null;
            image: string | null;
            url: string | null;
            siteName: string | null;
            locale: string;
        };
        ogArticle: {
            type: "article";
            title: string | null;
            description: string | null;
            image: string | null;
            url: string | null;
            siteName: string | null;
            locale: string;
            publishedTime: string;
            modifiedTime: string | null;
            expirationTime: string | null;
            author: {
                name: string;
                profileUrl: string;
                socialProfiles: {
                    url: string;
                    platform: string;
                }[];
            }[];
            section: string | null;
            tag: string[] | null;
        };
        blocks: Block[];
    }, {
        author: string;
        id: string;
        slug: string;
        og: {
            title: string | null;
            description: string | null;
            image: string | null;
            url: string | null;
            siteName: string | null;
            type?: "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other" | undefined;
            locale?: string | undefined;
        };
        ogArticle: {
            type: "article";
            title: string | null;
            description: string | null;
            image: string | null;
            url: string | null;
            siteName: string | null;
            publishedTime: string;
            modifiedTime: string | null;
            expirationTime: string | null;
            author: {
                name: string;
                profileUrl: string;
                socialProfiles: {
                    url: string;
                    platform: string;
                }[];
            }[];
            section: string | null;
            tag: string[] | null;
            locale?: string | undefined;
        };
        blocks: Block[];
    }>, "many">;
}>, "strip", z.ZodTypeAny, {
    count: number;
    articles: {
        author: string;
        id: string;
        slug: string;
        og: {
            type: "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other";
            title: string | null;
            description: string | null;
            image: string | null;
            url: string | null;
            siteName: string | null;
            locale: string;
        };
        ogArticle: {
            type: "article";
            title: string | null;
            description: string | null;
            image: string | null;
            url: string | null;
            siteName: string | null;
            locale: string;
            publishedTime: string;
            modifiedTime: string | null;
            expirationTime: string | null;
            author: {
                name: string;
                profileUrl: string;
                socialProfiles: {
                    url: string;
                    platform: string;
                }[];
            }[];
            section: string | null;
            tag: string[] | null;
        };
        blocks: Block[];
    }[];
    limit?: number | undefined;
    page?: number | undefined;
}, {
    count: number;
    articles: {
        author: string;
        id: string;
        slug: string;
        og: {
            title: string | null;
            description: string | null;
            image: string | null;
            url: string | null;
            siteName: string | null;
            type?: "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other" | undefined;
            locale?: string | undefined;
        };
        ogArticle: {
            type: "article";
            title: string | null;
            description: string | null;
            image: string | null;
            url: string | null;
            siteName: string | null;
            publishedTime: string;
            modifiedTime: string | null;
            expirationTime: string | null;
            author: {
                name: string;
                profileUrl: string;
                socialProfiles: {
                    url: string;
                    platform: string;
                }[];
            }[];
            section: string | null;
            tag: string[] | null;
            locale?: string | undefined;
        };
        blocks: Block[];
    }[];
    limit?: number | undefined;
    page?: number | undefined;
}>;
export declare const GetArticleParams: z.ZodObject<{
    blogId: z.ZodString;
    articleId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    blogId: string;
    articleId: string;
}, {
    blogId: string;
    articleId: string;
}>;
export type GetArticleParams = z.infer<typeof GetArticleParams>;
export declare const billoblogContract: {
    getBlogs: {
        query: z.ZodObject<{
            limit: z.ZodOptional<z.ZodNumber>;
            page: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            limit?: number | undefined;
            page?: number | undefined;
        }, {
            limit?: number | undefined;
            page?: number | undefined;
        }>;
        method: "GET";
        path: "/v1/blogs";
        responses: {
            200: z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
                limit: z.ZodOptional<z.ZodNumber>;
                page: z.ZodOptional<z.ZodNumber>;
            }, {
                count: z.ZodNumber;
            }>, {
                blogs: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodNullable<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    name: string | null;
                    id: string;
                }, {
                    name: string | null;
                    id: string;
                }>, "many">;
            }>, "strip", z.ZodTypeAny, {
                count: number;
                blogs: {
                    name: string | null;
                    id: string;
                }[];
                limit?: number | undefined;
                page?: number | undefined;
            }, {
                count: number;
                blogs: {
                    name: string | null;
                    id: string;
                }[];
                limit?: number | undefined;
                page?: number | undefined;
            }>;
        };
    };
    getBlog: {
        pathParams: z.ZodObject<{
            blogId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            blogId: string;
        }, {
            blogId: string;
        }>;
        method: "GET";
        path: "/v1/blogs/:blogId";
        responses: {
            200: z.ZodObject<{
                id: z.ZodString;
                name: z.ZodNullable<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                name: string | null;
                id: string;
            }, {
                name: string | null;
                id: string;
            }>;
            404: z.ZodAny;
        };
    };
    getArticles: {
        pathParams: z.ZodObject<{
            blogId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            blogId: string;
        }, {
            blogId: string;
        }>;
        query: z.ZodObject<{
            limit: z.ZodOptional<z.ZodNumber>;
            page: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            limit?: number | undefined;
            page?: number | undefined;
        }, {
            limit?: number | undefined;
            page?: number | undefined;
        }>;
        method: "GET";
        path: "/v1/blogs/:blogId/articles";
        responses: {
            200: z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
                limit: z.ZodOptional<z.ZodNumber>;
                page: z.ZodOptional<z.ZodNumber>;
            }, {
                count: z.ZodNumber;
            }>, {
                articles: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    slug: z.ZodString;
                    author: z.ZodString;
                    og: z.ZodObject<{
                        title: z.ZodNullable<z.ZodString>;
                        description: z.ZodNullable<z.ZodString>;
                        image: z.ZodNullable<z.ZodString>;
                        url: z.ZodNullable<z.ZodString>;
                        type: z.ZodDefault<z.ZodEnum<["website", "article", "book", "profile", "music.song", "music.album", "music.playlist", "music.radio_station", "video.movie", "video.episode", "video.tv_show", "video.other"]>>;
                        siteName: z.ZodNullable<z.ZodString>;
                        locale: z.ZodDefault<z.ZodString>;
                    }, "strip", z.ZodTypeAny, {
                        type: "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other";
                        title: string | null;
                        description: string | null;
                        image: string | null;
                        url: string | null;
                        siteName: string | null;
                        locale: string;
                    }, {
                        title: string | null;
                        description: string | null;
                        image: string | null;
                        url: string | null;
                        siteName: string | null;
                        type?: "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other" | undefined;
                        locale?: string | undefined;
                    }>;
                    ogArticle: z.ZodObject<z.objectUtil.extendShape<{
                        title: z.ZodNullable<z.ZodString>;
                        description: z.ZodNullable<z.ZodString>;
                        image: z.ZodNullable<z.ZodString>;
                        url: z.ZodNullable<z.ZodString>;
                        type: z.ZodDefault<z.ZodEnum<["website", "article", "book", "profile", "music.song", "music.album", "music.playlist", "music.radio_station", "video.movie", "video.episode", "video.tv_show", "video.other"]>>;
                        siteName: z.ZodNullable<z.ZodString>;
                        locale: z.ZodDefault<z.ZodString>;
                    }, {
                        type: z.ZodLiteral<"article">;
                        publishedTime: z.ZodString;
                        modifiedTime: z.ZodNullable<z.ZodString>;
                        expirationTime: z.ZodNullable<z.ZodString>;
                        author: z.ZodArray<z.ZodObject<{
                            name: z.ZodString;
                            profileUrl: z.ZodString;
                            socialProfiles: z.ZodArray<z.ZodObject<{
                                platform: z.ZodString;
                                url: z.ZodString;
                            }, "strip", z.ZodTypeAny, {
                                url: string;
                                platform: string;
                            }, {
                                url: string;
                                platform: string;
                            }>, "many">;
                        }, "strip", z.ZodTypeAny, {
                            name: string;
                            profileUrl: string;
                            socialProfiles: {
                                url: string;
                                platform: string;
                            }[];
                        }, {
                            name: string;
                            profileUrl: string;
                            socialProfiles: {
                                url: string;
                                platform: string;
                            }[];
                        }>, "many">;
                        section: z.ZodNullable<z.ZodString>;
                        tag: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
                    }>, "strip", z.ZodTypeAny, {
                        type: "article";
                        title: string | null;
                        description: string | null;
                        image: string | null;
                        url: string | null;
                        siteName: string | null;
                        locale: string;
                        publishedTime: string;
                        modifiedTime: string | null;
                        expirationTime: string | null;
                        author: {
                            name: string;
                            profileUrl: string;
                            socialProfiles: {
                                url: string;
                                platform: string;
                            }[];
                        }[];
                        section: string | null;
                        tag: string[] | null;
                    }, {
                        type: "article";
                        title: string | null;
                        description: string | null;
                        image: string | null;
                        url: string | null;
                        siteName: string | null;
                        publishedTime: string;
                        modifiedTime: string | null;
                        expirationTime: string | null;
                        author: {
                            name: string;
                            profileUrl: string;
                            socialProfiles: {
                                url: string;
                                platform: string;
                            }[];
                        }[];
                        section: string | null;
                        tag: string[] | null;
                        locale?: string | undefined;
                    }>;
                    blocks: z.ZodArray<z.ZodType<Block, z.ZodTypeDef, Block>, "many">;
                }, "strip", z.ZodTypeAny, {
                    author: string;
                    id: string;
                    slug: string;
                    og: {
                        type: "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other";
                        title: string | null;
                        description: string | null;
                        image: string | null;
                        url: string | null;
                        siteName: string | null;
                        locale: string;
                    };
                    ogArticle: {
                        type: "article";
                        title: string | null;
                        description: string | null;
                        image: string | null;
                        url: string | null;
                        siteName: string | null;
                        locale: string;
                        publishedTime: string;
                        modifiedTime: string | null;
                        expirationTime: string | null;
                        author: {
                            name: string;
                            profileUrl: string;
                            socialProfiles: {
                                url: string;
                                platform: string;
                            }[];
                        }[];
                        section: string | null;
                        tag: string[] | null;
                    };
                    blocks: Block[];
                }, {
                    author: string;
                    id: string;
                    slug: string;
                    og: {
                        title: string | null;
                        description: string | null;
                        image: string | null;
                        url: string | null;
                        siteName: string | null;
                        type?: "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other" | undefined;
                        locale?: string | undefined;
                    };
                    ogArticle: {
                        type: "article";
                        title: string | null;
                        description: string | null;
                        image: string | null;
                        url: string | null;
                        siteName: string | null;
                        publishedTime: string;
                        modifiedTime: string | null;
                        expirationTime: string | null;
                        author: {
                            name: string;
                            profileUrl: string;
                            socialProfiles: {
                                url: string;
                                platform: string;
                            }[];
                        }[];
                        section: string | null;
                        tag: string[] | null;
                        locale?: string | undefined;
                    };
                    blocks: Block[];
                }>, "many">;
            }>, "strip", z.ZodTypeAny, {
                count: number;
                articles: {
                    author: string;
                    id: string;
                    slug: string;
                    og: {
                        type: "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other";
                        title: string | null;
                        description: string | null;
                        image: string | null;
                        url: string | null;
                        siteName: string | null;
                        locale: string;
                    };
                    ogArticle: {
                        type: "article";
                        title: string | null;
                        description: string | null;
                        image: string | null;
                        url: string | null;
                        siteName: string | null;
                        locale: string;
                        publishedTime: string;
                        modifiedTime: string | null;
                        expirationTime: string | null;
                        author: {
                            name: string;
                            profileUrl: string;
                            socialProfiles: {
                                url: string;
                                platform: string;
                            }[];
                        }[];
                        section: string | null;
                        tag: string[] | null;
                    };
                    blocks: Block[];
                }[];
                limit?: number | undefined;
                page?: number | undefined;
            }, {
                count: number;
                articles: {
                    author: string;
                    id: string;
                    slug: string;
                    og: {
                        title: string | null;
                        description: string | null;
                        image: string | null;
                        url: string | null;
                        siteName: string | null;
                        type?: "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other" | undefined;
                        locale?: string | undefined;
                    };
                    ogArticle: {
                        type: "article";
                        title: string | null;
                        description: string | null;
                        image: string | null;
                        url: string | null;
                        siteName: string | null;
                        publishedTime: string;
                        modifiedTime: string | null;
                        expirationTime: string | null;
                        author: {
                            name: string;
                            profileUrl: string;
                            socialProfiles: {
                                url: string;
                                platform: string;
                            }[];
                        }[];
                        section: string | null;
                        tag: string[] | null;
                        locale?: string | undefined;
                    };
                    blocks: Block[];
                }[];
                limit?: number | undefined;
                page?: number | undefined;
            }>;
        };
    };
    getArticle: {
        pathParams: z.ZodObject<{
            blogId: z.ZodString;
            articleId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            blogId: string;
            articleId: string;
        }, {
            blogId: string;
            articleId: string;
        }>;
        method: "GET";
        path: "/v1/blogs/:blogId/articles/:articleId";
        responses: {
            200: z.ZodObject<{
                id: z.ZodString;
                slug: z.ZodString;
                author: z.ZodString;
                og: z.ZodObject<{
                    title: z.ZodNullable<z.ZodString>;
                    description: z.ZodNullable<z.ZodString>;
                    image: z.ZodNullable<z.ZodString>;
                    url: z.ZodNullable<z.ZodString>;
                    type: z.ZodDefault<z.ZodEnum<["website", "article", "book", "profile", "music.song", "music.album", "music.playlist", "music.radio_station", "video.movie", "video.episode", "video.tv_show", "video.other"]>>;
                    siteName: z.ZodNullable<z.ZodString>;
                    locale: z.ZodDefault<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    type: "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other";
                    title: string | null;
                    description: string | null;
                    image: string | null;
                    url: string | null;
                    siteName: string | null;
                    locale: string;
                }, {
                    title: string | null;
                    description: string | null;
                    image: string | null;
                    url: string | null;
                    siteName: string | null;
                    type?: "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other" | undefined;
                    locale?: string | undefined;
                }>;
                ogArticle: z.ZodObject<z.objectUtil.extendShape<{
                    title: z.ZodNullable<z.ZodString>;
                    description: z.ZodNullable<z.ZodString>;
                    image: z.ZodNullable<z.ZodString>;
                    url: z.ZodNullable<z.ZodString>;
                    type: z.ZodDefault<z.ZodEnum<["website", "article", "book", "profile", "music.song", "music.album", "music.playlist", "music.radio_station", "video.movie", "video.episode", "video.tv_show", "video.other"]>>;
                    siteName: z.ZodNullable<z.ZodString>;
                    locale: z.ZodDefault<z.ZodString>;
                }, {
                    type: z.ZodLiteral<"article">;
                    publishedTime: z.ZodString;
                    modifiedTime: z.ZodNullable<z.ZodString>;
                    expirationTime: z.ZodNullable<z.ZodString>;
                    author: z.ZodArray<z.ZodObject<{
                        name: z.ZodString;
                        profileUrl: z.ZodString;
                        socialProfiles: z.ZodArray<z.ZodObject<{
                            platform: z.ZodString;
                            url: z.ZodString;
                        }, "strip", z.ZodTypeAny, {
                            url: string;
                            platform: string;
                        }, {
                            url: string;
                            platform: string;
                        }>, "many">;
                    }, "strip", z.ZodTypeAny, {
                        name: string;
                        profileUrl: string;
                        socialProfiles: {
                            url: string;
                            platform: string;
                        }[];
                    }, {
                        name: string;
                        profileUrl: string;
                        socialProfiles: {
                            url: string;
                            platform: string;
                        }[];
                    }>, "many">;
                    section: z.ZodNullable<z.ZodString>;
                    tag: z.ZodNullable<z.ZodArray<z.ZodString, "many">>;
                }>, "strip", z.ZodTypeAny, {
                    type: "article";
                    title: string | null;
                    description: string | null;
                    image: string | null;
                    url: string | null;
                    siteName: string | null;
                    locale: string;
                    publishedTime: string;
                    modifiedTime: string | null;
                    expirationTime: string | null;
                    author: {
                        name: string;
                        profileUrl: string;
                        socialProfiles: {
                            url: string;
                            platform: string;
                        }[];
                    }[];
                    section: string | null;
                    tag: string[] | null;
                }, {
                    type: "article";
                    title: string | null;
                    description: string | null;
                    image: string | null;
                    url: string | null;
                    siteName: string | null;
                    publishedTime: string;
                    modifiedTime: string | null;
                    expirationTime: string | null;
                    author: {
                        name: string;
                        profileUrl: string;
                        socialProfiles: {
                            url: string;
                            platform: string;
                        }[];
                    }[];
                    section: string | null;
                    tag: string[] | null;
                    locale?: string | undefined;
                }>;
                blocks: z.ZodArray<z.ZodType<Block, z.ZodTypeDef, Block>, "many">;
            }, "strip", z.ZodTypeAny, {
                author: string;
                id: string;
                slug: string;
                og: {
                    type: "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other";
                    title: string | null;
                    description: string | null;
                    image: string | null;
                    url: string | null;
                    siteName: string | null;
                    locale: string;
                };
                ogArticle: {
                    type: "article";
                    title: string | null;
                    description: string | null;
                    image: string | null;
                    url: string | null;
                    siteName: string | null;
                    locale: string;
                    publishedTime: string;
                    modifiedTime: string | null;
                    expirationTime: string | null;
                    author: {
                        name: string;
                        profileUrl: string;
                        socialProfiles: {
                            url: string;
                            platform: string;
                        }[];
                    }[];
                    section: string | null;
                    tag: string[] | null;
                };
                blocks: Block[];
            }, {
                author: string;
                id: string;
                slug: string;
                og: {
                    title: string | null;
                    description: string | null;
                    image: string | null;
                    url: string | null;
                    siteName: string | null;
                    type?: "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other" | undefined;
                    locale?: string | undefined;
                };
                ogArticle: {
                    type: "article";
                    title: string | null;
                    description: string | null;
                    image: string | null;
                    url: string | null;
                    siteName: string | null;
                    publishedTime: string;
                    modifiedTime: string | null;
                    expirationTime: string | null;
                    author: {
                        name: string;
                        profileUrl: string;
                        socialProfiles: {
                            url: string;
                            platform: string;
                        }[];
                    }[];
                    section: string | null;
                    tag: string[] | null;
                    locale?: string | undefined;
                };
                blocks: Block[];
            }>;
            404: z.ZodAny;
        };
    };
};
//# sourceMappingURL=index.d.ts.map