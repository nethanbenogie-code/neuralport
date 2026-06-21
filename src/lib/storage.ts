import type { Conversation, Settings } from "../types";
import { DEFAULT_SETTINGS } from "../types";

const CONVOS_KEY = "neuro-chat:conversations:v1";
const SETTINGS_KEY = "neuro-chat:settings:v1";

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(CONVOS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveConversations(convos: Conversation[]): void {
  try {
    localStorage.setItem(CONVOS_KEY, JSON.stringify(convos));
  } catch {
    // Storage full or unavailable — fail quietly rather than crash the UI.
  }
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* noop */
  }
}

export function uid(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}
