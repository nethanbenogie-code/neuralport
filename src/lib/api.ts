import type { ChatMessage, Settings } from "../types";

function joinUrl(base: string, path: string): string {
  return base.replace(/\/+$/, "") + path;
}

function headers(settings: Settings): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (settings.apiKey.trim()) {
    h["Authorization"] = `Bearer ${settings.apiKey.trim()}`;
  }
  // Helps when the endpoint is tunnelled through ngrok's free interstitial page.
  h["ngrok-skip-browser-warning"] = "true";
  return h;
}

export interface ModelInfo {
  id: string;
}

/** List models from /v1/models so the user can pick the one that's loaded. */
export async function listModels(settings: Settings): Promise<ModelInfo[]> {
  const res = await fetch(joinUrl(settings.baseUrl, "/models"), {
    headers: headers(settings),
  });
  if (!res.ok) {
    throw new Error(`Could not list models (HTTP ${res.status})`);
  }
  const data = await res.json();
  const list = Array.isArray(data?.data) ? data.data : [];
  return list.map((m: { id: string }) => ({ id: m.id })).filter((m: ModelInfo) => m.id);
}

export interface StreamCallbacks {
  onToken: (token: string) => void;
  signal?: AbortSignal;
}

/**
 * Stream a chat completion from an OpenAI-compatible endpoint.
 * Parses Server-Sent Events line by line and forwards each content delta.
 */
export async function streamChat(
  settings: Settings,
  messages: ChatMessage[],
  { onToken, signal }: StreamCallbacks,
): Promise<void> {
  const payload = {
    model: settings.model,
    temperature: settings.temperature,
    stream: true,
    messages: [
      ...(settings.systemPrompt.trim()
        ? [{ role: "system", content: settings.systemPrompt.trim() }]
        : []),
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  };

  const res = await fetch(joinUrl(settings.baseUrl, "/chat/completions"), {
    method: "POST",
    headers: headers(settings),
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Request failed (HTTP ${res.status})${detail ? `: ${detail.slice(0, 300)}` : ""}`,
    );
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE events are separated by double newlines; process complete lines.
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? ""; // keep the trailing partial line

    for (const raw of lines) {
      const line = raw.trim();
      if (!line || !line.startsWith("data:")) continue;

      const data = line.slice(5).trim();
      if (data === "[DONE]") return;

      try {
        const json = JSON.parse(data);
        const delta: string | undefined = json?.choices?.[0]?.delta?.content;
        if (delta) onToken(delta);
      } catch {
        // Ignore keep-alive comments or malformed partials.
      }
    }
  }
}
