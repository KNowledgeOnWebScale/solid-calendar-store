import {
  BaseResourceStore,
  BasicRepresentation,
  readableToString,
  Representation,
  RepresentationConvertingStore,
  ResourceIdentifier,
} from "@solid/community-server";

const outputType = "application/json";
const defaultCalendarName = (source1: string, source2: string) =>
  `Aggregated calendar of ${source1} and ${source2}`;

export class AggregateStore extends BaseResourceStore {
  private source1: RepresentationConvertingStore;
  private source2: RepresentationConvertingStore;
  private readonly name?: string;

  constructor(
    source1: RepresentationConvertingStore,
    source2: RepresentationConvertingStore,
    options: { name?: string }
  ) {
    super();

    this.source1 = source1;
    this.source2 = source2;

    this.name = options.name;
  }

  public async getRepresentation(
    identifier: ResourceIdentifier
  ): Promise<Representation> {
    const events1 = await this._getJson(this.source1, identifier);
    const events2 = await this._getJson(this.source2, identifier);

    this._addCalendarNameToTitle(events1);
    this._addCalendarNameToTitle(events2);

    const allEvents = events1.events.concat(events2.events);

    return new BasicRepresentation(
      JSON.stringify({
        name: this.name ?? defaultCalendarName(events1.name, events2.name),
        events: allEvents,
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
    return JSON.parse(data);
  }

  /**
   * Prepends the calendar name to each event
   * @param calendar - The calendar whoms events to transform
   */
  _addCalendarNameToTitle(calendar: {
    events: { title: string }[];
    name: any;
  }) {
    calendar.events.map(
      (ev: { title: string }) => (ev.title = `[${calendar.name}] ${ev.title}`)
    );
  }
}
