interface SectionHeaderProps {
  id: string;
  title: string;
  description: string;
  count?: number;
}

export function SectionHeader({ id, title, description, count }: SectionHeaderProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 id={id} className="flex items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900">
          {title}
          {typeof count === "number" && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium tabular-nums text-zinc-600">
              {count}
            </span>
          )}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>
    </div>
  );
}
