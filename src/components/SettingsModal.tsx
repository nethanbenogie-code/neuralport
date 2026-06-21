import { useState } from "react";
import { Check, Loader2, RefreshCw, X } from "lucide-react";
import type { Settings } from "../types";
import { listModels } from "../lib/api";

export function SettingsModal({
  settings,
  onSave,
  onClose,
}: {
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<Settings>(settings);
  const [models, setModels] = useState<string[]>([]);
  const [status, setStatus] = useState<
    { kind: "idle" | "loading" | "ok" | "error"; msg?: string }
  >({ kind: "idle" });

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const test = async () => {
    setStatus({ kind: "loading" });
    try {
      const list = await listModels(draft);
      setModels(list.map((m) => m.id));
      setStatus({
        kind: "ok",
        msg:
          list.length > 0
            ? `Connected · ${list.length} model${list.length > 1 ? "s" : ""} found`
            : "Connected, but no models reported",
      });
      if (list.length && !list.some((m) => m.id === draft.model)) {
        set("model", list[0].id);
      }
    } catch (e) {
      setStatus({
        kind: "error",
        msg: e instanceof Error ? e.message : "Connection failed",
      });
    }
  };

  const label = "mb-1 block text-xs font-medium text-muted";
  const input =
    "w-full rounded-lg border border-line bg-void px-3 py-2 text-sm text-ink placeholder:text-faint focus:border-synapse/50 focus:outline-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">Settings</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted hover:text-ink"
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <label className={label}>Endpoint base URL</label>
            <input
              className={input}
              value={draft.baseUrl}
              onChange={(e) => set("baseUrl", e.target.value)}
              placeholder="http://localhost:1234/v1"
            />
            <p className="mt-1 text-[11px] text-faint">
              LM Studio: <span className="font-mono">…:1234/v1</span> · Ollama:{" "}
              <span className="font-mono">…:11434/v1</span> · llama.cpp:{" "}
              <span className="font-mono">…:8080/v1</span>
            </p>
          </div>

          <div>
            <label className={label}>API key (optional)</label>
            <input
              className={input}
              type="password"
              value={draft.apiKey}
              onChange={(e) => set("apiKey", e.target.value)}
              placeholder="usually leave blank for local servers"
            />
          </div>

          <div>
            <label className={label}>Model</label>
            <div className="flex gap-2">
              {models.length > 0 ? (
                <select
                  className={input}
                  value={draft.model}
                  onChange={(e) => set("model", e.target.value)}
                >
                  {models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className={input}
                  value={draft.model}
                  onChange={(e) => set("model", e.target.value)}
                  placeholder="model id"
                />
              )}
              <button
                onClick={test}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-raised px-3 text-xs font-medium text-ink hover:border-synapse/40"
              >
                {status.kind === "loading" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                Test
              </button>
            </div>
            {status.kind !== "idle" && status.kind !== "loading" && (
              <p
                className={`mt-1.5 flex items-center gap-1 text-[11px] ${
                  status.kind === "ok" ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {status.kind === "ok" && <Check size={12} />}
                {status.msg}
              </p>
            )}
          </div>

          <div>
            <label className={label}>System prompt (optional)</label>
            <textarea
              className={`${input} min-h-[72px] resize-y`}
              value={draft.systemPrompt}
              onChange={(e) => set("systemPrompt", e.target.value)}
              placeholder="You are a helpful assistant…"
            />
          </div>

          <div>
            <label className={label}>
              Temperature · {draft.temperature.toFixed(2)}
            </label>
            <input
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={draft.temperature}
              onChange={(e) => set("temperature", Number(e.target.value))}
              className="w-full accent-synapse"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-muted hover:text-ink"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            className="rounded-lg bg-synapse px-4 py-2 text-sm font-medium text-void hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
