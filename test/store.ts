import { CssServer } from "./servers/test-css-server";
import { IcalServer } from "./servers/test-ical-server";
import {
  getDaysBetween,
  getUtcComponents,
  inWeekend,
  onHoliday,
} from "../src/date-utils";
import fetch from "node-fetch";
import { expect } from "chai";
import * as assert from "assert";
import { IcsToJsonConverter } from "../src/ics-to-json-converter";
import {
  guardedStreamFrom,
  RepresentationMetadata,
  readableToString,
} from "@solid/community-server";
import * as test_config_json from "./configs/test-config.json";
import * as holiday_config_json from "./configs/holidays.json";

const correctConfig = "./test/configs/test-config.json";
const emptyConfig = "./test/configs/test-empty-config.json";
const noStartDateConfig = "./test/configs/test-no-startDate-config.json";
const weekendConfig = "./test/configs/test-weekend-config.json";
const removeFieldsConfig = "./test/configs/test-remove-fields-config.json";
const aggregateNameConfig = "./test/configs/test-aggregate-name-config.json";
const holidayConfig = "./test/configs/test-holiday-config.json";
const incorrectConfig = "./test/configs/test-incorrect-config.json";

/**
 * Performs a GET request on 1 of the endpoints and parses the response to JSON.
 * @param endpoint - The endpoint to GET
 * @returns The JSON parsed response text
 */
const getEndpoint = async (endpoint: string): Promise<any> => {
  const response = await fetch(`http://localhost:3000/${endpoint}`);
  const text = await response.text();

  if (response.status !== 200) return response.status;

  if (response.headers.get("content-type") !== "text/calendar") {
    return JSON.parse(text);
  } else {
    return [text, "text/calendar"];
  }
};

describe("stores", function () {
  this.timeout(4000);

  const cssServer = new CssServer();
  const icalServer = new IcalServer();

  before(async () => {
    await cssServer.start(correctConfig);
    icalServer.start();
  });

  after(async () => {
    await cssServer.stop();
    icalServer.stop();
  });

  describe("AggregateStore", () => {
    it("Aggregate should concat the events", async () => {
      const expectedResult = {
        events: [
          {
            description: "It works ;)",
            location: "my room",
            startDate: "2021-06-16T10:00:10.000Z",
            endDate: "2021-06-16T10:00:13.000Z",
            title: "[my first iCal] Example Event",
            url: "http://sebbo.net/",
          },
          {
            description: "It works ;)",
            location: "my room",
            startDate: "2021-06-16T10:00:10.000Z",
            endDate: "2021-06-16T10:00:13.000Z",
            title: "[my first iCal] Example Event",
            url: "http://sebbo.net/",
          },
        ],
      };

      const result = await getEndpoint("aggregate");

      expect(result).excluding("name").to.deep.equal(expectedResult);
    });

    it("Default name is used", async () => {
      const expectedResult = {
        name: "Aggregated calendar of my first iCal and my first iCal",
      };

      const result = await getEndpoint("aggregate");

      expect(result).excluding("events").to.deep.equal(expectedResult);
    });
  });

  describe("CalendarStore", () => {
    it("Calendar should return iCal format", async () => {
      const response = await getEndpoint("calendar");

      expect(response[1]).equal("text/calendar");
    });

    it("Calendar should return the same iCal as the one from the url ", async () => {
      const expectedResult = {
        name: "my first iCal",
        events: [
          {
            description: "It works ;)",
            location: "my room",
            startDate: "2021-06-16T10:00:10.000Z",
            endDate: "2021-06-16T10:00:13.000Z",
            title: "Example Event",
            url: "http://sebbo.net/",
          },
        ],
      };

      const response = await getEndpoint("calendar");
      const stream = guardedStreamFrom(response[0]);

      const resultStream = await new IcsToJsonConverter().handle({
        identifier: { path: "text/calendar" },
        representation: {
          metadata: new RepresentationMetadata("text/calendar"),
          data: stream,
          binary: false,
        },
        preferences: {},
      });

      const data = await readableToString(resultStream.data);
      const resultTyped = JSON.parse(data);

      expect(resultTyped).to.deep.equal(expectedResult);
    });
  });

  describe("AvailabilityStore", () => {
    it("Summary of each event should be: 'Available for meetings'", async () => {
      const expectedResult = "Available for meetings";

      const result = await getEndpoint("availability");
      const resultSummary = result.events.map(
        ({ summary }: { summary: String }) => summary
      );

      expect(resultSummary.every((s: string) => s === expectedResult)).to.equal(
        true
      );
    });

    it("Start date should be the date specified in the config", async () => {
      const result = await getEndpoint("availability");
      const resultTyped = getUtcComponents(
        new Date(result.events[result.events.length - 1].startDate)
      );

      const startDate =
        test_config_json["@graph"][1]["AvailabilityStore:_options_startDate"]!!;
      const startDateTyped = getUtcComponents(new Date(startDate));

      expect(resultTyped).to.deep.equal(startDateTyped);
    });

    it("Slots should be over a 14 day period", async () => {
      const result = await getEndpoint("availability");
      const events = result.events;

      const endDate = new Date(events[0].startDate);
      const startDate = new Date(events[events.length - 1].startDate);

      assert.deepStrictEqual(getDaysBetween(endDate, startDate), 14);
    });
  });

  describe("TransformationStore", () => {
    it("Non-applying events should only contain insensitive fields", async () => {
      const expectedResult = {
        name: "my first iCal",
        events: [
          {
            startDate: "2021-06-16T10:00:10.000Z",
            endDate: "2021-06-16T10:00:13.000Z",
            title: "Example Event",
          },
        ],
      };
      const result = await getEndpoint("busy");

      expect(result).to.deep.equal(expectedResult);
    });

    it("By default all rules apply", async () => {
      const expectedResult = {
        name: "my first iCal",
        events: [
          {
            startDate: "2021-06-16T10:00:10.000Z",
            endDate: "2021-06-16T10:00:13.000Z",
            title: "Out of office",
          },
        ],
      };
      const result = await getEndpoint("transformation");

      expect(result).to.deep.equal(expectedResult);
    });
  });

  describe("HolidayStore", () => {
    it("Output should match expected output", async () => {
      const expectedResult = {
        name: "Holiday",
        events: [
          {
            endDate: "2021-01-01T23:59:00.000Z",
            startDate: "2021-01-01T00:00:00.000Z",
            title: "New Year",
          },
          {
            endDate: "2021-12-31T23:59:00.000Z",
            startDate: "2021-12-31T00:00:00.000Z",
            title: "New Year's Eve",
          },
          {
            endDate: "2021-04-04T23:59:00.000Z",
            startDate: "2021-04-04T00:00:00.000Z",
            title: "easter",
          },
          {
            endDate: "2021-06-12T23:59:00.000Z",
            startDate: "2021-06-12T00:00:00.000Z",
            title: "Father's Day",
          },
        ],
      };
      const result = await getEndpoint("holidays");

      expect(result).to.deep.equal(expectedResult);
    });
  });
});

