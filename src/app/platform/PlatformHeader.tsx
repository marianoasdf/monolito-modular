import Link from "next/link";
import { PLATFORM_MARK, PLATFORM_NAME } from "./platformBrand";
import { CONTAINER, FOCUS_RING, NAV_LINK } from "./ui";

const NAV_ITEMS = [
  { href: "/#negocios", label: "Negocios", hideOnMobile: false },
  { href: "/#demo", label: "Demo", hideOnMobile: true },
  { href: "/#rubros", label: "Rubros", hideOnMobile: false },
];

export function PlatformHeader(): React.JSX.Element {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white">
      <div className={`${CONTAINER} flex h-14 items-center justify-between gap-4`}>
        <Link className={`inline-flex shrink-0 items-center gap-2.5 rounded-md ${FOCUS_RING}`} href="/">
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-zinc-900 text-xs font-bold text-white"
            aria-hidden="true"
          >
            {PLATFORM_MARK}
          </span>
          <span className="whitespace-nowrap text-sm font-semibold tracking-tight text-zinc-900">
            {PLATFORM_NAME}
          </span>
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1" aria-label="Principal">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              className={`${NAV_LINK} ${item.hideOnMobile ? "hidden sm:inline-flex" : ""}`}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
