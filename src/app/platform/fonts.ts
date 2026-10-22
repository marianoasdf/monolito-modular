import { Inter } from "next/font/google";

/**
 * Tipografía del panel de plataforma. Se aplica en el contenedor `.pm-root`,
 * no en `body`, para que los sitios públicos de tenant conserven su fuente.
 */
export const platformFont = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-platform",
});
