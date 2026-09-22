import api from "./api";

// api.js already normalizes errors to `new Error(message)`.

export async function sendChatMessage({ conversationId, message, date }) {
  const res = await api.post("/chat/messages", {
    ...(conversationId ? { conversationId } : {}),
    message,
    date,
  });
  return res.data; // { success, conversation: {id,title}, reply }
}

export async function fetchConversations() {
  const res = await api.get("/chat/conversations");
  return res.data.conversations;
}

export async function fetchConversation(id) {
  const res = await api.get(`/chat/conversations/${id}`);
  return res.data.conversation;
}

export async function removeConversation(id) {
  const res = await api.delete(`/chat/conversations/${id}`);
  return res.data;
}
