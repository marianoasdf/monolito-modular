export const WEEKLY_MENU_DAYS = [
  { key: "monday", label: "Lunes", fieldName: "weeklyMenuMonday" },
  { key: "tuesday", label: "Martes", fieldName: "weeklyMenuTuesday" },
  { key: "wednesday", label: "Miércoles", fieldName: "weeklyMenuWednesday" },
  { key: "thursday", label: "Jueves", fieldName: "weeklyMenuThursday" },
  { key: "friday", label: "Viernes", fieldName: "weeklyMenuFriday" },
  { key: "saturday", label: "Sábado", fieldName: "weeklyMenuSaturday" },
  { key: "sunday", label: "Domingo", fieldName: "weeklyMenuSunday" },
] as const;

export type WeeklyMenuDayKey = (typeof WEEKLY_MENU_DAYS)[number]["key"];
export type WeeklyMenu = Record<WeeklyMenuDayKey, string>;

/**
 * El menú de lunes a domingo es de La Familia. El resto de las rotiserías
 * no lo muestra ni lo guarda. Ampliar esta lista cuando otro tenant lo use.
 */
const WEEKLY_MENU_TENANT_SLUGS = new Set(["lafamilia"]);

export function tenantUsesWeeklyMenu(tenantSlug: string): boolean {
  return WEEKLY_MENU_TENANT_SLUGS.has(tenantSlug.trim().toLowerCase());
}

/** Campos de `RotisserieTenantSettings` que cada pantalla puede leer. */
export function rotisserieSettingsSelect(tenantSlug: string): {
  deliveryFeeInCents: true;
  weeklyMenu?: true;
} {
  return {
    deliveryFeeInCents: true,
    ...(tenantUsesWeeklyMenu(tenantSlug) ? { weeklyMenu: true as const } : {}),
  };
}

export function createEmptyWeeklyMenu(): WeeklyMenu {
  return Object.fromEntries(WEEKLY_MENU_DAYS.map(({ key }) => [key, ""])) as WeeklyMenu;
}

export function resolveWeeklyMenu(value: unknown): WeeklyMenu {
  const menu = createEmptyWeeklyMenu();

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return menu;
  }

  const candidate = value as Record<string, unknown>;
  for (const { key } of WEEKLY_MENU_DAYS) {
    const entry = candidate[key];
    menu[key] = typeof entry === "string" ? entry.trim().slice(0, 500) : "";
  }

  return menu;
}

export function getArgentinaWeekdayKey(now = new Date()): WeeklyMenuDayKey {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    weekday: "long",
  }).format(now).toLowerCase();

  return WEEKLY_MENU_DAYS.some(({ key }) => key === weekday)
    ? (weekday as WeeklyMenuDayKey)
    : "monday";
}
