import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Shell } from "./Shell";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const isMgBarber = host === "mgbarber.xyz" || host === "www.mgbarber.xyz";

  return {
    title: isMgBarber ? "mgbarber | reservas" : "Multi-SaaS Modular Monolith",
    description: "Base Next.js tenant-aware para una barbería multi-SaaS modular.",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): Promise<React.JSX.Element> {
  return (
    <html lang="es">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}