describe("alternate icalserver", function () {
  this.timeout(4000);

  const cssServer = new CssServer();
  const icalServer = new IcalServer(true);

  before(async () => {
    await cssServer.start(correctConfig);
    icalServer.start();
  });

  after(async () => {
    await cssServer.stop();
    icalServer.stop();
  });

  describe("TransformationStore", () => {
    it("A definition can contain multiple rules", async () => {
      const expectedResult = {
        name: "my first iCal",
        events: [
          {
            startDate: "2021-06-16T10:00:10.000Z",
            endDate: "2021-06-16T10:00:13.000Z",
            title: "Example Event",
          },
          {
            startDate: "2021-06-16T10:00:10.000Z",
            endDate: "2021-06-16T10:00:13.000Z",
            title: "Available",
          },
          {
            startDate: "2021-06-16T10:00:10.000Z",
            endDate: "2021-06-16T10:00:13.000Z",
            title: "Unavailable",
          },
        ],
      };
      const result = await getEndpoint("busy");

      expect(result).to.deep.equal(expectedResult);
    });
  });
});

describe("Alternate TransformationStore", () => {
  const cssServer = new CssServer();
  const icalServer = new IcalServer();

  before(async () => {
    await cssServer.start(removeFieldsConfig);
    icalServer.start();
  });

  after(async () => {
    await cssServer.stop();
    icalServer.stop();
  });

  it("removeFieldsConfig overrides default", async () => {
    const expectedResult = {
      name: "my first iCal",
      events: [
        {
          description: "It works ;)",
          location: "my room",
          url: "http://sebbo.net/",
        },
      ],
    };

    const result = await getEndpoint("transformation");

    expect(result).to.deep.equal(expectedResult);
  });
});

describe("empty config", () => {
  const cssServer = new CssServer();
  const icalServer = new IcalServer();

  before(async () => {
    await cssServer.start(emptyConfig);
    icalServer.start();
  });

  after(async () => {
    await cssServer.stop();
    icalServer.stop();
  });

  it("TransformationStore - Only insensitive data should remain", async () => {
    const expectedResult = {
      name: "my first iCal",
      events: [
        {
          startDate: "2021-06-16T10:00:10.000Z",
          endDate: "2021-06-16T10:00:13.000Z",
          title: "Example Event",
        },
      ],
    };

    const result = await getEndpoint("transformation");

    expect(result).to.deep.equal(expectedResult);
  });

  it("HolidayStore - No events should be returned", async () => {
    const expectedResult = {
      name: "Holiday",
      events: [],
    };

    const result = await getEndpoint("holidays");

    expect(result).to.deep.equal(expectedResult);
  });
});

