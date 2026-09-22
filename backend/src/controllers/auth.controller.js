const bcrypt = require("bcryptjs");

const User = require("../models/User");
const { AppError } = require("../middleware/errorHandler");

const {
  generateToken,
  setAuthCookie,
  clearAuthCookie,
} = require("../utils/auth");

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    profile: user.profile || {},
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { name, email, password, profile } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return next(
        new AppError("An account with this email already exists.", 409),
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      profile: profile || {},
    });

    const token = generateToken(user._id.toString());

    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        user: sanitizeUser(user),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select("+password");

    if (!user) {
      return next(new AppError("Invalid email or password.", 401));
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return next(new AppError("Invalid email or password.", 401));
    }

    const token = generateToken(user._id.toString());

    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: sanitizeUser(user),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/logout
 */
function logout(req, res) {
  clearAuthCookie(res);

  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
}

/**
 * GET /api/auth/me
 */
async function getCurrentUser(req, res) {
  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(req.user),
    },
  });
}

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
};
