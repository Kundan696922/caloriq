const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true, maxlength: 4000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, trim: true, maxlength: 80, default: "New chat" },
    messages: [messageSchema],
  },
  { timestamps: true },
);

conversationSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
