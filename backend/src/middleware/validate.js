const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

/**
 * Runs after express-validator check(...) chains. If any validation failed,
 * responds with a 400 and a clear, user-friendly message instead of letting
 * the request continue to the controller.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(' ');
    return next(new AppError(message, 400));
  }
  next();
}

module.exports = validate;
