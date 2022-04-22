import {
  BaseResourceStore,
  BasicRepresentation,
  readableToString,
  Representation,
  RepresentationConvertingStore,
  ResourceIdentifier,
} from "@solid/community-server";
import {Event} from "./event";
import { differenceInHours } from 'date-fns'
import { format } from 'date-fns'

const outputType = "application/json";

/**
 * Generate vacation calendar based on existing calendar.
 */
export class VacationStore extends BaseResourceStore {
  private readonly source: RepresentationConvertingStore;
  private readonly name?: string;
  private readonly vacationTag: string;
  private readonly morningTag: string;
  private readonly afternoonTag: string;

  constructor(
    source: RepresentationConvertingStore,
    options: { name?: string, vacationTag?: string, morningTag?: string, afternoonTag?: string }
  ) {
    super();

    this.source = source;
    this.name = options.name || 'Vacation calendar';
    this.vacationTag = options.vacationTag || 'Vacation calendar';
    this.morningTag = options.morningTag || 'AM';
    this.afternoonTag = options.afternoonTag || 'PM';
  }

  public async getRepresentation(
    identifier: ResourceIdentifier
  ): Promise<Representation> {
    const {events} = await this._getJson(this.source, identifier);
    const days = this._getVacationDaysFromEvents(events);

    return new BasicRepresentation(
      JSON.stringify({
        name: this.name,
        days,
      }),
      outputType
    );
  }

  async _getJson(
    source: RepresentationConvertingStore,
    identifier: ResourceIdentifier
  ) {
    const sourceRepresentation: Representation = await source.getRepresentation(
      identifier,
      { type: { "application/json": 1 } }
    );
    const data = await readableToString(sourceRepresentation.data);
    const parsedData = JSON.parse(data);
    parsedData.events.forEach((event: Event) => {
      // After deserialization dates are represented as strings and have to be converted to Date objects again.
      event.startDate = new Date(event.startDate);
      event.endDate = new Date(event.endDate);
    });

    return parsedData;
  }

  _getVacationDaysFromEvents(events: []) {
    const days: any[] = [];

    events.forEach((event: Event) => {
      if (event.title.toLocaleLowerCase().includes('[vacation]') && this._is24HoursLong(event)) {
        let partOfDay = 'FullDay';

        if (event.title.includes(this.afternoonTag)) {
          partOfDay = 'Afternoon';
        } else if (event.title.includes(this.morningTag)) {
          partOfDay = 'Morning'
        }

        days.push({
          partOfDay,
          date: format(event.startDate, 'yyyy-MM-dd')
        });
      }
    });

    return days;
  }

  _is24HoursLong(event: Event) {
    return differenceInHours(event.endDate, event.startDate, {roundingMethod: 'round'}) === 24;
  }
}
