import { Context, Layer } from "effect";
import { z } from "zod";
export declare const IEnv: z.ZodObject<{
    POSTGRES_URL: z.ZodString;
    POSTGRES_SSL_CERTIFICATE: z.ZodOptional<z.ZodString>;
    MIGRATIONS_FOLDER: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    POSTGRES_URL: string;
    MIGRATIONS_FOLDER: string;
    POSTGRES_SSL_CERTIFICATE?: string | undefined;
}, {
    POSTGRES_URL: string;
    POSTGRES_SSL_CERTIFICATE?: string | undefined;
    MIGRATIONS_FOLDER?: string | undefined;
}>;
export type IEnv = z.infer<typeof IEnv>;
declare const EnvService_base: Context.TagClass<EnvService, "EnvService", {
    POSTGRES_URL: string;
    MIGRATIONS_FOLDER: string;
    POSTGRES_SSL_CERTIFICATE?: string | undefined;
}>;
export declare class EnvService extends EnvService_base {
}
export declare const EnvServiceLive: Layer.Layer<EnvService, z.ZodError<{
    POSTGRES_URL: string;
    POSTGRES_SSL_CERTIFICATE?: string | undefined;
    MIGRATIONS_FOLDER?: string | undefined;
}>, never>;
export {};
//# sourceMappingURL=service.d.ts.map