import jwt from "jsonwebtoken";
import {
  findUserByEmail,
  findUserById,
  createUser,
  comparePassword,
} from "../models/user.models.js";

// Here we generate jwt token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// User registration controller
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(401).json({
        success: false,
        message: "Account is already existed with this account",
      });
    }
    const user = await createUser({ name, email, password });
    const token = generateToken(user.id);
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email, { withPassword: true });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    // Checking the password of user is correct or not
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    // Generating token
    const token = generateToken(user.id);
    if (!token) {
      return res.status(500).json({
        success: false,
        message: "Error generating token",
      });
    }
    res.status(200).json({
      success: true,
      message: "Login Successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get the current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Logout the user
export const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logout successfully",
  });
};
