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
import {ConcreteResourceIdentifier} from "./ConcreteResourceIdentifier";

const humanToMilliseconds = require('human-to-milliseconds');

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
  private latestRepresentation: Representation | undefined;
  private readonly duration?: number;
  private readonly resourcePath: string;
  private readonly onlyOnce: boolean;

  constructor(
    source: HttpGetStore,
    options: {
      baseUrl: string;
      settingsPath: string;
      holidaySource?: RepresentationConvertingStore;
      startDate?: string;
      name?: string;
      duration?: string;
      resourcePath?: string;
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
    this.onlyOnce = options.duration === 'once';
    this.duration = options.duration === 'once' ? null : humanToMilliseconds(options.duration || '60s');
    this.resourcePath = options.resourcePath || '';
    this._getSettings();

    if (this.resourcePath) {
      this._activatePreGeneration();
    }
  }

  /**
   * This method actives the pre-generation of the calendar.
   * It does this only for the resource identified by this.resourcePath.
   * It regenerates the calendar after the duration given by this.duration,
   * which is in milliseconds.
   */
  async _activatePreGeneration() {
    const fn = async () => {
      this.latestRepresentation = await this._getLatestRepresentation(new ConcreteResourceIdentifier(this.resourcePath));
      console.log(`Availability calendar: Pre-generated representation for resource "${this.resourcePath}" has been updated.`);
    };

    await fn();

    if (!this.onlyOnce) {
      setInterval(fn, this.duration);
    }
  }

  async getRepresentation(
    identifier: ResourceIdentifier,
    preferences: RepresentationPreferences,
    conditions?: Conditions
  ): Promise<Representation> {
    if (this.resourcePath && this.resourcePath === identifier.path && this.latestRepresentation) {
      console.log(`Availability calendar: Use pre-generated representation for resource "${identifier.path}".`);
      return this.latestRepresentation;
    } else {
      return await this._getLatestRepresentation(identifier);
    }
  }

  async _getLatestRepresentation(identifier: ResourceIdentifier): Promise<Representation> {
    try {
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

      return new BasicRepresentation(
        JSON.stringify({name: this.name || calendar.name, events: slots}),
        identifier,
        outputType
      );
    } catch (e) {
      console.error(e);
      throw e;
    }
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