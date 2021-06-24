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

export function inWeekend(date: Date) {
  const day = date.getUTCDay();
  return day === 6 || day === 0;
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
