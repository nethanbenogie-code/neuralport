import { Sparkles, User } from "lucide-react";
import type { ChatMessage } from "../types";
import { MarkdownRenderer } from "./MarkdownRenderer";

export function Message({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className="animate-fadeIn px-4 py-5 md:px-6">
      <div className="mx-auto flex max-w-3xl gap-3 md:gap-4">
        <div
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-ink ${
            isUser
              ? "border-line bg-raised"
              : "border-synapse/30 bg-synapse/10 text-flare"
          }`}
        >
          {isUser ? <User size={15} /> : <Sparkles size={15} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 text-xs font-medium text-faint">
            {isUser ? "You" : "Assistant"}
          </div>
          {isUser ? (
            <div className="whitespace-pre-wrap break-words text-[0.95rem] leading-7 text-ink">
              {message.content}
            </div>
          ) : (
            <>
              <MarkdownRenderer content={message.content} />
              {message.pending && (
                <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-blink bg-synapse align-middle" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
