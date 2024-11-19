import { Context, Effect, Layer } from "effect";
import * as jose from "jose";
import { EnvService } from "../env/service.js";
// Types for JWT payloads
import { z } from "zod";
import { InvalidTokenError, TokenExpiredError } from "../../errors/types.js";

export const TokenType = z.enum(["user", "api"]);
export type TokenType = z.infer<typeof TokenType>;

const JWTPayloadSchema = z.object({
  jti: z.string(), // JWT ID (session ID)
  sub: z.string(), // Subject (user ID)
  iat: z.number(), // Issued at (timestamp)
  exp: z.number().optional(), // Expiration time

  // Custom claims
  type: TokenType, // Token type to distinguish from other tokens
  email: z.string().optional(), // Optional: user's email if you want to include it
});

export const CreateJWTParamsSchema = z.object({
  userId: z.string(),
  sessionToken: z.string(),
  type: TokenType,
  email: z.string().optional(),
  expiresAt: z.number().optional(),
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;
export type CreateJWTParams = z.infer<typeof CreateJWTParamsSchema>;
export const CreateTokenResponse = z.object({
  token: z.string(),
  expiresAt: z.number().optional(),
});
export type CreateTokenResponse = z.infer<typeof CreateTokenResponse>;

export type IJWTService = {
  createToken: (
    params: CreateJWTParams
  ) => Effect.Effect<CreateTokenResponse, Error>;
  verifyToken: (
    token: string
  ) => Effect.Effect<JWTPayload, Error | InvalidTokenError | TokenExpiredError>;
};

export class JWTService extends Context.Tag("JWTService")<
  JWTService,
  IJWTService
>() {}

export const JWTServiceLive = Layer.effect(
  JWTService,
  Effect.gen(function* () {
    const { SESSION_SECRET } = yield* EnvService;

    const createToken: IJWTService["createToken"] = (params) =>
      Effect.gen(function* (_) {
        const secret = yield* Effect.try(() =>
          new TextEncoder().encode(SESSION_SECRET)
        );

        // Current timestamp in seconds
        // const now = Math.floor(Date.now() / 1000);

        const payload: Omit<JWTPayload, "iat" | "exp"> = {
          jti: params.sessionToken,
          sub: params.userId,
          type: params.type,
          ...(params.email && { email: params.email }),
        };

        const jwt = yield* Effect.tryPromise(() => {
          const token = new jose.SignJWT(payload)
            .setProtectedHeader({
              alg: "HS256", // HMAC with SHA-256
              typ: "JWT", // Type declaration
            })
            .setIssuedAt() // iat claim
            .setJti(payload.jti); // Token ID

          if (params.expiresAt) {
            token.setExpirationTime(params.expiresAt);
          }
          return token.sign(secret);
        });

        return {
          token: jwt,
          expiresAt: params.expiresAt,
        };
      });

    const verifyToken: IJWTService["verifyToken"] = (token) =>
      Effect.gen(function* (_) {
        const secret = yield* Effect.try(() =>
          new TextEncoder().encode(SESSION_SECRET)
        );

        const { payload } = yield* Effect.tryPromise(() =>
          jose.jwtVerify(token, secret, {
            algorithms: ["HS256"], // Explicitly specify allowed algorithms
          })
        ).pipe(
          Effect.mapError((error) => {
            if (error instanceof jose.errors.JWTExpired) {
              return new TokenExpiredError();
            }

            return new InvalidTokenError();
          })
        );
        yield* Effect.logDebug(`Token verified.`);
        const parsedPayload = JWTPayloadSchema.safeParse(payload);
        if (!parsedPayload.success) {
          return yield* Effect.fail(new InvalidTokenError());
        }

        return parsedPayload.data;
      });
    return {
      createToken,
      verifyToken,
    };
  })
);
