import { query } from "../db/index.js";

// Mirrors the old Mongoose toJSON({ virtuals: true }) output,
// including the computed `isOverdue` virtual.
const toTodoJSON = (row) => {
  if (!row) return null;
  const dueDate = row.due_date ? new Date(row.due_date) : null;
  const isOverdue = Boolean(dueDate && !row.completed && new Date() > dueDate);

  return {
    id: row.id,
    _id: row.id,
    title: row.title,
    description: row.description,
    completed: row.completed,
    priority: row.priority,
    category: row.category,
    dueDate: row.due_date,
    userId: row.user_id,
    tags: row.tags || [],
    isArchived: row.is_archived,
    archived: row.is_archived, // convenience alias used by the frontend filter
    isOverdue,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

// Columns a client is allowed to set via create/update
const ALLOWED_FIELDS = {
  title: "title",
  description: "description",
  completed: "completed",
  priority: "priority",
  category: "category",
  dueDate: "due_date",
  tags: "tags",
  isArchived: "is_archived",
};

export const getTodos = async (userId, filters = {}) => {
  const { page = 1, limit = 10, completed, priority, category, search } = filters;
  const conditions = ["user_id = $1", "is_archived = FALSE"];
  const params = [userId];

  if (completed !== undefined) {
    params.push(completed === "true" || completed === true);
    conditions.push(`completed = $${params.length}`);
  }
  if (priority) {
    params.push(priority);
    conditions.push(`priority = $${params.length}`);
  }
  if (category) {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(title ILIKE $${params.length} OR description ILIKE $${params.length})`);
  }

  const whereClause = conditions.join(" AND ");

  const countResult = await query(
    `SELECT COUNT(*)::int AS total FROM todos WHERE ${whereClause}`,
    params
  );
  const total = countResult.rows[0].total;

  const limitNum = Number(limit) || 10;
  const pageNum = Number(page) || 1;
  const offset = (pageNum - 1) * limitNum;

  params.push(limitNum, offset);
  const { rows } = await query(
    `SELECT * FROM todos WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return {
    todos: rows.map(toTodoJSON),
    total,
  };
};

export const getTodoByIdForUser = async (id, userId) => {
  const { rows } = await query(
    "SELECT * FROM todos WHERE id = $1 AND user_id = $2",
    [id, userId]
  );
  return toTodoJSON(rows[0]);
};

export const createTodo = async (userId, data) => {
  const { rows } = await query(
    `INSERT INTO todos (title, description, priority, category, due_date, user_id, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.title,
      data.description,
      data.priority || "medium",
      data.category || "general",
      data.dueDate || null,
      userId,
      data.tags || [],
    ]
  );
  return toTodoJSON(rows[0]);
};

export const updateTodoByIdForUser = async (id, userId, data) => {
  const setClauses = [];
  const params = [];

  for (const [field, column] of Object.entries(ALLOWED_FIELDS)) {
    if (data[field] !== undefined) {
      params.push(data[field]);
      setClauses.push(`${column} = $${params.length}`);
    }
  }

  if (setClauses.length === 0) {
    return getTodoByIdForUser(id, userId);
  }

  params.push(id, userId);
  const { rows } = await query(
    `UPDATE todos SET ${setClauses.join(", ")}
     WHERE id = $${params.length - 1} AND user_id = $${params.length}
     RETURNING *`,
    params
  );
  return toTodoJSON(rows[0]);
};

export const deleteTodoByIdForUser = async (id, userId) => {
  const { rows } = await query(
    "DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING id",
    [id, userId]
  );
  return rows[0] || null;
};

export const toggleTodoByIdForUser = async (id, userId) => {
  const { rows } = await query(
    `UPDATE todos SET completed = NOT completed
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
    [id, userId]
  );
  return toTodoJSON(rows[0]);
};

export { toTodoJSON };
