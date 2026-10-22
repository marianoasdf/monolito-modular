import { PLATFORM_NAME } from "./platformBrand";
import { CONTAINER } from "./ui";

export function PlatformFooter(): React.JSX.Element {
  return (
    <footer className="border-t border-zinc-200">
      <div
        className={`${CONTAINER} flex flex-col gap-1 py-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between`}
      >
        <span>
          {PLATFORM_NAME} · {new Date().getFullYear()}
        </span>
        <span>Barberías, gastronomía y más rubros sobre una misma base.</span>
      </div>
    </footer>
  );
}
