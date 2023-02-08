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
import {add, sub} from "date-fns";

const outputType = "application/json";

/**
 * Keep events of a calendar based upon a YAML settings file.
 */
export class ChangeDurationStore extends AbstractManipulationStore {

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
    let events = calendar.events;
    const filters = await this._getManipulations();

    events.forEach((event: Event) => {
      filters.forEach(
        ({match, prefix, before, after, removeDuration}: { match: RegExp, prefix: string, before: number | null, after: number | null, removeDuration: boolean }) => {
          if (match) {
            const regex = new RegExp(match, "g");

            if (!regex.test(event.title)) {
              before = null;
              after = null;
            }
          } else if (prefix) {
            const regex = new RegExp(`${prefix}([0-9]+),([0-9]+)`);
            const matches = event.title.match(regex) || [];

            if (matches.length > 0) {
              before = parseInt(matches[1]);
              after = parseInt(matches[2]);

              if (removeDuration) {
                event.title = event.title.replace(matches[0] || '', '').trim();
              }
            }
          }

          if (before) {
            event.startDate = sub(new Date(event.startDate), {
              minutes: before
            });
          }

          if (after) {
            event.endDate = add(new Date(event.endDate), {
              minutes: after
            });
          }
        }
      );
    });

    const test = new BasicRepresentation(
      JSON.stringify({name: calendar.name, events: calendar.events}),
      sourceRepresentation.metadata,
      outputType
    );

    return test;
  }
}
