import {
  guardedStreamFrom,
  RepresentationMetadata,
  readableToString,
} from "@solid/community-server";
import { expect } from "chai";
import { CssServer } from "../servers/test-css-server";
import { IcalServer } from "../servers/test-ical-server";
import { correctConfig, getEndpoint } from "./common";
import { IcsToJsonConverter } from "../../src/ics-to-json-converter";

describe("CalendarStore", function () {
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
          url: "http://example.com/",
          hash: "a02c2ce90b9a2ace1e712f55ebf18c1c"
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
