const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const { AppError } = require("../middleware/errorHandler");
const { generateChatReply } = require("../services/chatService");

const MAX_MESSAGE_LENGTH = 1000;
const MAX_MESSAGES_PER_CONVERSATION = 100;
const MAX_CONVERSATIONS_PER_USER = 50;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function assertValidId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError("Invalid conversation id.", 400);
  }
}

function makeTitle(message) {
  const t = message.replace(/\s+/g, " ").trim();
  return t.length > 50 ? `${t.slice(0, 47)}...` : t;
}

async function sendMessage(req, res, next) {
  try {
    const { conversationId, date } = req.body || {};
    const message =
      typeof req.body?.message === "string" ? req.body.message.trim() : "";

    if (!message) throw new AppError("Message cannot be empty.", 400);
    if (message.length > MAX_MESSAGE_LENGTH) {
      throw new AppError(
        `Message is too long (max ${MAX_MESSAGE_LENGTH} characters).`,
        400,
      );
    }
    // Client sends its local calendar day; fall back to the server's date.
    const day =
      typeof date === "string" && DATE_RE.test(date)
        ? date
        : new Date().toISOString().slice(0, 10);

    let conversation;
    if (conversationId) {
      assertValidId(conversationId);
      conversation = await Conversation.findOne({
        _id: conversationId,
        user: req.user._id,
      });
      if (!conversation) throw new AppError("Conversation not found.", 404);
      if (conversation.messages.length >= MAX_MESSAGES_PER_CONVERSATION) {
        throw new AppError(
          "This conversation is full. Please start a new chat.",
          400,
        );
      }
    } else {
      const count = await Conversation.countDocuments({ user: req.user._id });
      if (count >= MAX_CONVERSATIONS_PER_USER) {
        throw new AppError(
          "You've reached the chat limit. Please delete an old chat first.",
          400,
        );
      }
      conversation = new Conversation({
        user: req.user._id,
        title: makeTitle(message),
        messages: [],
      });
    }

    // Call the AI BEFORE saving, so a failed call leaves no orphaned message.
    const { text } = await generateChatReply({
      user: req.user,
      history: conversation.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      message,
      date: day,
    });

    conversation.messages.push(
      { role: "user", content: message },
      { role: "assistant", content: text },
    );
    await conversation.save();

    const reply = conversation.messages[conversation.messages.length - 1];
    res.status(201).json({
      success: true,
      conversation: { id: conversation._id, title: conversation.title },
      reply: {
        id: reply._id,
        role: reply.role,
        content: reply.content,
        createdAt: reply.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function listConversations(req, res, next) {
  try {
    const conversations = await Conversation.find({ user: req.user._id })
      .select("title updatedAt")
      .sort({ updatedAt: -1 })
      .limit(MAX_CONVERSATIONS_PER_USER)
      .lean();

    res.json({
      success: true,
      conversations: conversations.map((c) => ({
        id: c._id,
        title: c.title,
        updatedAt: c.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

async function getConversation(req, res, next) {
  try {
    assertValidId(req.params.id);
    const c = await Conversation.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).lean();
    if (!c) throw new AppError("Conversation not found.", 404);

    res.json({
      success: true,
      conversation: {
        id: c._id,
        title: c.title,
        messages: c.messages.map((m) => ({
          id: m._id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function deleteConversation(req, res, next) {
  try {
    assertValidId(req.params.id);
    const result = await Conversation.deleteOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (result.deletedCount === 0) {
      throw new AppError("Conversation not found.", 404);
    }
    res.json({ success: true, message: "Conversation deleted." });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  sendMessage,
  listConversations,
  getConversation,
  deleteConversation,
};
