import type { PublicTenantVertical } from "../publicTenantHosts";

/** Rubros activos hoy más los que la plataforma planea incorporar. */
export type PlatformVertical = PublicTenantVertical | "gym" | "store" | "beauty";

export interface VerticalMeta {
  label: string;
  /** Qué ofrece el sitio público de ese rubro, en una palabra o dos. */
  offering: string;
  /** Clases del badge. Están escritas completas para que Tailwind las detecte. */
  badgeClassName: string;
  /** Clases del marcador fino sobre la tarjeta. */
  markerClassName: string;
  icon: React.JSX.Element;
}

const iconProps = {
  width: 14,
  height: 14,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const VERTICALS: Record<PlatformVertical, VerticalMeta> = {
  barbershop: {
    label: "Barbería",
    offering: "Turnos online",
    badgeClassName: "bg-sky-50 text-sky-800 ring-sky-200",
    markerClassName: "bg-sky-500",
    icon: (
      <svg {...iconProps}>
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12" />
      </svg>
    ),
  },
  rotisserie: {
    label: "Gastronomía",
    offering: "Carta y pedidos",
    badgeClassName: "bg-amber-50 text-amber-800 ring-amber-200",
    markerClassName: "bg-amber-500",
    icon: (
      <svg {...iconProps}>
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
      </svg>
    ),
  },
  gym: {
    label: "Gimnasio",
    offering: "Membresías y clases",
    badgeClassName: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    markerClassName: "bg-emerald-500",
    icon: (
      <svg {...iconProps}>
        <path d="M6 7v10M18 7v10M3 9v6M21 9v6M6 12h12" />
      </svg>
    ),
  },
  store: {
    label: "Tienda online",
    offering: "Catálogo y ventas",
    badgeClassName: "bg-violet-50 text-violet-800 ring-violet-200",
    markerClassName: "bg-violet-500",
    icon: (
      <svg {...iconProps}>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4ZM3 6h18M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  beauty: {
    label: "Estética",
    offering: "Reservas de servicios",
    badgeClassName: "bg-rose-50 text-rose-800 ring-rose-200",
    markerClassName: "bg-rose-500",
    icon: (
      <svg {...iconProps}>
        <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9ZM5 19l.7 1.8L7.5 21l-1.8.7L5 23l-.7-1.3L2.5 21l1.8-.7ZM19 3l.5 1.2L20.7 5l-1.2.5L19 7l-.5-1.5L17.3 5l1.2-.8Z" />
      </svg>
    ),
  },
};

export interface UpcomingVertical {
  vertical: PlatformVertical;
  title: string;
  description: string;
}

/** Rubros anunciados pero sin módulo todavía. Solo se muestran como "Próximamente". */
export const UPCOMING_VERTICALS: UpcomingVertical[] = [
  {
    vertical: "gym",
    title: "Gimnasios",
    description: "Membresías, control de acceso y agenda de clases.",
  },
  {
    vertical: "store",
    title: "Tiendas online",
    description: "Indumentaria, tecnología y otros productos con catálogo y checkout.",
  },
  {
    vertical: "beauty",
    title: "Estética",
    description: "Reservas de servicios con profesionales y duración variable.",
  },
];
