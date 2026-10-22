import type { Config } from "tailwindcss";

/**
 * Tailwind se adopta de forma gradual. Hoy solo lo usa el panel de plataforma
 * (`src/app/platform` y `Shell`). Preflight queda desactivado para no alterar
 * los sitios públicos de tenant ni los paneles admin, que siguen con el CSS
 * clásico de `globals.css`. El reset acotado al panel vive en `.pm-root`.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      fontFamily: {
        platform: ["var(--font-platform)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
