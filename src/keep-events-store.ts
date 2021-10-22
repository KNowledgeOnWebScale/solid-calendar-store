import {
  BasicRepresentation,
  readableToString,
  Representation,
  ResourceIdentifier,
  RepresentationPreferences,
  Conditions, BaseResourceStore,
} from "@solid/community-server";
import yaml from "js-yaml";
import fs from "fs-extra";
import path from "path";
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

    events.forEach((event: Event) => {
      filters.forEach(
        ({
          match
        }: {
          match: RegExp
        }) => {
          const regex = new RegExp(match, "g");

          if (regex.test(event.title)) {
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
