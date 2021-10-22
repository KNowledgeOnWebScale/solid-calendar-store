import {
  BasicRepresentation,
  readableToString,
  Representation,
  ResourceIdentifier,
  RepresentationPreferences,
  Conditions, BaseResourceStore,
} from "@solid/community-server";
import {AbstractManipulationStore} from "./abstract-manipulation-store";

const outputType = "application/json";

/**
 * Transforms the events of a calendar based upon a YAML settings file.
 */
export class TransformationStore extends AbstractManipulationStore {

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
    const transformations = await this._getManipulations();

    events.forEach((event: { [x: string]: any }) => {
      let noTransformationsMatch = true;

      transformations.forEach(
        ({
          match,
          replace,
          removeFields,
        }: {
          match: RegExp;
          replace: string;
          removeFields: string[];
        }) => {
          const regex = new RegExp(match, "g");

          if (regex.test(event.title)) {
            noTransformationsMatch = false;
            event.title = event.title.replace(regex, replace);

            if (removeFields) removeFields.forEach((key) => delete event[key]);
            else this._keepOnlyInsensitiveFields(event);
          }
        }
      );

      if (noTransformationsMatch) this._keepOnlyInsensitiveFields(event);
    });

    return new BasicRepresentation(
      JSON.stringify({ name: calendar.name, events }),
      sourceRepresentation.metadata,
      outputType
    );
  }

  /**
   * Keeps only the `title`, `startDate` and `endDate` keys of an event
   * @param event - The event whose keys to filter
   */
  _keepOnlyInsensitiveFields(event: { [x: string]: any }) {
    Object.keys(event).forEach((key) => {
      if (!["title", "startDate", "endDate"].includes(key)) delete event[key];
    });
  }
}
