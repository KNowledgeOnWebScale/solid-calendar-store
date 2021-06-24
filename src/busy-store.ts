import {
  BasicRepresentation,
  Conditions,
  NotFoundHttpError,
  PassthroughStore,
  readableToString,
  Representation,
  RepresentationPreferences,
  ResourceIdentifier,
} from "@solid/community-server";
import { HttpGetStore } from "./http-get-store";

const outputType = "application/json";

export class BusyStore extends PassthroughStore<HttpGetStore> {
  constructor(source: HttpGetStore) {
    super(source);
  }

  async getRepresentation(
    identifier: ResourceIdentifier,
    preferences: RepresentationPreferences,
    conditions?: Conditions
  ): Promise<Representation> {
    const sourceRepresentation: Representation = await super.getRepresentation(
      identifier,
      { type: { "application/json": 1 } },
      conditions
    );
    const data = await readableToString(sourceRepresentation.data);
    const events = JSON.parse(data);

    events.forEach((event: { title: string }) => {
      if (event.title.startsWith("*")) {
        event.title = "Unavailable";
      }
    });

    return new BasicRepresentation(
      JSON.stringify(events),
      sourceRepresentation.metadata,
      outputType
    );
  }
}
