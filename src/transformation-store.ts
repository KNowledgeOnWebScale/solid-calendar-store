import {
  BasicRepresentation,
  readableToString,
  Representation,
  ResourceIdentifier,
  PassthroughStore,
  RepresentationPreferences,
  Conditions,
} from "@solid/community-server";
import yaml from "js-yaml";
import fs from "fs-extra";
import path from "path";
import { HttpGetStore } from "./http-get-store";

const outputType = "application/json";

export class TransformationStore extends PassthroughStore<HttpGetStore> {
  private rules: string[];
  private readonly settingsPaths: string[];

  constructor(
    source: HttpGetStore,
    options: { settingsPaths: string[]; rules?: string[] }
  ) {
    super(source);

    this.rules = options.rules ? options.rules : [];
    this.settingsPaths = options.settingsPaths;
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

    const transformations = (
      [] as { match: RegExp; replace: string; removeFields: string[] }[]
    ).concat(
      ...(await Promise.all(
        this.settingsPaths.map(
          async (p) => await this._getApplyingTransformations(p)
        )
      ))
    );

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
      JSON.stringify(events),
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

  /**
   *
   * @param settingPath - Path to a file containing all the possible rules
   * @returns A list of all the transformation rules that apply
   */
  async _getApplyingTransformations(settingPath: string) {
    // @ts-ignore
    let { transformation } = yaml.load(
      await fs.readFile(path.resolve(process.cwd(), settingPath), "utf8")
    );

    if (transformation) {
      if (!this.rules.length)
        transformation = this._allRulesObjectToArray(transformation);
      else transformation = this._selectedRulesObjectToArray(transformation);
    }

    return transformation || [];
  }

  /**
   *
   * @param rules Object containing all the rules
   * @returns The rules mapped to an array
   */
  _allRulesObjectToArray = (rules: object) =>
    ([] as string[]).concat(
      ...(Object.values(rules) as object[]).map<string[]>((v) =>
        Object.values(v)
      )
    );

  /**
   *
   * @param rules Object containing all the rules
   * @returns The applying rules mapped to an array
   */
  _selectedRulesObjectToArray = (rules: object) =>
    Object.entries(rules).reduce((acc: string[], [k, v]) => {
      // @ts-ignore
      if (this.rules.includes(k)) acc.push(...Object.values(v));

      return acc;
    }, []);
}
