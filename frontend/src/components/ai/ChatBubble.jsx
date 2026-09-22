import { useEffect, useState } from 'react';
import ChatWindow from './ChatWindow';
import useChat from '../../hooks/useChat';

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const chat = useChat();
  const { loadConversations } = chat;

  // Fetch past chats the first time the window opens.
  useEffect(() => {
    if (open && !loadedOnce) {
      setLoadedOnce(true);
      loadConversations();
    }
  }, [open, loadedOnce, loadConversations]);

  // Escape closes the window.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {open && <ChatWindow chat={chat} onClose={() => setOpen(false)} />}

      <button
        type="button"
        aria-label={open ? 'Close AI chat' : 'Open AI chat'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-black shadow-lg shadow-black/50 transition-all hover:scale-105 hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg sm:bottom-6 sm:right-6"
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
          </svg>
        )}
      </button>
    </>
  );
}