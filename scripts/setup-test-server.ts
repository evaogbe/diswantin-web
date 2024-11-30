import { exec as baseExec } from "node:child_process";
import fs from "node:fs/promises";
import util from "node:util";
import pg from "pg";

const exec = util.promisify(baseExec);

function randomString({
  length = 11,
  pool = "abcdefghijklmnopqrstuvwxyz",
} = {}) {
  return Array.from({ length })
    .map(() => pool.charAt(Math.random() * pool.length))
    .join("");
}

const dbUrl = "postgres://postgres:password@localhost:5433";
const dbName = randomString();

const env = await fs.readFile("env/example.env", { encoding: "utf8" });
await fs.writeFile(
  "env/test.env",
  env.replace(/DATABASE_URL=.*$/m, `DATABASE_URL=${dbUrl}/${dbName}`),
);

// pg is a commonjs module that doesn't use named exports
// eslint-disable-next-line import-x/no-named-as-default-member
const db = new pg.Client({ connectionString: `${dbUrl}/postgres` });
await db.connect();
await db.query(`DROP DATABASE IF EXISTS ${dbName}`);
await db.query(`CREATE DATABASE ${dbName}`);
await db.end();

const { stderr } = await exec("npm run db:push -- --force");
if (stderr) {
  console.error(stderr);
  process.exit(1);
}
