/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces — near-black, drawn from the reference image's deep field
        void: "#0a0b0f",
        surface: "#111318",
        panel: "#15181f",
        raised: "#1c2029",
        line: "#262b36",
        // Text
        ink: "#e7ebf2",
        muted: "#8b93a4",
        faint: "#5a6172",
        // The "firing" accent — cool blue-white, like the synaptic streaks
        synapse: "#8ab4ff",
        flare: "#cfe0ff",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace",
        ],
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.2" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.25s ease-out",
        blink: "blink 1s steps(2, start) infinite",
      },
    },
  },
  plugins: [],
};
