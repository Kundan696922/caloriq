const User = require("../models/User");
const { AppError } = require("../middleware/errorHandler");

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
 * GET /api/users/profile
 */
function getProfile(req, res) {
  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(req.user),
    },
  });
}

/**
 * PATCH /api/users/profile
 */
async function updateProfile(req, res, next) {
  try {
    const { name, profile } = req.body;

    const updates = {};

    if (name !== undefined) {
      updates.name = name.trim();
    }

    if (profile !== undefined) {
      updates.profile = {
        ...req.user.profile?.toObject?.(),
        ...profile,
      };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!user) {
      return next(new AppError("User account not found.", 404));
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: {
        user: sanitizeUser(user),
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
};
