import bcrypt from "bcryptjs";
import { query } from "../db/index.js";

// Shape returned to clients — mirrors the old Mongoose toJSON() (no password)
const toPublicUser = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id, // kept for compatibility with any leftover Mongo-style code
    name: row.name,
    email: row.email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const findUserByEmail = async (email, { withPassword = false } = {}) => {
  const columns = withPassword
    ? "id, name, email, password, created_at, updated_at"
    : "id, name, email, created_at, updated_at";
  const { rows } = await query(
    `SELECT ${columns} FROM users WHERE email = $1`,
    [email]
  );
  return rows[0] || null;
};

export const findUserById = async (id) => {
  const { rows } = await query(
    "SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1",
    [id]
  );
  return toPublicUser(rows[0]);
};

export const createUser = async ({ name, email, password }) => {
  const rounds = Number(process.env.BCRYPT_ROUNDS) || 12;
  const hashedPassword = await bcrypt.hash(password, rounds);
  const { rows } = await query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at, updated_at`,
    [name, email, hashedPassword]
  );
  return toPublicUser(rows[0]);
};

export const comparePassword = async (candidatePassword, hashedPassword) => {
  return bcrypt.compare(candidatePassword, hashedPassword);
};

export { toPublicUser };
