import {
  BadRequestHttpError,
  BasicRepresentation,
  NotFoundHttpError,
  readableToString,
  Representation,
  RepresentationConverterArgs,
  TypedRepresentationConverter,
} from "@solid/community-server";

const ICAL = require("ical.js");
const outputType = "application/json";

export class IcsToJsonConverter extends TypedRepresentationConverter {
  public constructor() {
    super("text/calendar", outputType);
  }

  public async handle({
    identifier,
    representation,
  }: RepresentationConverterArgs): Promise<Representation> {
    const data = await readableToString(representation.data);
    const events: Object[] = [];

    if (!data.trim().length)
      throw new BadRequestHttpError("Empty input is not allowed");

    const jcalData = ICAL.parse(data);
    const vcalendar = new ICAL.Component(jcalData);
    const vevents = vcalendar.getAllSubcomponents("vevent");

    for (const vevent of vevents) {
      const summary = vevent.getFirstPropertyValue("summary");
      let startDate = vevent.getFirstPropertyValue("dtstart");
      startDate = new Date(startDate).toISOString();
      let endDate = vevent.getFirstPropertyValue("dtend");
      endDate = new Date(endDate).toISOString();

      events.push({ title: summary, startDate, endDate });
    }

    return new BasicRepresentation(
      JSON.stringify(events),
      representation.metadata,
      outputType
    );
  }
}
