import {
  BadRequestHttpError,
  BasicRepresentation,
  InternalServerError,
  readableToString,
  Representation,
  RepresentationConverterArgs,
  TypedRepresentationConverter,
} from "@solid/community-server";

const md5 = require('md5');
import { Event } from './event';
import {getRecurringEvents} from "./date-utils";

const ICAL = require("ical.js");
const outputType = "application/json";

/**
 * Converts an ICS representation to JSON
 */
export class IcsToJsonConverter extends TypedRepresentationConverter {
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

      if (!summary)
        throw new BadRequestHttpError("Summary needs to be provided");

      let startDate = vevent.getFirstPropertyValue("dtstart");

      if (!startDate)
        throw new BadRequestHttpError("Dtstart needs to be provided");

      startDate = new Date(startDate).toISOString();
      let endDate = vevent.getFirstPropertyValue("dtend");
      endDate = new Date(endDate).toISOString();

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

      events.push(event);

      if (vevent.getFirstPropertyValue("rrule")) {
        const recurringEvents = getRecurringEvents(event, vevent.getFirstPropertyValue("rrule"));
        events = events.concat(recurringEvents);
      }
    }

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
