import { Context, Option } from "effect";

export type ITokenProvider = {
  accessToken: Option.Option<string>;
};
export class TokenProvider extends Context.Tag("TokenProvider")<
  TokenProvider,
  ITokenProvider
>() {}
