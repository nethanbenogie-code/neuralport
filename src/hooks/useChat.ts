import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatMessage, Conversation, Settings } from "../types";
import { streamChat } from "../lib/api";
import {
  loadConversations,
  loadSettings,
  saveConversations,
  saveSettings,
  uid,
} from "../lib/storage";

function titleFrom(text: string): string {
  const clean = text.trim().replace(/\s+/g, " ");
  return clean.length > 42 ? clean.slice(0, 42) + "…" : clean || "New chat";
}

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    loadConversations(),
  );
  const [activeId, setActiveId] = useState<string | null>(
    () => loadConversations()[0]?.id ?? null,
  );
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => saveConversations(conversations), [conversations]);
  useEffect(() => saveSettings(settings), [settings]);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const newChat = useCallback(() => {
    setActiveId(null);
    setError(null);
  }, []);

  const selectChat = useCallback((id: string) => {
    setActiveId(id);
    setError(null);
  }, []);

  const deleteChat = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (id === activeId) setActiveId(next[0]?.id ?? null);
        return next;
      });
    },
    [activeId],
  );

  const renameChat = useCallback((id: string, title: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c)),
    );
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim();
      if (!content || isStreaming) return;
      setError(null);

      const now = Date.now();
      const userMsg: ChatMessage = {
        id: uid(),
        role: "user",
        content,
        createdAt: now,
      };
      const assistantMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: "",
        pending: true,
        createdAt: now + 1,
      };

      // Resolve which conversation we're appending to (create one if needed).
      let convoId = activeId;
      let history: ChatMessage[];

      if (active) {
        history = [...active.messages, userMsg];
        setConversations((prev) =>
          prev.map((c) =>
            c.id === active.id
              ? {
                  ...c,
                  messages: [...c.messages, userMsg, assistantMsg],
                  updatedAt: now,
                }
              : c,
          ),
        );
      } else {
        const fresh: Conversation = {
          id: uid(),
          title: titleFrom(content),
          messages: [userMsg, assistantMsg],
          createdAt: now,
          updatedAt: now,
        };
        convoId = fresh.id;
        history = [userMsg];
        setConversations((prev) => [fresh, ...prev]);
        setActiveId(fresh.id);
      }

      const patchAssistant = (updater: (m: ChatMessage) => ChatMessage) => {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convoId
              ? {
                  ...c,
                  updatedAt: Date.now(),
                  messages: c.messages.map((m) =>
                    m.id === assistantMsg.id ? updater(m) : m,
                  ),
                }
              : c,
          ),
        );
      };

      const controller = new AbortController();
      abortRef.current = controller;
      setIsStreaming(true);

      try {
        await streamChat(settings, history, {
          signal: controller.signal,
          onToken: (token) =>
            patchAssistant((m) => ({ ...m, content: m.content + token })),
        });
        patchAssistant((m) => ({ ...m, pending: false }));
      } catch (err) {
        const aborted =
          err instanceof DOMException && err.name === "AbortError";
        if (!aborted) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
        patchAssistant((m) => ({
          ...m,
          pending: false,
          content:
            m.content ||
            (aborted ? "_Stopped._" : "_The model didn't respond._"),
        }));
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [active, activeId, isStreaming, settings],
  );

  return {
    conversations,
    active,
    activeId,
    settings,
    setSettings,
    isStreaming,
    error,
    setError,
    newChat,
    selectChat,
    deleteChat,
    renameChat,
    send,
    stop,
  };
}
