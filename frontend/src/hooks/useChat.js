import { useCallback, useState } from "react";
import {
  fetchConversation,
  fetchConversations,
  removeConversation,
  sendChatMessage,
} from "../services/chatService";

// The user's local calendar day as YYYY-MM-DD (what the backend expects).
function localDate() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function useChat() {
  const [conversations, setConversations] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadConversations = useCallback(async () => {
    setHistoryLoading(true);
    try {
      setConversations(await fetchConversations());
    } catch (err) {
      setError(err.message);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const openConversation = useCallback(async (id) => {
    setError("");
    setLoadingConversation(true);
    try {
      const c = await fetchConversation(id);
      setActiveId(c.id);
      setMessages(c.messages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingConversation(false);
    }
  }, []);

  const newChat = useCallback(() => {
    setActiveId(null);
    setMessages([]);
    setError("");
  }, []);

  /** Returns true on success so the UI knows whether to keep the draft. */
  const send = useCallback(
    async (text) => {
      if (sending) return false;
      setError("");
      const temp = {
        id: `tmp-${Date.now()}`,
        role: "user",
        content: text,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, temp]);
      setSending(true);
      try {
        const { conversation, reply } = await sendChatMessage({
          conversationId: activeId,
          message: text,
          date: localDate(),
        });
        setActiveId(conversation.id);
        setMessages((prev) => [...prev, reply]);
        setConversations((prev) => [
          {
            id: conversation.id,
            title: conversation.title,
            updatedAt: reply.createdAt,
          },
          ...prev.filter((c) => c.id !== conversation.id),
        ]);
        return true;
      } catch (err) {
        // Backend saves nothing on failure, so drop the optimistic message.
        setMessages((prev) => prev.filter((m) => m.id !== temp.id));
        setError(err.message);
        return false;
      } finally {
        setSending(false);
      }
    },
    [activeId, sending],
  );

  const deleteConversation = useCallback(
    async (id) => {
      setError("");
      try {
        await removeConversation(id);
        setConversations((prev) => prev.filter((c) => c.id !== id));
        if (id === activeId) newChat();
      } catch (err) {
        setError(err.message);
      }
    },
    [activeId, newChat],
  );

  return {
    conversations,
    historyLoading,
    activeId,
    messages,
    loadingConversation,
    sending,
    error,
    setError,
    loadConversations,
    openConversation,
    newChat,
    send,
    deleteConversation,
  };
}
