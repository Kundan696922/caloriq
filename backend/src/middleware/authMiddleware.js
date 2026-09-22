const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { AppError } = require("./errorHandler");
const { AUTH_COOKIE_NAME } = require("../utils/auth");

async function protect(req, res, next) {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];

    if (!token) {
      return next(new AppError("Authentication required. Please log in.", 401));
    }

    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return next(err);
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return next(new AppError("User account no longer exists.", 401));
    }

    req.user = user;

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = protect;
