#!/bin/sh
set -e

echo "Waiting for PostgreSQL to be ready..."
ATTEMPTS=0
until node -e "
const { Pool } = require('pg');
const pool = new Pool(process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : {
  host: process.env.PGHOST, port: process.env.PGPORT, user: process.env.PGUSER,
  password: process.env.PGPASSWORD, database: process.env.PGDATABASE
});
pool.query('SELECT 1').then(() => { pool.end(); process.exit(0); }).catch(() => { pool.end(); process.exit(1); });
" 2>/dev/null; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -ge 30 ]; then
    echo "PostgreSQL did not become ready in time." >&2
    exit 1
  fi
  sleep 2
done

echo "PostgreSQL is ready. Applying schema..."
node src/db/migrate.js

echo "Starting application..."
exec "$@"
