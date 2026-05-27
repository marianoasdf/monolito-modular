export type WeeklyScheduleByWeekday = Record<number, string[]>;

export const ARGENTINA_OFFSET = "-03:00";
export const ARGENTINA_TIME_ZONE = "America/Argentina/Buenos_Aires";

export const DEFAULT_MIN_ADVANCE_MINUTES = 60;
export const EXPRESS_MIN_ADVANCE_MINUTES = 30;



export const WEEKDAY_FIELDS = [
  { weekday: 1, fieldName: "mondaySlots", label: "Lunes" },
  { weekday: 2, fieldName: "tuesdaySlots", label: "Martes" },
  { weekday: 3, fieldName: "wednesdaySlots", label: "Miercoles" },
  { weekday: 4, fieldName: "thursdaySlots", label: "Jueves" },
  { weekday: 5, fieldName: "fridaySlots", label: "Viernes" },
  { weekday: 6, fieldName: "saturdaySlots", label: "Sabado" },
  { weekday: 0, fieldName: "sundaySlots", label: "Domingo" },
] as const;

export const DEFAULT_WEEKLY_SCHEDULE: WeeklyScheduleByWeekday = {
  0: [],
  1: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00", "19:00"],
  2: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00", "19:00"],
  3: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00", "19:00"],
  4: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00", "19:00"],
  5: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00", "18:00", "19:00"],
  6: ["10:00", "11:00", "12:00", "13:00", "16:00", "17:00"],
};

export const DEFAULT_EXPRESS_BOOKING_SLOTS = ["13:00", "19:00"];

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function createDefaultWeeklySchedule(): WeeklyScheduleByWeekday {
  return {
    0: [...DEFAULT_WEEKLY_SCHEDULE[0]],
    1: [...DEFAULT_WEEKLY_SCHEDULE[1]],
    2: [...DEFAULT_WEEKLY_SCHEDULE[2]],
    3: [...DEFAULT_WEEKLY_SCHEDULE[3]],
    4: [...DEFAULT_WEEKLY_SCHEDULE[4]],
    5: [...DEFAULT_WEEKLY_SCHEDULE[5]],
    6: [...DEFAULT_WEEKLY_SCHEDULE[6]],
  };
}

export function parseTimeList(input: string): string[] {
  const uniqueValues = new Set(
    input
      .split(/[\n,]/)
      .map((value) => value.trim())
      .filter((value) => TIME_PATTERN.test(value)),
  );

  return [...uniqueValues].sort((left, right) => left.localeCompare(right));
}

export function resolveWeeklySchedule(value: unknown): WeeklyScheduleByWeekday {
  const weeklySchedule = createDefaultWeeklySchedule();

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return weeklySchedule;
  }

  const candidate = value as Record<string, unknown>;

  for (const { weekday } of WEEKDAY_FIELDS) {
    const rawValue = candidate[String(weekday)];

    if (!Array.isArray(rawValue)) {
      continue;
    }

    weeklySchedule[weekday] = rawValue
      .filter((item): item is string => typeof item === "string")
      .filter((item) => TIME_PATTERN.test(item))
      .sort((left, right) => left.localeCompare(right));
  }

  return weeklySchedule;
}

export function resolveExpressSlots(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [...DEFAULT_EXPRESS_BOOKING_SLOTS];
  }

  const slots = value
    .filter((item): item is string => typeof item === "string")
    .filter((item) => TIME_PATTERN.test(item))
    .sort((left, right) => left.localeCompare(right));

  return slots.length > 0 ? slots : [...DEFAULT_EXPRESS_BOOKING_SLOTS];
}

export function getDefaultConfiguredPhone(tenantSlug: string): string {
  if (tenantSlug === "mgbarber") {
    return "+5493454200683";
  }

  return "+540000000000";
}