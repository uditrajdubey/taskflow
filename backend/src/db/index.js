import pg from "pg";
import { DB_NAME } from "../constant.js";

const { Pool } = pg;

// The pool is created lazily (on first use) rather than at module-load time.
// Reason: with ES modules, `import` statements are hoisted above other code,
// so if this file built the Pool as soon as it was imported, it could run
// before an entrypoint's `dotenv.config()` call had a chance to populate
// process.env — silently connecting with the wrong/default settings.
let pool;

const buildConfig = () =>
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl:
          process.env.PGSSL === "true"
            ? { rejectUnauthorized: false }
            : false,
      }
    : {
        host: process.env.PGHOST || "localhost",
        port: Number(process.env.PGPORT) || 5432,
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD || "postgres",
        database: process.env.PGDATABASE || DB_NAME,
        ssl:
          process.env.PGSSL === "true"
            ? { rejectUnauthorized: false }
            : false,
      };

// A single shared connection pool for the whole app.
// Either set DATABASE_URL, or the individual PG* variables.
export const getPool = () => {
  if (!pool) {
    pool = new Pool(buildConfig());
    pool.on("error", (err) => {
      console.error("Unexpected error on idle Postgres client", err);
    });
  }
  return pool;
};

// Simple wrapper so controllers/models don't need to import the pool directly.
export const query = (text, params) => getPool().query(text, params);

export const connectDB = async () => {
  try {
    const client = await getPool().connect();
    const result = await client.query("SELECT NOW()");
    client.release();
    console.log(
      `\n PostgreSQL connected !! DB HOST: ${
        process.env.PGHOST || "from DATABASE_URL"
      } @ ${result.rows[0].now}`
    );
  } catch (error) {
    console.log("PostgreSQL connection error", error);
    process.exit(1);
  }
};

export const closeDB = async () => {
  if (pool) await pool.end();
};
