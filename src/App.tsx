import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Menu, Settings as SettingsIcon } from "lucide-react";
import { useChat } from "./hooks/useChat";
import { Sidebar } from "./components/Sidebar";
import { Message } from "./components/Message";
import { ChatInput } from "./components/ChatInput";
import { SettingsModal } from "./components/SettingsModal";
import { NeuronCorner } from "./components/NeuronCorner";

const SUGGESTIONS = [
  "Explain the difference between IndexedDB and localStorage",
  "Write a Python function to hash a receipt with SHA-256",
  "Summarize the BIR rules for sequential invoice numbering",
  "Give me a Tailwind layout for a 3-column dashboard",
];

export default function App() {
  const chat = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  const messages = chat.active?.messages ?? [];

  // Track whether the user is near the bottom; only auto-scroll if so.
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottom.current = dist < 120;
  };

  useEffect(() => {
    if (stickToBottom.current) {
      endRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages]);

  const endpointReady = chat.settings.baseUrl.trim().length > 0;

  return (
    <div className="flex h-full overflow-hidden bg-void text-ink">
      <Sidebar
        conversations={chat.conversations}
        activeId={chat.activeId}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNew={() => {
          chat.newChat();
          setSidebarOpen(false);
        }}
        onSelect={(id) => {
          chat.selectChat(id);
          setSidebarOpen(false);
        }}
        onDelete={chat.deleteChat}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-line bg-void/80 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-1.5 text-muted hover:text-ink md:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-medium text-ink">
                {chat.active?.title ?? "New chat"}
              </h1>
              <p className="font-mono text-[10px] text-faint">
                {chat.settings.model}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="rounded-md p-1.5 text-muted hover:text-ink"
            aria-label="Settings"
          >
            <SettingsIcon size={18} />
          </button>
        </header>

        {chat.error && (
          <div className="flex items-start gap-2 border-b border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="break-words">{chat.error}</span>
            </div>
            <button
              onClick={() => chat.setError(null)}
              className="shrink-0 text-red-400 hover:text-red-200"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Messages */}
        <div
          ref={scrollRef}
          onScroll={onScroll}
          className="flex-1 overflow-y-auto"
        >
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="mb-5 opacity-90">
                <NeuronCorner />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-ink">
                What should we think about?
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted">
                Talk to your local model. Nothing leaves your machine — history
                lives in this browser, requests go straight to your endpoint.
              </p>

              <div className="mt-7 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => endpointReady && chat.send(s)}
                    disabled={!endpointReady}
                    className="rounded-xl border border-line bg-surface px-4 py-3 text-left text-sm text-muted transition-colors hover:border-synapse/40 hover:text-ink disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>

              {!endpointReady && (
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="mt-6 text-xs text-synapse underline underline-offset-2"
                >
                  Configure your endpoint to begin
                </button>
              )}
            </div>
          ) : (
            <div className="pb-4">
              {messages.map((m) => (
                <Message key={m.id} message={m} />
              ))}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <ChatInput
          onSend={chat.send}
          onStop={chat.stop}
          isStreaming={chat.isStreaming}
          disabled={!endpointReady}
        />
      </div>

      {settingsOpen && (
        <SettingsModal
          settings={chat.settings}
          onSave={chat.setSettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
