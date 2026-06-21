import { useEffect, useRef, useState } from "react";
import { ArrowUp, Square } from "lucide-react";

export function ChatInput({
  onSend,
  onStop,
  isStreaming,
  disabled,
}: {
  onSend: (text: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  // Auto-grow the textarea up to a cap.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [value]);

  const submit = () => {
    if (!value.trim() || isStreaming) return;
    onSend(value);
    setValue("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="border-t border-line bg-void/80 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-2xl border border-line bg-surface px-3 py-2 focus-within:border-synapse/50">
          <textarea
            ref={ref}
            rows={1}
            value={value}
            disabled={disabled}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              disabled ? "Set your endpoint in Settings first…" : "Message the model…"
            }
            className="max-h-[200px] flex-1 resize-none bg-transparent py-1.5 text-[0.95rem] leading-6 text-ink placeholder:text-faint focus:outline-none disabled:opacity-60"
          />
          {isStreaming ? (
            <button
              onClick={onStop}
              aria-label="Stop generating"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-raised text-ink transition-colors hover:bg-line"
            >
              <Square size={14} className="fill-current" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!value.trim() || disabled}
              aria-label="Send message"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-synapse text-void transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowUp size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>
        <p className="mt-1.5 text-center text-[11px] text-faint">
          Enter to send · Shift+Enter for a new line
        </p>
      </div>
    </div>
  );
}
