import { z } from "zod";

export const PaginatedQuery = z.object({
  page: z.number(),
  limit: z.number(),
});
export type PaginatedQuery = z.infer<typeof PaginatedQuery>;

export const CountedQuery = z.object({
  count: z.number(),
});
export type CountedQuery = z.infer<typeof CountedQuery>;
export const PaginatedAndCountedQuery = PaginatedQuery.merge(CountedQuery);
export type PaginatedAndCountedQuery = z.infer<typeof PaginatedAndCountedQuery>;
