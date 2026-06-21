export type Role = "system" | "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  /** Set while a streamed assistant message is still being generated. */
  pending?: boolean;
  createdAt: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  /** Base URL of the OpenAI-compatible server, e.g. http://localhost:1234/v1 */
  baseUrl: string;
  /** Optional API key. LM Studio / Ollama usually ignore it; some setups need one. */
  apiKey: string;
  /** Model id reported by /v1/models, e.g. "gemma-2-9b-it" or "llama3.2". */
  model: string;
  /** Optional system prompt prepended to every request. */
  systemPrompt: string;
  temperature: number;
}

export const DEFAULT_SETTINGS: Settings = {
  baseUrl: "http://localhost:1234/v1",
  apiKey: "",
  model: "local-model",
  systemPrompt: "",
  temperature: 0.7,
};
