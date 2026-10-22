import type { UpcomingVertical } from "./verticals";
import { VERTICALS } from "./verticals";
import { VerticalBadge } from "./VerticalBadge";

interface ComingSoonCardProps {
  item: UpcomingVertical;
}

export function ComingSoonCard({ item }: ComingSoonCardProps): React.JSX.Element {
  const meta = VERTICALS[item.vertical];

  return (
    <article className="flex flex-col rounded-xl border border-dashed border-zinc-300 p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <VerticalBadge vertical={item.vertical} />
        <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-zinc-500">
          Próximamente
        </span>
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight text-zinc-700">{item.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-zinc-500">{item.description}</p>
      <p className="mt-4 text-xs text-zinc-400">{meta.offering}</p>
    </article>
  );
}
