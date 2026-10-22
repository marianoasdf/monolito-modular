import { CARD } from "./ui";

interface StatTileProps {
  label: string;
  value: string | number;
  hint?: string;
}

export function StatTile({ label, value, hint }: StatTileProps): React.JSX.Element {
  return (
    <div className={`${CARD} p-4`}>
      <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</dt>
      <dd className="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-zinc-900">{value}</dd>
      {hint && <dd className="mt-0.5 text-xs text-zinc-500">{hint}</dd>}
    </div>
  );
}
