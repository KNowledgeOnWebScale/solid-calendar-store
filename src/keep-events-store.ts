import {
  BasicRepresentation,
  readableToString,
  Representation,
  ResourceIdentifier,
  RepresentationPreferences,
  Conditions, BaseResourceStore,
} from "@solid/community-server";
import {Event} from "./event";
import {AbstractManipulationStore} from "./abstract-manipulation-store";

const outputType = "application/json";

/**
 * Keep events of a calendar based upon a YAML settings file.
 */
export class KeepEventsStore extends AbstractManipulationStore {

  constructor(
    source: BaseResourceStore,
    options: { settingsPaths: string[]; rules?: string[] }
  ) {
    super(source, options);
  }

  public async getRepresentation(
    identifier: ResourceIdentifier,
    preferences: RepresentationPreferences,
    conditions?: Conditions
  ): Promise<Representation> {
    const sourceRepresentation: Representation = await super.getRepresentation(
      identifier,
      {
        type: { "application/json": 1 },
      },
      conditions
    );

    const data = await readableToString(sourceRepresentation.data);
    const calendar = JSON.parse(data);
    let events = calendar.events;
    const filters = await this._getManipulations();

    const keptEvents: Event[] = [];
    const today = new Date();

    events.forEach((event: Event) => {
      filters.forEach(
        ({
          match,
          pastEvents
        }: {
          match: RegExp,
          pastEvents: boolean
        }) => {
          const regex = new RegExp(match, "g");

          if (pastEvents === undefined) {
            pastEvents = true;
          }

          const endDate = new Date(event.endDate);

          if (regex.test(event.title) && (pastEvents || endDate > today)) {
            keptEvents.push(event);
          }
        }
      );
    });

    return new BasicRepresentation(
      JSON.stringify({ name: calendar.name, events: keptEvents }),
      sourceRepresentation.metadata,
      outputType
    );
  }
}
