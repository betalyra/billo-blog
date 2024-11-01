import { z } from "zod";
export const Locale = z
    .string()
    .regex(/^[a-z]{2}(_[A-Z]{2})?$/)
    .default("en_UK");
//# sourceMappingURL=base.js.map