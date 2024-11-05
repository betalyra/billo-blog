import * as drizzleKit from "drizzle-kit";

const generateConfig = () => {
  return drizzleKit.defineConfig({
    dialect: "postgresql",
    schema: "./src/db/postgres/schema.ts",
    out: "../../migrations/postgres",
    dbCredentials: {
      url: "postgresql://billo:billo@localhost:9999/billo",
    },
    migrations: {
      table: "journal",
      schema: "billo",
    },
    casing: "snake_case",
  });
};
const config = generateConfig();
console.log("config", config);
export default config;
