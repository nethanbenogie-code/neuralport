import { useState } from "react";
import {
  MessageSquare,
  Plus,
  Settings as SettingsIcon,
  Trash2,
  X,
} from "lucide-react";
import type { Conversation } from "../types";
import { NeuronCorner } from "./NeuronCorner";

export function Sidebar({
  conversations,
  activeId,
  open,
  onClose,
  onNew,
  onSelect,
  onDelete,
  onOpenSettings,
}: {
  conversations: Conversation[];
  activeId: string | null;
  open: boolean;
  onClose: () => void;
  onNew: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenSettings: () => void;
}) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-line bg-surface transition-transform duration-200 md:static md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand + neuron signature */}
        <div className="relative overflow-hidden border-b border-line">
          <div className="pointer-events-none absolute -right-6 -top-6 opacity-80">
            <NeuronCorner />
          </div>
          <div className="relative flex items-center justify-between px-4 py-4">
            <div>
              <div className="text-sm font-semibold tracking-tight text-ink">
                Neuro Chat
              </div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-faint">
                local · offline-first
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1 text-muted hover:text-ink md:hidden"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-3">
          <button
            onClick={onNew}
            className="flex w-full items-center gap-2 rounded-lg border border-line bg-raised px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:border-synapse/40 hover:bg-panel"
          >
            <Plus size={16} className="text-synapse" />
            New chat
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-2">
          {conversations.length === 0 ? (
            <p className="px-3 py-6 text-center text-xs text-faint">
              No conversations yet.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {conversations.map((c) => {
                const isActive = c.id === activeId;
                return (
                  <li key={c.id}>
                    <div
                      className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive
                          ? "bg-raised text-ink"
                          : "text-muted hover:bg-panel hover:text-ink"
                      }`}
                    >
                      <button
                        onClick={() => onSelect(c.id)}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      >
                        <MessageSquare
                          size={14}
                          className="shrink-0 text-faint"
                        />
                        <span className="truncate">{c.title}</span>
                      </button>

                      {confirmId === c.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onDelete(c.id);
                              setConfirmId(null);
                            }}
                            className="rounded px-1.5 py-0.5 text-[11px] text-red-400 hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="rounded px-1.5 py-0.5 text-[11px] text-faint hover:text-ink"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(c.id)}
                          aria-label="Delete conversation"
                          className="rounded p-1 text-faint opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>

        <div className="border-t border-line p-3">
          <button
            onClick={onOpenSettings}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-panel hover:text-ink"
          >
            <SettingsIcon size={16} />
            Settings
          </button>
        </div>
      </aside>
    </>
  );
}
