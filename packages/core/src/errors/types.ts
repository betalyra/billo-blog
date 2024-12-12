export class UnauthorizedError {
  readonly _tag = "UnauthorizedError";
}

export class InvalidTokenError {
  readonly _tag = "InvalidTokenError";
}

export class TokenExpiredError {
  readonly _tag = "TokenExpiredError";
}
export class ConflictError {
  readonly _tag = "ConflictError";
}

export type StandardError =
  | Error
  | UnauthorizedError
  | InvalidTokenError
  | TokenExpiredError;
