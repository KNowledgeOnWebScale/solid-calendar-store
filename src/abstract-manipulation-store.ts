import {BaseResourceStore, PassthroughStore} from "@solid/community-server";
import yaml from "js-yaml";
import fs from "fs-extra";
import path from "path";

export abstract class AbstractManipulationStore extends PassthroughStore<BaseResourceStore> {
  private rules: string[];
  protected readonly settingsPaths: string[];

  constructor(
    source: BaseResourceStore,
    options: { settingsPaths: string[]; rules?: string[] }
  ) {
    super(source);

    this.rules = options.rules ?? [];
    this.settingsPaths = options.settingsPaths;
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

    if (transformation)
      transformation = !this.rules.length
        ? this._allRulesObjectToArray(transformation)
        : this._selectedRulesObjectToArray(transformation);

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

  async _getManipulations() {
    return (
      [] as { match: RegExp; replace: string; removeFields: string[], prefix: string, before: number, after: number, removeDuration: boolean, pastEvents: boolean, distance: string }[]
    ).concat(
      ...(await Promise.all(
        this.settingsPaths.map(
          async (p) => await this._getApplyingTransformations(p)
        )
      ))
    );
  }
}