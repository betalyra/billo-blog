import { z } from "zod";

export const Locale = z
  .string()
  .regex(/^[a-z]{2}(_[A-Z]{2})?$/)
  .default("en_UK");
export type Locale = z.infer<typeof Locale>;
