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
    const events = calendar.events;

    const transformations = ([] as { match: RegExp; replace: string }[]).concat(
      ...(await Promise.all(
        this.settingsPaths.map(
          async (p) => await this._getApplyingTransformations(p)
        )
      ))
    );

    events.forEach((event: { title: string }) =>
      transformations.forEach(
        ({ match, replace }: { match: RegExp; replace: string }) =>
          (event.title = event.title.replace(new RegExp(match, "g"), replace))
      )
    );

    return new BasicRepresentation(
      JSON.stringify(events),
      sourceRepresentation.metadata,
      outputType
    );
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

    if (!this.rules.length)
      transformation = this._allRulesObjectToArray(transformation);
    else transformation = this._selectedRulesObjectToArray(transformation);

    return transformation;
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
