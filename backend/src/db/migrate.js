import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { query, closeDB } from "./index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const run = async () => {
  const sql = readFileSync(join(__dirname, "schema.sql"), "utf-8");
  try {
    console.log("Running migrations...");
    await query(sql);
    console.log("Migrations applied successfully ✅");
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await closeDB();
  }
};

run();
