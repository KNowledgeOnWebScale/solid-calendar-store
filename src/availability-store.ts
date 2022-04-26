import {
  BaseResourceStore,
  BasicRepresentation,
  Conditions,
  PassthroughStore,
  readableToString,
  Representation,
  RepresentationConvertingStore,
  RepresentationPreferences,
  ResourceIdentifier,
} from "@solid/community-server";

import {getAvailableSlots} from "./calendar-utils";
import {HttpGetStore} from "./http-get-store";
import yaml from "js-yaml";
import fs from "fs-extra";
import path from "path";
import {getUtcComponents} from "./date-utils";
import md5 from "md5";

const outputType: string = "application/json";

/**
 * Generates availability slots based upon a YAML settings file
 */
export class AvailabilityStore extends PassthroughStore<BaseResourceStore> {
  private readonly baseUrl: string;
  private availabilitySlots: [];
  private readonly settingsPath: string;
  private readonly holidaySource?: RepresentationConvertingStore;
  private minimumSlotDuration: number;
  private readonly startDate: Date | undefined;
  private timezone: string;
  private weekend: number[];
  private readonly name: string | undefined;

  constructor(
    source: HttpGetStore,
    options: {
      baseUrl: string;
      settingsPath: string;
      holidaySource?: RepresentationConvertingStore;
      startDate?: string;
      name?: string;
    }
  ) {
    super(source);
    this.baseUrl = options.baseUrl;
    this.settingsPath = options.settingsPath;
    this.availabilitySlots = [];
    this.minimumSlotDuration = 30;
    this.timezone = "Europe/Brussels";
    this.weekend = [0, 6];
    this.startDate = options.startDate
      ? new Date(options.startDate)
      : undefined;
    this.holidaySource = options.holidaySource;
    this.name = options.name;
    this._getSettings();

  }

  async getRepresentation(
    identifier: ResourceIdentifier,
    preferences: RepresentationPreferences,
    conditions?: Conditions
  ): Promise<Representation> {
    const sourceRepresentation: Representation = await super.getRepresentation(
      identifier,
      {type: {"application/json": 1}}
    );

    const data = await readableToString(sourceRepresentation.data);
    const calendar = JSON.parse(data);
    const events = calendar.events;

    events.forEach((event: { startDate: any; endDate: any }) => {
      event.startDate = new Date(event.startDate);
      event.endDate = new Date(event.endDate);
    });

    let slots = getAvailableSlots(
      this.baseUrl,
      events,
      this.availabilitySlots,
      this.minimumSlotDuration,
      this._getStartDateForSlots(),
      {weekend: this.weekend, timezone: this.timezone}
    );

    if (this.holidaySource) {
      const sourceRepresentation: Representation =
        await this.holidaySource.getRepresentation(identifier, {
          type: {"application/json": 1},
        });

      const data = await readableToString(sourceRepresentation.data);
      const calendar = JSON.parse(data);
      const events = calendar.events;

      slots = slots.filter(
        (s) =>
          !events.some(
            (ev: { startDate: Date; endDate: Date }) =>
              getUtcComponents(new Date(ev.startDate)) <=
              getUtcComponents(new Date(s.startDate)) &&
              getUtcComponents(new Date(ev.endDate)) >=
              getUtcComponents(new Date(s.endDate))
          )
      );
    }

    slots.forEach(slot => {
      slot.hash = md5(slot.title + slot.startDate + slot.endDate);
    })

    const name = this.name || calendar.name;

    return new BasicRepresentation(
      JSON.stringify({name, events: slots}),
      identifier,
      outputType
    );
  }

  async _getSettings() {
    // @ts-ignore
    const {availabilitySlots, minimumSlotDuration, timezone, weekend} =
      yaml.load(
        await fs.readFile(
          path.resolve(process.cwd(), this.settingsPath),
          "utf8"
        )
      );
    this.availabilitySlots = availabilitySlots ?? this.availabilitySlots;
    this.minimumSlotDuration = minimumSlotDuration ?? this.minimumSlotDuration;
    this.timezone = timezone ?? this.timezone;
    this.weekend = weekend ?? this.weekend;
  }

  _getStartDateForSlots(): Date {
    if (!this.startDate) {
      return new Date();
    }

    return this.startDate;
  }
}