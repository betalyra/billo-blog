import * as migrator from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import invariant from "tiny-invariant";
import postgres from "postgres";

const MIGRATIONS_FOLDER =
  process.env.MIGRATIONS_FOLDER ?? "../../migrations/postgres";

const POSTGRES_URL = process.env.POSTGRES_URL;
invariant(POSTGRES_URL, "POSTGRES_URL is required");

const POSTGRES_SSL_CERTIFICATE = process.env.POSTGRES_SSL_CERTIFICATE;

const run = async () => {
  const client = postgres(POSTGRES_URL, {
    // max: 1,
    ssl: POSTGRES_SSL_CERTIFICATE
      ? {
          mode: "verify-ca",
          sslrootcert: Buffer.from(POSTGRES_SSL_CERTIFICATE, "base64"),
          rejectUnauthorized: false,
        }
      : false,
  });
  const db = drizzle(client, {
    casing: "snake_case",
  });
  await migrator.migrate(db, {
    migrationsFolder: MIGRATIONS_FOLDER,
  });
  client.end();
};

await run();
