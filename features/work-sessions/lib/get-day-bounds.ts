import { endOfDay, startOfDay } from "date-fns";

export function getDayBounds(referenceDate: Date = new Date()) {
  const dayStart = startOfDay(referenceDate);
  const dayEnd = endOfDay(referenceDate);

  return {
    dayStart,
    dayEnd,
    dayStartIso: dayStart.toISOString(),
    dayEndIso: dayEnd.toISOString(),
  };
}
