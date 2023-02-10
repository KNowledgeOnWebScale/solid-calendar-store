import {
  BadRequestHttpError, BaseTypedRepresentationConverter,
  BasicRepresentation,
  InternalServerError,
  readableToString,
  Representation,
  RepresentationConverterArgs
} from "@solid/community-server";

const md5 = require('md5');
import { Event } from './event';
import {getRecurringEvents, removeChangedEventsFromRecurringEvents} from "./date-utils";

const ical = require("node-ical");
const outputType = "application/json";

/**
 * Converts an ICS representation to JSON
 */
export class IcsToJsonConverter extends BaseTypedRepresentationConverter {

  public constructor() {
    super("text/calendar", outputType);
  }

  public async handle({
    identifier,
    representation,
  }: RepresentationConverterArgs): Promise<Representation> {
    let data = await readableToString(representation.data);
    let events: Event[] = [];

    if (!data?.length)
      throw new BadRequestHttpError("Empty input is not allowed");

    const parsedICS = await ical.async.parseICS(data);
    const vcalendar = parsedICS.vcalendar;
    const vevents = this.getVEvents(parsedICS);

    for (const vevent of vevents) {
      const {summary} = vevent;

      if (!summary) {
        console.warn(`Encountered event without summary/title in calendar "${vcalendar['WR-CALNAME']}".`);
      }

      let startDate = vevent.start;

      if (!startDate)
        throw new BadRequestHttpError("Dtstart needs to be provided");

      startDate = new Date(startDate);
      let endDate = vevent.end;
      endDate = new Date(endDate);

      const event: Event = {
        title: summary,
        startDate,
        endDate,
        hash: md5(summary + startDate + endDate)
      };

      event.description = vevent.description || undefined;
      event.url = vevent?.url?.val || vevent?.url || undefined;
      event.location = vevent.location || undefined;
      event.originalUID = vevent.uid || undefined;
      event.originalRecurrenceID = vevent.recurrenceid || undefined;

      events.push(event);

      if (vevent.rrule) {
        const recurringEvents = getRecurringEvents(event, vevent.rrule);
        events = events.concat(recurringEvents);
      }
    }

    removeChangedEventsFromRecurringEvents(events);

    if (!vcalendar) {
      throw new InternalServerError("No calendar found");
    }

    const calendar = {
      name: vcalendar["WR-CALNAME"] as string,
      events,
    };

    if (!calendar?.name?.trim().length)
      throw new InternalServerError("No calendar name found");

    return new BasicRepresentation(
      JSON.stringify(calendar),
      representation.metadata,
      outputType
    );
  }

  private getVEvents(data: any) {
    const events = [];

    for (const id in data) {
      const el = data[id];

      if (el.type === 'VEVENT') {
        events.push(el);

        if (el.recurrences) {
          for (const id2 in el.recurrences) {
            const el2 = el.recurrences[id2];

            if (el2.type === 'VEVENT') {
              events.push(el2);
            }
          }
        }
      }
    }

    return events;
  }
}
