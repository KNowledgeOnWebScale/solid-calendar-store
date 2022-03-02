import {
  BadRequestHttpError, BaseTypedRepresentationConverter,
  BasicRepresentation,
  readableToString,
  Representation,
  RepresentationConverterArgs
} from "@solid/community-server";
import ical from "ical-generator";

const outputType = "text/calendar";
interface Event {
  summary: string;
  start: Date;
  end: Date;
  description?: string;
  url?: string;
  location?: string;
}

/**
 * Converts a JSON representation to ICS
 */
export class JsonToIcsConverter extends BaseTypedRepresentationConverter {
  public constructor() {
    super("application/json", outputType);
  }

  public async handle({
    identifier,
    representation,
  }: RepresentationConverterArgs): Promise<Representation> {
    const data = await readableToString(representation.data);
    const parsedDate = JSON.parse(data);

    if (!parsedDate.name)
      throw new BadRequestHttpError("JsonToIcsConverter: Calendar name needs to be provided");

    const calendar = ical({ name: parsedDate.name });

    for (const event of parsedDate.events) {
      const newEvent: Event = {
        summary: event.title,
        start: event.startDate,
        end: event.endDate,
      };

      if (!event.title)
        throw new BadRequestHttpError(
          "Each event needs a title to be provided"
        );
      if (!event.startDate)
        throw new BadRequestHttpError(
          "Each event needs a startDate to be provided"
        );
      if (!event.endDate)
        throw new BadRequestHttpError(
          "Each event needs an endDate to be provided"
        );

      if (event.description) newEvent.description = event.description;
      if (event.url) newEvent.url = event.url;
      if (event.location) newEvent.location = event.location;

      calendar.createEvent(newEvent);
    }

    return new BasicRepresentation(
      calendar.toString(),
      representation.metadata,
      outputType
    );
  }
}
