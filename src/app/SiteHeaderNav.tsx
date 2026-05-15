"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteHeaderNav({ isPublicMgBarberHost }: { isPublicMgBarberHost: boolean }): React.JSX.Element | null {
  const pathname = usePathname();
  const shouldHideNavigation =
    isPublicMgBarberHost || pathname === "/mgbarber/barbershop" || pathname.startsWith("/admin");

  if (shouldHideNavigation) {
    return null;
  }

  return (
    <nav className="site-nav" aria-label="Principal">
      <Link href="/">Inicio</Link>
      <Link href="/crown/barbershop">Demo Crown</Link>
      <Link href="/heritage/barbershop">Demo Heritage</Link>
    </nav>
  );
}