import { DateTime } from "luxon";

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

export function inWeekend(date: Date, weekend?: number[]) {
  const wnd = weekend ?? [0, 6];
  const day = date.getUTCDay();
  return wnd.some((w) => w === day);
}

/**
 * Checks whether the date is on a constant holiday
 *
 * @param date - The date to check
 * @param constant - List of constant holidays
 * @returns Frue if the date falls on any constant holiday
 */
function onConstantHoliday(date: Date, constant: any[]) {
  const day = date.getUTCDate();
  const month = date.getUTCMonth();

  return constant.some(
    (h: { date: { day: number; month: number } }) =>
      h.date.day === day && h.date.month === month
  );
}

/**
 * Checks whether the date is on a fluid holiday
 *
 * @param date - The date to check
 * @param fluid - List of fluid holidays
 * @returns True if the date falls on any fluid holiday
 */
function onFluidHoliday(date: Date, fluid: { [s: string]: string }) {
  return Object.values(fluid).forEach(
    (f: string) => getUtcComponents(date) === getUtcComponents(new Date(f))
  );
}

/**
 * Converts a shifting holiday to a date
 *
 * @param shiftingHoliday - The shifting holiday
 * @returns The holiday converted to a date
 */
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

/**
 * Checks whether the date is on a shifting holiday
 *
 * @param date - The date to check
 * @param shifting - List of shifting holidays
 * @returns True if the date falls on any shifting holiday
 */
function onShiftingHoliday(date: Date, shifting: any[]) {
  return shifting.some(
    (h: { date: { month: number; weekday: number; n: number } }) => {
      if (h.date.month === date.getUTCMonth()) {
        return (
          getUtcComponents(processShiftingHoliday(h.date)) ===
          getUtcComponents(date)
        );
      }
    }
  );
}

/**
 * Checks if a certain date is on a constant, fluid or shifting holiday.
 *
 * @param date - The date to check
 * @param holidays - All the holidays
 * @returns True if the date falls on any holiday
 */
export function onHoliday(
  date: Date,
  holidays: { constant: any; fluid: any; shifting: any }
) {
  const { constant, fluid, shifting } = holidays;
  return (
    onConstantHoliday(date, constant) ||
    onFluidHoliday(date, fluid) ||
    onShiftingHoliday(date, shifting)
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

export function getDaysBetween(fstDate: Date, sndDate: Date): Number {
  return DateTime.fromJSDate(fstDate).diff(DateTime.fromJSDate(sndDate), [
    "days",
  ]).days;
}
