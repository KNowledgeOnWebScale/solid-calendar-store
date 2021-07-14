import {
  BasicRepresentation,
  Representation,
  ResourceIdentifier,
  RepresentationPreferences,
  BaseResourceStore,
  InternalServerError,
} from "@solid/community-server";
import fs, { readJson } from "fs-extra";
import { processShiftingHoliday, utcDate } from "./date-utils";
import yaml from "js-yaml";
import path from "path";

const outputType = "application/json";

/**
 * Generates a calendar of holidays based upon a JSON configuration file
 */
export class HolidayStore extends BaseResourceStore {
  private readonly configPath: string;

  constructor(options: { configPath: string }) {
    super();

    this.configPath = options.configPath;
  }

  public async getRepresentation(
    identifier: ResourceIdentifier,
    preferences: RepresentationPreferences
  ): Promise<Representation> {
    const holidays: { title: string; startDate: Date; endDate: Date }[] = [];
    const currentYear = new Date().getFullYear();

    let constant: { name: any; date: { month: number; day: number } }[],
      fluid: { [s: string]: Date } | ArrayLike<Date>,
      shifting: {
        name: any;
        date: { month: number; weekday: number; n: number };
      }[];
    try {
      const yamlStr =  await fs.readFile(
          path.resolve(process.cwd(), this.configPath),
          "utf8"
      )

      let json = {};

      if (yamlStr.trim() !== '') {
        // @ts-ignore
        json = yaml.load(yamlStr);
      }

      // @ts-ignore
      constant = json.constant;
      // @ts-ignore
      fluid = json.fluid;
      // @ts-ignore
      shifting = json.shifting;
    } catch (e) {
      if (e.code === "ENOENT")
        throw new InternalServerError("Holiday config file is not found");
      else throw e;
    }

    constant?.forEach(
      (h: { name: any; date: { month: number; day: number } }) =>
        holidays.push({
          title: h.name,
          ...this._getStartAndEndDate(
            utcDate(currentYear, h.date.month, h.date.day)
          ),
        })
    );

    if (fluid !== undefined) {
      (Object.entries(fluid) as [string, Date][]).forEach(([name, date]) => {
        const dateTyped = new Date(date);
        if (dateTyped.getFullYear() === currentYear)
          holidays.push({
            title: name,
            ...this._getStartAndEndDate(dateTyped),
          });
      });
    }

    shifting?.forEach(
      (h: { name: any; date: { month: number; weekday: number; n: number } }) =>
        holidays.push({
          title: h.name,
          ...this._getStartAndEndDate(processShiftingHoliday(h.date)),
        })
    );

    return new BasicRepresentation(
      JSON.stringify({ name: "Holiday", events: holidays }),
      identifier,
      outputType
    );
  }

  /**
   *
   * @param date - date, time doesn't matter
   * @returns startDate and endDate of the given date
   */
  _getStartAndEndDate(date: Date) {
    const start = new Date(date);
    start.setUTCHours(0, 0);
    const end = new Date(date);
    end.setUTCHours(23, 59);

    return { startDate: start, endDate: end };
  }
}
