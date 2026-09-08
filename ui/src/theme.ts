import {
  createSystem,
  defaultConfig,
  defineConfig,
} from "@chakra-ui/react";

const customConfig = defineConfig({
  theme: {
    keyframes: {
      fadeIn: {
        from: {
          opacity: "0",
          transform: "translateY(-4px)",
        },
        to: {
          opacity: "1",
          transform: "translateY(0)",
        },
      },
    },
  },
  globalCss: {
    ":root": {
      colorScheme: "dark",
      "--app-bg": "#0d1117",
      "--app-text": "#f0f6fc",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    "*, *::before, *::after": {
      boxSizing: "border-box",
    },
    "html, body, #root": {
      width: "100vw",
      height: "100vh",
      margin: "0",
      padding: "0",
      overflow: "hidden",
      backgroundColor: "var(--app-bg, #0d1117)",
      color: "var(--app-text, #f0f6fc)",
    },
    "::-webkit-scrollbar": {
      width: "6px",
      height: "6px",
    },
    "::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "::-webkit-scrollbar-thumb": {
      background: "rgba(255, 255, 255, 0.15)",
      borderRadius: "3px",
    },
    "::-webkit-scrollbar-thumb:hover": {
      background: "rgba(255, 255, 255, 0.25)",
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);
