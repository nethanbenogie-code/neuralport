import { memo, useRef, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Check, Copy } from "lucide-react";

function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const lang = /language-(\w+)/.exec(className || "")?.[1];

  const copy = () => {
    const text = codeRef.current?.textContent ?? "";
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      })
      .catch(() => {});
  };

  return (
    <div className="group relative my-3 overflow-hidden rounded-lg border border-line">
      <div className="flex items-center justify-between border-b border-line bg-raised/60 px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-faint">
          {lang || "code"}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted transition-colors hover:text-ink"
        >
          {copied ? (
            <>
              <Check size={12} /> Copied
            </>
          ) : (
            <>
              <Copy size={12} /> Copy
            </>
          )}
        </button>
      </div>
      <pre>
        <code ref={codeRef} className={className}>
          {children}
        </code>
      </pre>
    </div>
  );
}

export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
}: {
  content: string;
}) {
  return (
    <div className="prose-chat">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={{
          // Block code → wrapped with header + copy; inline code stays inline.
          code(props) {
            const { className, children, node } = props as {
              className?: string;
              children?: ReactNode;
              node?: { position?: { start: { line: number }; end: { line: number } } };
            };
            const isBlock =
              !!className ||
              (node?.position &&
                node.position.start.line !== node.position.end.line);
            if (isBlock) {
              return <CodeBlock className={className}>{children}</CodeBlock>;
            }
            return <code className={className}>{children}</code>;
          },
          a(props) {
            return (
              <a {...props} target="_blank" rel="noopener noreferrer" />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
