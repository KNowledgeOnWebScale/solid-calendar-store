import {
  BadRequestHttpError,
  BasicRepresentation,
  readableToString,
  Representation,
  RepresentationConverterArgs,
  TypedRepresentationConverter,
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
export class JsonToIcsConverter extends TypedRepresentationConverter {
  public constructor() {
    super("application/json", outputType);
  }

  public async handle({
    identifier,
    representation,
  }: RepresentationConverterArgs): Promise<Representation> {
    const data = await readableToString(representation.data);
    const dataTyped = JSON.parse(data);

    if (!dataTyped.name)
      throw new BadRequestHttpError("JsonToIcsConverter: Calendar name needs to be provided");

    const calendar = ical({ name: dataTyped.name });

    for (const event of dataTyped.events) {
      const new_event: Event = {
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

      if (event.description) new_event.description = event.description;
      if (event.url) new_event.url = event.url;
      if (event.location) new_event.location = event.location;

      calendar.createEvent(new_event);
    }

    return new BasicRepresentation(
      calendar.toString(),
      representation.metadata,
      outputType
    );
  }
}
