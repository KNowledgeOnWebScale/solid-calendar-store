import { CssServer } from "./servers/test-css-server";
import { IcalServer } from "./servers/test-ical-server";
import {
  getDatesBetween,
  getUtcComponents,
  inWeekend,
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

const correctConfig = "./test/configs/test-config.json";
const emptyConfig = "./test/configs/test-empty-config.json";
const noStartDateConfig = "./test/configs/test-no-startDate-config.json";
const weekendConfig = "./test/configs/test-weekend-config.json";

/**
 * Performs a GET request on 1 of the endpoints and parses the response to JSON.
 * @param endpoint - The endpoint to GET
 * @returns The JSON parsed response text
 */
const getEndpoint = async (endpoint: string): Promise<any> => {
  const response = await fetch(`http://localhost:3000/${endpoint}`);
  const text = await response.text();

  if (response.headers.get("content-type") !== "text/calendar") {
    return JSON.parse(text);
  } else {
    return [text, "text/calendar"];
  }
};

describe("stores", function () {
  this.timeout(3000);
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
      const expectedResult = [
        {
          startDate: "2021-06-16T10:00:10.000Z",
          endDate: "2021-06-16T10:00:13.000Z",
          title: "[my first iCal] Example Event",
        },
        {
          startDate: "2021-06-16T10:00:10.000Z",
          endDate: "2021-06-16T10:00:13.000Z",
          title: "[my first iCal] Example Event",
        },
      ];

      const result = await getEndpoint("aggregate");

      expect(result).to.deep.equal(expectedResult);
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
            endDate: "2021-06-16T10:00:13.000Z",
            startDate: "2021-06-16T10:00:10.000Z",
            title: "Example Event",
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
      const resultSummary = result.map(
        ({ summary }: { summary: String }) => summary
      );

      expect(resultSummary.every((s: string) => s === expectedResult));
    });

    it("Start date should be the date specified in the config", async () => {
      const result = await getEndpoint("availability");
      const resultTyped = getUtcComponents(
        new Date(result[result.length - 1].startDate)
      );

      const startDate =
        test_config_json["@graph"][1]["AvailabilityStore:_options_startDate"]!!;
      const startDateTyped = getUtcComponents(new Date(startDate));

      expect(resultTyped).to.deep.equal(startDateTyped);
    });

    it("Slots should be over a 14 day period", async () => {
      const result = await getEndpoint("availability");

      const endDate = new Date(result[0].startDate);
      const startDate = new Date(result[result.length - 1].startDate);

      assert.deepStrictEqual(getDatesBetween(endDate, startDate), 14);
    });
  });

  describe("TransformationStore", () => {
    it("Non-applying events should be left alone", async () => {
      const expectedResult = [
        {
          startDate: "2021-06-16T10:00:10.000Z",
          endDate: "2021-06-16T10:00:13.000Z",
          title: "Example Event",
        },
      ];
      const result = await getEndpoint("busy");

      expect(result).to.deep.equal(expectedResult);
    });

    it("By default all rules apply", async () => {
      const expectedResult = [
        {
          startDate: "2021-06-16T10:00:10.000Z",
          endDate: "2021-06-16T10:00:13.000Z",
          title: "Out of office",
        },
      ];
      const result = await getEndpoint("transformation");

      expect(result).to.deep.equal(expectedResult);
    });
  });
});

describe("alternate icalserver", () => {
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
      const expectedResult = [
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
      ];
      const result = await getEndpoint("busy");

      expect(result).to.deep.equal(expectedResult);
    });
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

  it("TransformationStore - Data should be unchanged", async () => {
    const expectedResult = [
      {
        startDate: "2021-06-16T10:00:10.000Z",
        endDate: "2021-06-16T10:00:13.000Z",
        title: "Example Event",
      },
    ];

    const result = await getEndpoint("transformation");

    expect(result).to.deep.equal(expectedResult);
  });
});

describe("AvailabilityStore - No startDate", () => {
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
      new Date(result[result.length - 1].startDate)
    ).toString();

    const expectedResult = getUtcComponents().toString();

    expect(resultStartDateTyped).to.equal(expectedResult);
  });

  it("stampDate is now", async () => {
    const result = await getEndpoint("availability");
    const resultStampDateTyped = getUtcComponents(
      new Date(result[result.length - 1].startDate)
    ).toString();

    const expectedResult = getUtcComponents().toString();
    expect(resultStampDateTyped).to.equal(expectedResult);
  });
});

describe("AvailabilityStore - Weekend", () => {
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
    const resultStampDate = result
      .map(({ stampDate }: { stampDate: Date }) =>
        inWeekend(new Date(stampDate))
      )
      .every(Boolean);

    expect(resultStampDate);
  });

  it("startDate is not in weekend", async () => {
    const result = await getEndpoint("availability");
    const resultStartDate = result
      .map(
        ({ startDate }: { startDate: Date }) => !inWeekend(new Date(startDate))
      )
      .every(Boolean);

    expect(resultStartDate);
  });

  it("slots are over 11 day period", async () => {
    const result = await getEndpoint("availability");

    const endDate = new Date(result[0].startDate);
    const startDate = new Date(result[result.length - 1].startDate);

    assert.deepStrictEqual(getDatesBetween(endDate, startDate), 11);
  });
});
