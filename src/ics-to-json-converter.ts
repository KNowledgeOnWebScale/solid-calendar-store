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

const ICAL = require("ical.js");
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
    const data = await readableToString(representation.data);
    let events: Event[] = [];

    if (!data?.length)
      throw new BadRequestHttpError("Empty input is not allowed");

    const jcalData = ICAL.parse(data);
    const vcalendar = new ICAL.Component(jcalData);
    const vevents = vcalendar.getAllSubcomponents("vevent");

    for (const vevent of vevents) {
      const summary = vevent.getFirstPropertyValue("summary");

      if (!summary) {
        console.warn(`Encountered event without summary/title in calendar "${vcalendar.getFirstPropertyValue("x-wr-calname")}".`);
      }

      let startDate = vevent.getFirstPropertyValue("dtstart");

      if (!startDate)
        throw new BadRequestHttpError("Dtstart needs to be provided");

      startDate = new Date(startDate);
      let endDate = vevent.getFirstPropertyValue("dtend");
      endDate = new Date(endDate);

      const event: Event = {
        title: summary,
        startDate,
        endDate,
        hash: md5(summary + startDate + endDate)
      };

      if (vevent.hasProperty("description"))
        event.description = vevent.getFirstPropertyValue("description");
      if (vevent.hasProperty("url"))
        event.url = vevent.getFirstPropertyValue("url");
      if (vevent.hasProperty("location"))
        event.location = vevent.getFirstPropertyValue("location");
      if (vevent.hasProperty("uid"))
        event.originalUID = vevent.getFirstPropertyValue("uid");
      if (vevent.hasProperty("recurrence-id"))
        event.originalRecurrenceID = vevent.getFirstPropertyValue("recurrence-id");

      events.push(event);

      if (vevent.getFirstPropertyValue("rrule")) {
        const recurringEvents = getRecurringEvents(event, vevent.getFirstPropertyValue("rrule"));
        events = events.concat(recurringEvents);
      }
    }

    removeChangedEventsFromRecurringEvents(events);

    const calendar = {
      name: vcalendar.getFirstPropertyValue("x-wr-calname") as string,
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
}
