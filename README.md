# Neuro Chat

A local-first, ChatGPT-style chat client for any **OpenAI-compatible** endpoint —
LM Studio, Ollama, llama.cpp, vLLM, or your own ngrok-tunnelled server.

Built with **React + TypeScript + Tailwind**. Single-page app, no backend of its
own. Conversations live in your browser's `localStorage`; requests go straight
from the page to your model server.

## Features

- Token-by-token **streaming** (SSE parsing of `/v1/chat/completions`)
- **Chat history** sidebar with rename/delete, persisted locally
- **Markdown** rendering with **syntax-highlighted** code blocks + copy button
- **Auto-scroll** that politely stops when you scroll up to read
- **Dark mode**, mobile-responsive, collapsible sidebar
- Settings panel: base URL, optional API key, model picker (auto-lists from
  `/v1/models`), system prompt, temperature
- A firing-neuron canvas accent in the corner 🧠

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173, click **Settings**, set your endpoint, hit **Test**.

## Pointing it at your model

| Server     | Base URL                       |
| ---------- | ------------------------------ |
| LM Studio  | `http://localhost:1234/v1`     |
| Ollama     | `http://localhost:11434/v1`    |
| llama.cpp  | `http://localhost:8080/v1`     |
| vLLM       | `http://localhost:8000/v1`     |

Use **Test** in Settings to list loaded models and pick one.

## CORS — the one thing that trips people up

Because the page calls your model server directly from the browser, the server
must allow cross-origin requests:

- **LM Studio** → Developer tab → enable **CORS** on the local server.
- **Ollama** → start it with `OLLAMA_ORIGINS=*` (or your dev origin):
  ```bash
  # macOS/Linux
  OLLAMA_ORIGINS=* ollama serve
  # Windows (PowerShell)
  $env:OLLAMA_ORIGINS="*"; ollama serve
  ```
- **llama.cpp / vLLM** usually allow all origins by default.

If "Test" fails with a network error but the server is up, it's almost always
CORS.

### ngrok

If you expose your endpoint through ngrok, requests already send the
`ngrok-skip-browser-warning` header so you skip the interstitial page. Put the
full ngrok URL (ending in `/v1`) in the base URL field.

## Testing on your phone

`npm run dev` is exposed on your LAN (`host: true`). Open
`http://<your-pc-ip>:5173` on the phone — same Wi-Fi. Your model server must
also be reachable from the phone (bind it to `0.0.0.0`, not just localhost) and
allow that origin via CORS.

## Build

```bash
npm run build      # → dist/
npm run preview    # serve the production build
```

## Project layout

```
src/
  lib/api.ts             OpenAI-compatible streaming + model listing
  lib/storage.ts         localStorage persistence
  hooks/useChat.ts       conversations, settings, send/stop, streaming state
  components/
    Sidebar.tsx          chat history
    Message.tsx          one message bubble
    MarkdownRenderer.tsx markdown + highlighted code + copy
    ChatInput.tsx        auto-growing composer
    SettingsModal.tsx    endpoint config + model picker
    NeuronCorner.tsx     the firing-neuron canvas
  App.tsx                shell, auto-scroll, empty state
```

## Notes

- No telemetry, no cloud. Clearing browser storage wipes your history.
- Everything is plain `fetch` + the standard `/v1/chat/completions` shape, so it
  works with anything that speaks the OpenAI API.
