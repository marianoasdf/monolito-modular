/**
 * Clases compartidas del sistema visual del panel. Se concentran acá para no
 * repetir cadenas de utilidades en cada componente.
 */

export const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const BUTTON_BASE = `inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-4 text-sm font-medium transition-colors ${FOCUS_RING}`;

export const BUTTON_PRIMARY = `${BUTTON_BASE} bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800`;

export const BUTTON_SECONDARY = `${BUTTON_BASE} border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 active:bg-zinc-100`;

export const NAV_LINK = `rounded-md px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 ${FOCUS_RING}`;

export const CONTAINER = "mx-auto w-full max-w-6xl px-4 sm:px-6";

export const CARD = "rounded-xl border border-zinc-200 bg-white";
