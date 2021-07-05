import {
  BasicRepresentation,
  Representation,
  ResourceIdentifier,
  RepresentationPreferences,
  BaseResourceStore,
  InternalServerError,
} from "@solid/community-server";
import { readJson } from "fs-extra";
import { processShiftingHoliday } from "./date-utils";

const outputType = "application/json";

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
    const { constant, fluid, shifting } = await readJson(this.configPath).catch(
      (e) => {
        if (e.code === "ENOENT")
          throw new InternalServerError("Holiday config file is not found");
        else throw e;
      }
    );

    if (constant !== undefined) {
      constant.forEach(
        (h: { name: any; date: { month: number; day: number } }) =>
          holidays.push({
            title: h.name,
            ...this._getStartAndEndDate(
              new Date(currentYear, h.date.month, h.date.day)
            ),
          })
      );
    }

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

    if (shifting !== undefined) {
      shifting.forEach(
        (h: {
          name: any;
          date: { month: number; weekday: number; n: number };
        }) =>
          holidays.push({
            title: h.name,
            ...this._getStartAndEndDate(processShiftingHoliday(h.date)),
          })
      );
    }

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
    start.setHours(0, 0);
    const end = new Date(date);
    end.setHours(23, 59);

    return { startDate: start, endDate: end };
  }
}
