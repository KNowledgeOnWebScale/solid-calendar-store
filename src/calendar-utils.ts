import _ from "lodash";
import { inWeekend, nextDay, onHoliday, setZoneTime } from "./date-utils";
import { setHours, setMinutes } from "date-fns";
import { hash } from "./string-utils";

const context = { "@context": "https://ruben.verborgh.org/contexts/calendar" };

export function subtractEvents(events: any[], subtract: any[]) {
  // Order events and parts to be subtracted so we only need one pass
  events = _.orderBy(events, ["endDate", "startDate"], ["desc", "desc"]);
  subtract = _.orderBy(subtract, ["startDate", "endDate"], ["desc", "asc"]);

  // Subtract all parts one by one
  const difference = [];
  while (events.length > 0 && subtract.length > 0) {
    // Events that end before the subtracted part are unaffected
    const { startDate, endDate } = subtract.pop();
    while (events.length > 0 && _.last(events).endDate <= startDate)
      difference.push(events.pop());

    // Trim events that overlap
    const tails = [];
    while (events.length > 0 && _.last(events).startDate < endDate) {
      const event = events.pop();
      // Event tail overlaps with subtracted part; trim it
      if (event.startDate < startDate)
        difference.push({ ...event, endDate: startDate });
      // Event head overlaps with subtracted part; trim it
      if (event.endDate > endDate)
        tails.push({ ...event, startDate: endDate, uid: `${event.uid}-tail` });
    }
    // Re-add trimmed tails for possible subtraction by other parts
    events.push(..._.orderBy(tails, ["endDate"], ["desc"]));
  }

  // Add all remaining non-overlapping events
  difference.push(...events);
  return difference;
}

export function roundEventTimes(event: any, minutes = 15, expand = true) {
  const startDate = roundTimeStamp(event.startDate, minutes, !expand);
  const endDate = roundTimeStamp(event.endDate, minutes, expand);
  if (startDate !== event.startDate || endDate !== event.endDate)
    event = { ...event, startDate, endDate };
  return event;
}

export function roundTimeStamp(
  date = new Date(),
  minutes = 15,
  roundUp = false
) {
  const diff = date.getMinutes() % minutes;
  if (diff !== 0) {
    const shift = (roundUp ? minutes - diff : -diff) * 60 * 1000;
    date = new Date(Number(date) + shift);
  }
  return date;
}

export function getDuration(options: { startDate: any; endDate: any }) {
  return (Number(options.endDate) - Number(options.startDate)) / (60 * 1000);
}

export function createCalendar(title: string, uid: string, events: any[]) {
  return {
    ...context,
    uid,
    title,
    name: title,
    organization: "Ruben Verborgh",
    events: _.sortBy(events, ["startDate", "endDate"]),
  };
}

/**
 *
 * @param baseUrl
 * @param busyEvents
 * @param slots
 * @param startDate
 * @param endDate
 * @param availabilitySlots - Array of default availability slots.
 * @param minimumSlotDuration - Minimum duration of a slot.
 */
export function getAvailableSlots(
  baseUrl: string,
  busyEvents: any[],
  availabilitySlots: any[],
  minimumSlotDuration: number,
  now: Date,
  slots?: any[],
  startDate?: Date,
  endDate?: Date
) {
  // Always consider a fixed range
  startDate = startDate ? startDate : nextDay(now, 0);
  endDate = endDate ? endDate : nextDay(startDate, 14);

  if (!slots) {
    slots = getSlots(startDate, endDate, baseUrl, availabilitySlots, now);
  }

  // Subtract unavailabilities
  let available = subtractEvents(slots, busyEvents);
  available = available.map((e) => roundEventTimes(e, 30, false));
  available = available.filter((e) => getDuration(e) >= minimumSlotDuration);
  available.forEach((event) => {
    event.uid = `${baseUrl}slots#${hash(event.uid)}`;
  });

  return available;
}

/**
 * Generate slots for given dates.
 * @param startDate - Start date of the slots.
 * @param endDate - End date of the slots.
 * @param baseUrl - The url used to generate urls for the slots.
 * @param availabilitySlots - Array of default availability slots.
 * @param stampDate - The date at which the slots are generated.
 */
export function getSlots(
  startDate: Date,
  endDate: Date,
  baseUrl: string,
  availabilitySlots: any[],
  stampDate: Date
) {
  const slots = [];
  startDate = setHours(startDate, 23);
  startDate = setMinutes(startDate, 59);
  endDate = setHours(endDate, 23);
  endDate = setMinutes(endDate, 59);
  // endDate = new Date(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());

  for (let date = startDate; date < endDate; date = nextDay(date)) {
    slots.push(...createSlots(date, baseUrl, availabilitySlots, stampDate));
  }

  return slots;
}

/**
 * This method generates slots for a given date.
 * @param date - The date for which slots are generated.
 * @param baseUrl - The url used to generate urls for the slots.
 * @param availabilitySlots - Array of default availability slots.
 * @param stampDate - The date at which the slots are generated.
 */
export function createSlots(
  date: Date,
  baseUrl: string,
  availabilitySlots: any[],
  stampDate: Date
) {
  const slots: any[] = [];

  if (!inWeekend(date)) {
    availabilitySlots.forEach((slot) => {
      const { startTime, endTime } = slot;
      slots.push(createSlot(date, startTime, endTime, baseUrl, stampDate));
    });
  }

  return slots;
}

export function createSlot(
  date: Date,
  startTime: { hour: number; minutes: number },
  endTime: { hour: number; minutes: number },
  baseUrl: string,
  stampDate: Date
) {
  const zone = "Europe/Brussels";
  const startDate = setZoneTime(zone, date, startTime.hour, startTime.minutes);
  const endDate = setZoneTime(zone, date, endTime.hour, endTime.minutes);
  return {
    uid: `${baseUrl}slots#${hash("" + startDate + endDate)}`,
    stampDate,
    startDate,
    endDate,
    summary: "Available for meetings",
  };
}
