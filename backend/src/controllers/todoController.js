import {
  getTodos as getTodosModel,
  getTodoByIdForUser,
  createTodo as createTodoModel,
  updateTodoByIdForUser,
  deleteTodoByIdForUser,
  toggleTodoByIdForUser,
} from "../models/todo.models.js";
import { validateTodoInput } from "../utils/validators.js";

// Get all todos
export const getTodos = async (req, res) => {
  try {
    // Read filters from req.query for GET requests
    const { page = 1, limit = 10, completed, priority, category, search } = req.query;

    const { todos, total } = await getTodosModel(req.user.id, {
      page,
      limit,
      completed,
      priority,
      category,
      search,
    });

    res.status(200).json({
      success: true,
      data: {
        todos,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total,
        },
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get the single todo
export const getTodo = async (req, res) => {
  try {
    const todo = await getTodoByIdForUser(req.params.id, req.user.id);
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }
    res.status(200).json({
      success: true,
      data: { todo },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Create a new todo
export const createTodo = async (req, res) => {
  try {
    const validationError = validateTodoInput(req.body);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }
    const todo = await createTodoModel(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: "Todo created successfully",
      data: { todo },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTodo = async (req, res) => {
  try {
    const validationError = validateTodoInput(req.body, { partial: true });
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }
    const todo = await updateTodoByIdForUser(req.params.id, req.user.id, req.body);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Todo updated successfully",
      data: { todo },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const deleted = await deleteTodoByIdForUser(req.params.id, req.user.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Todo deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const toggleTodo = async (req, res) => {
  try {
    const todo = await toggleTodoByIdForUser(req.params.id, req.user.id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Todo status updated successfully",
      data: { todo },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
