import { query } from "../db/index.js";

const toCategoryJSON = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    color: row.color,
    userId: row.user_id,
    todoCount: row.todo_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const findCategoriesByUser = async (userId) => {
  const { rows } = await query(
    "SELECT * FROM categories WHERE user_id = $1 ORDER BY created_at ASC",
    [userId]
  );
  return rows.map(toCategoryJSON);
};

export const findCategoryByUserAndName = async (userId, name) => {
  const { rows } = await query(
    "SELECT * FROM categories WHERE user_id = $1 AND name = $2",
    [userId, name]
  );
  return toCategoryJSON(rows[0]);
};

export const findCategoryByUserAndNameExcludingId = async (userId, name, excludeId) => {
  const { rows } = await query(
    "SELECT * FROM categories WHERE user_id = $1 AND name = $2 AND id <> $3",
    [userId, name, excludeId]
  );
  return toCategoryJSON(rows[0]);
};

export const findCategoryByIdForUser = async (id, userId) => {
  const { rows } = await query(
    "SELECT * FROM categories WHERE id = $1 AND user_id = $2",
    [id, userId]
  );
  return toCategoryJSON(rows[0]);
};

export const createCategory = async ({ name, color, userId }) => {
  const { rows } = await query(
    `INSERT INTO categories (name, color, user_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [name, color, userId]
  );
  return toCategoryJSON(rows[0]);
};

export const updateCategoryById = async (id, { name, color }) => {
  const { rows } = await query(
    `UPDATE categories
     SET name = COALESCE($1, name),
         color = COALESCE($2, color)
     WHERE id = $3
     RETURNING *`,
    [name, color, id]
  );
  return toCategoryJSON(rows[0]);
};

export const deleteCategoryById = async (id) => {
  await query("DELETE FROM categories WHERE id = $1", [id]);
};

export { toCategoryJSON };
