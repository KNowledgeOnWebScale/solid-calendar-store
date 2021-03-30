import _ from 'lodash';
import {inWeekend, nextDay, setZoneTime} from "./date-utils";
import {setHours, setMinutes} from 'date-fns'
import {hash} from "./string-utils";

const context = { '@context': 'https://ruben.verborgh.org/contexts/calendar' };

export function subtractEvents(events: any[], subtract: any[]) {
    // Order events and parts to be subtracted so we only need one pass
    events = _.orderBy(events, ['endDate', 'startDate'], ['desc', 'desc']);
    subtract = _.orderBy(subtract, ['startDate', 'endDate'], ['desc', 'asc']);

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
        events.push(...(_.orderBy(tails, ['endDate'], ['desc'])));
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

export function roundTimeStamp(date = new Date(), minutes = 15, roundUp = false) {
    const diff = date.getMinutes() % minutes;
    if (diff !== 0) {
        const shift = (roundUp ? minutes - diff : -diff) * 60 * 1000;
        date = new Date(Number(date) + shift);
    }
    return date;
}

export function getDuration(options: { startDate: any, endDate: any }) {
    return (Number(options.endDate) - Number(options.startDate)) / (60 * 1000);
}

export function createCalendar(title: string, uid: string , events: any[]) {
    return {
        ...context,
        uid,
        title,
        name: title,
        organization: 'Ruben Verborgh',
        events: _.sortBy(events, ['startDate', 'endDate']),
    };
}

export function getAvailableSlots(baseUrl: string, busyEvents: any[], slots?: any[]) {
    // Always consider a fixed range
    const now = new Date();
    const startDate = nextDay(now, 0);
    const endDate = nextDay(startDate, 14);

    if (!slots) {
        slots = getSlots(startDate, endDate, baseUrl);
    }

    // Subtract unavailabilities
    let available = subtractEvents(slots, busyEvents);
    available = available.map(e => roundEventTimes(e, 30, false));
    available = available.filter(e => getDuration(e) >= 30);
    available.forEach(event => {
        event.uid = `${baseUrl}slots#${hash(event.uid)}`;
    });

    return available;
}

/**
 * Generate slots for given dates.
 * @param startDate - Start date of the slots.
 * @param endDate - End date of the slots.
 * @param baseUrl - The url used to generate urls for the slots.
 */
export function getSlots(startDate: Date, endDate: Date, baseUrl: string) {
    const slots = [];
    startDate = setHours(startDate, 23);
    startDate = setMinutes(startDate, 59);
    endDate = setHours(endDate, 23);
    endDate = setMinutes(endDate, 59);
    // endDate = new Date(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());

    for (let date = startDate; date < endDate; date = nextDay(date)) {
        slots.push(...createSlots(date, baseUrl));
    }

    return slots;
}

/**
 * This method generates slots for a given date.
 * @param date - The date for which slots are generated.
 * @param baseUrl - The url used to generate urls for the slots.
 */
export function createSlots(date: Date, baseUrl: string) {
    const slots = [];

    if (!inWeekend(date)) {
        slots.push(
            createSlot(date, {hour: 9, minutes: 0}, {hour: 12, minutes: 0}, baseUrl),
            createSlot(date, {hour: 13, minutes: 0}, {hour: 17, minutes: 0}, baseUrl),
        );
    }

    return slots;
}

export function createSlot(date: Date, startTime: {hour: number, minutes: number}, endTime: {hour: number, minutes: number}, baseUrl: string) {
    const zone = 'Europe/Brussels';
    const startDate = setZoneTime(zone, date, startTime.hour, startTime.minutes);
    const endDate = setZoneTime(zone, date, endTime.hour, endTime.minutes);
    return {
        uid: `${baseUrl}slots#${hash('' + startDate + endDate)}`,
        stampDate: new Date(),
        startDate,
        endDate,
        summary: 'Available for meetings',
    };
}