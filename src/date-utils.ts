import { DateTime } from "luxon";
import { constant, fluid, shifting } from "./default-holidays.json";

export function nextDay(date: Date, days = 1) {
  const [year, month, day] = getUtcComponents(date || new Date());
  return utcDate(year, month, day + days);
}

export function getUtcComponents(date = new Date()) {
  return [date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()];
}

export function utcDate(year: number, month: number, days: number) {
  return new Date(Date.UTC(year, month, days));
}

export function inWeekend(date: Date) {
  const day = date.getUTCDay();
  return day === 6 || day === 0;
}

function onConstantHoliday(date: Date) {
  const day = date.getUTCDate();
  const month = date.getUTCMonth();

  return constant.some((h) => h.date.day === day && h.date.month === month);
}

function onFluidHoliday(date: Date) {
  return Object.values(fluid).forEach(
    (f: string) => getUtcComponents(date) === getUtcComponents(new Date(f))
  );
}

export function processShiftingHoliday(shiftingHoliday: {
  month: number;
  weekday: number;
  n: number;
}) {
  let date = new Date(new Date().getFullYear(), shiftingHoliday.month, 1),
    add =
      ((shiftingHoliday.weekday - date.getDay() + 7) % 7) +
      (shiftingHoliday.n - 1) * 7;
  date.setDate(1 + add);
  return date;
}

function onShiftingHoliday(date: Date) {
  return shifting.some((h) => {
    if (h.date.month === date.getUTCMonth()) {
      return (
        getUtcComponents(processShiftingHoliday(h.date)) ===
        getUtcComponents(date)
      );
    }
  });
}

export function onHoliday(date: Date) {
  return (
    onConstantHoliday(date) || onFluidHoliday(date) || onShiftingHoliday(date)
  );
}

export function setZoneTime(
  zone: string,
  date: Date,
  hour: number,
  minute: number
): Date {
  return DateTime.fromJSDate(date)
    .setZone(zone)
    .set({ hour, minute })
    .toJSDate();
}

export function getDatesBetween(fstDate: Date, sndDate: Date): Number {
  return DateTime.fromJSDate(fstDate).diff(DateTime.fromJSDate(sndDate), [
    "days",
  ]).days;
}
