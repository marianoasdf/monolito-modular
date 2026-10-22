import { VERTICALS, type PlatformVertical } from "./verticals";

interface VerticalBadgeProps {
  vertical: PlatformVertical;
}

export function VerticalBadge({ vertical }: VerticalBadgeProps): React.JSX.Element {
  const meta = VERTICALS[vertical];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${meta.badgeClassName}`}
    >
      {meta.icon}
      {meta.label}
    </span>
  );
}