describe("incorrect config", function () {
  this.timeout(4000);

  const cssServer = new CssServer();
  const icalServer = new IcalServer();

  before(async () => {
    await cssServer.start(incorrectConfig);
    icalServer.start();
  });

  after(async () => {
    await cssServer.stop();
    icalServer.stop();
  });

  it("HolidayStore - 500", async () => {
    await expect(getEndpoint("holidays")).to.eventually.equal(500);
  });
});

describe("AvailabilityStore - No startDate", function () {
  this.timeout(4000);

  const cssServer = new CssServer();
  const icalServer = new IcalServer();

  before(async () => {
    await cssServer.start(noStartDateConfig);
    icalServer.start();
  });

  after(async () => {
    await cssServer.stop();
    icalServer.stop();
  });

  it("startDate is now", async () => {
    const result = await getEndpoint("availability");
    const resultStartDateTyped = getUtcComponents(
      new Date(result.events[result.events.length - 1].startDate)
    ).toString();

    const expectedResult = getUtcComponents().toString();

    expect(resultStartDateTyped).to.equal(expectedResult);
  });

  it("stampDate is now", async () => {
    const result = await getEndpoint("availability");
    const resultStampDateTyped = getUtcComponents(
      new Date(result.events[result.events.length - 1].startDate)
    ).toString();

    const expectedResult = getUtcComponents().toString();
    expect(resultStampDateTyped).to.equal(expectedResult);
  });
});

describe("AvailabilityStore - Weekend", function () {
  this.timeout(4000);

  const cssServer = new CssServer();
  const icalServer = new IcalServer();

  before(async () => {
    await cssServer.start(weekendConfig);
    icalServer.start();
  });

  after(async () => {
    await cssServer.stop();
    icalServer.stop();
  });

  it("stampDate is in weekend", async () => {
    const result = await getEndpoint("availability");
    const resultStampDate = result.events
      .map(({ stampDate }: { stampDate: Date }) =>
        inWeekend(new Date(stampDate))
      )
      .every(Boolean);

    expect(resultStampDate).to.equal(true);
  });

  it("startDate is not in weekend", async () => {
    const result = await getEndpoint("availability");
    const resultStartDate = result.events
      .map(({ startDate }: { startDate: Date }) =>
        inWeekend(new Date(startDate))
      )
      .every(Boolean);

    expect(resultStartDate).to.equal(false);
  });

  it("slots are over 11 day period", async () => {
    const result = await getEndpoint("availability");
    const events = result.events;
    const endDate = new Date(events[0].startDate);
    const startDate = new Date(events[events.length - 1].startDate);

    assert.deepStrictEqual(getDaysBetween(endDate, startDate), 11);
  });
});

describe("AvailabilityStore - Holiday", function () {
  this.timeout(4000);

  const cssServer = new CssServer();
  const icalServer = new IcalServer();

  before(async () => {
    await cssServer.start(holidayConfig);
    icalServer.start();
  });

  after(async () => {
    await cssServer.stop();
    icalServer.stop();
  });

  it("stampDate is on a holiday", async () => {
    const result = await getEndpoint("availability");
    const resultStampDate = result.events
      .map(({ stampDate }: { stampDate: Date }) =>
        onHoliday(new Date(stampDate), holiday_config_json)
      )
      .every(Boolean);

    expect(resultStampDate).to.equal(true);
  });

  it("startDate is not on a holiday", async () => {
    const result = await getEndpoint("availability");
    const resultStartDate = result.events
      .map(({ startDate }: { startDate: Date }) =>
        onHoliday(new Date(startDate), holiday_config_json)
      )
      .every(Boolean);

    expect(resultStartDate).to.equal(false);
  });
});

describe("AggregateStore - Alternate", function () {
  this.timeout(4000);

  const cssServer = new CssServer();
  const icalServer = new IcalServer();

  before(async () => {
    await cssServer.start(aggregateNameConfig);
    icalServer.start();
  });

  after(async () => {
    await cssServer.stop();
    icalServer.stop();
  });

  it("Calendar name is the custom defined name", async () => {
    const expectedResult = {
      name: "Custom calendar name",
    };

    const result = await getEndpoint("aggregate");

    expect(result).excluding("events").to.deep.equal(expectedResult);
  });
});
