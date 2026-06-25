import { format, parseISO, type Locale } from "date-fns";
import { bg as dateFnsBgLocale } from "date-fns/locale";

export const bgLocale: Locale = dateFnsBgLocale;

export function formatLongDate(value: string) {
  return format(parseISO(value), "d MMMM yyyy", { locale: bgLocale });
}

export function formatShortDate(value: string) {
  return format(parseISO(value), "d MMM yyyy", { locale: bgLocale });
}

export function plural(
  count: number,
  one: string,
  other: string
): string {
  return count === 1 ? one : other;
}

export function formatHours(hours: number) {
  return `${hours}ч`;
}

export function formatArea(squareMeters: number) {
  return `${squareMeters.toLocaleString("bg-BG")} m²`;
}

export function formatWeeks(count: number) {
  return `${count} ${plural(count, "студио седмица", "студио седмици")}`;
}

export function formatWorkingDays(count: number) {
  return `${count} ${plural(count, "работен ден", "работни дни")}`;
}
