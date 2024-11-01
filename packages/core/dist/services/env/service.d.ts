import { Context, Layer, LogLevel } from "effect";
import { z } from "zod";
export declare const IEnv: z.ZodObject<{
    POSTGRES_URL: z.ZodString;
    POSTGRES_SSL_CERTIFICATE: z.ZodOptional<z.ZodString>;
    MIGRATIONS_FOLDER: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    LOG_LEVEL: z.ZodEffects<z.ZodDefault<z.ZodOptional<z.ZodEnum<["All", "Debug", "Info", "Error", "None", "Fatal", "Warning", "Trace"]>>>, LogLevel.All | LogLevel.Fatal | LogLevel.Error | LogLevel.Warning | LogLevel.Info | LogLevel.Debug | LogLevel.Trace | LogLevel.None, "All" | "Debug" | "Info" | "Error" | "None" | "Fatal" | "Warning" | "Trace" | undefined>;
}, "strip", z.ZodTypeAny, {
    POSTGRES_URL: string;
    MIGRATIONS_FOLDER: string;
    LOG_LEVEL: LogLevel.All | LogLevel.Fatal | LogLevel.Error | LogLevel.Warning | LogLevel.Info | LogLevel.Debug | LogLevel.Trace | LogLevel.None;
    POSTGRES_SSL_CERTIFICATE?: string | undefined;
}, {
    POSTGRES_URL: string;
    POSTGRES_SSL_CERTIFICATE?: string | undefined;
    MIGRATIONS_FOLDER?: string | undefined;
    LOG_LEVEL?: "All" | "Debug" | "Info" | "Error" | "None" | "Fatal" | "Warning" | "Trace" | undefined;
}>;
export type IEnv = z.infer<typeof IEnv>;
declare const EnvService_base: Context.TagClass<EnvService, "EnvService", {
    POSTGRES_URL: string;
    MIGRATIONS_FOLDER: string;
    LOG_LEVEL: LogLevel.All | LogLevel.Fatal | LogLevel.Error | LogLevel.Warning | LogLevel.Info | LogLevel.Debug | LogLevel.Trace | LogLevel.None;
    POSTGRES_SSL_CERTIFICATE?: string | undefined;
}>;
export declare class EnvService extends EnvService_base {
}
export declare const EnvServiceLive: Layer.Layer<EnvService, z.ZodError<{
    POSTGRES_URL: string;
    POSTGRES_SSL_CERTIFICATE?: string | undefined;
    MIGRATIONS_FOLDER?: string | undefined;
    LOG_LEVEL?: "All" | "Debug" | "Info" | "Error" | "None" | "Fatal" | "Warning" | "Trace" | undefined;
}>, never>;
export {};
//# sourceMappingURL=service.d.ts.map