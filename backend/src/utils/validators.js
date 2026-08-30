// Mirrors the validation messages the original Mongoose todo schema used
// to give, so the API keeps returning friendly errors instead of raw
// PostgreSQL constraint-violation text.
export const validateTodoInput = (body, { partial = false } = {}) => {
  const { title, description, priority, category, dueDate, tags } = body;

  if (!partial || title !== undefined) {
    if (!title || !String(title).trim()) {
      return "Todo title is required";
    }
    if (String(title).length > 100) {
      return "Title cannot exceed 100 characters";
    }
  }

  if (!partial || description !== undefined) {
    if (!description || String(description).trim().length < 10) {
      return "Description must be greater than 10 characters";
    }
    if (String(description).length > 500) {
      return "Description cannot exceed 500 characters";
    }
  }

  if (priority !== undefined && !["low", "medium", "high"].includes(priority)) {
    return "Priority must be one of: low, medium, high";
  }

  if (category !== undefined && String(category).length > 30) {
    return "Category cannot exceed 30 characters";
  }

  if (dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    if (due < today) {
      return "Due date must be today or in the future";
    }
  }

  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      return "Tags must be an array";
    }
    if (tags.some((tag) => String(tag).length > 20)) {
      return "Tag cannot exceed 20 characters";
    }
  }

  return null;
};
