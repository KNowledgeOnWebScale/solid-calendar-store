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
import _ from "lodash";

const humanToMilliseconds = require('human-to-milliseconds');

const outputType = "application/json";

/**
 * Merge events of a calendar based upon a YAML settings file.
 */
export class MergeEventsStore extends AbstractManipulationStore {

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
        type: {"application/json": 1},
      },
      conditions
    );

    const data = await readableToString(sourceRepresentation.data);
    const calendar = JSON.parse(data);
    let events = _.sortBy(calendar.events, ["startDate", "endDate"])
    const filters = await this._getManipulations();

    const finalEvents: Event[] = [];
    let currentEvent: Event;

    for (let i = 0; i < events.length; i++) {
      const event: Event = events[i];

      filters.forEach(
        ({
           match,
           distance
         }: {
          match: RegExp,
          distance: string
        }) => {
          const regex = new RegExp(match, "g");
          const distanceMs: number = humanToMilliseconds(distance || '0s');

          if (regex.test(event.title)) {
            if (currentEvent) {
              if (new Date(currentEvent.endDate).getTime() + distanceMs >= new Date(event.startDate).getTime()) {
                if (new Date(currentEvent.endDate) < new Date(event.endDate)) {
                  currentEvent.endDate = event.endDate;
                }
              } else {
                finalEvents.push(currentEvent);
                currentEvent = event;
              }
            } else {
              currentEvent = event;
            }
          }
        }
      );
    }

    // @ts-ignore
    if (currentEvent) {
      finalEvents.push(currentEvent);
    }

    return new BasicRepresentation(
      JSON.stringify({name: calendar.name, events: finalEvents}),
      sourceRepresentation.metadata,
      outputType
    );
  }
}
