import {
  guardedStreamFrom,
  RepresentationMetadata,
  readableToString,
} from "@solid/community-server";
import * as chai from "chai";
import chaiExclude from "chai-exclude"
import {CssServer} from "../servers/test-css-server";
import {IcalServer} from "../servers/test-ical-server";
import {calendarStoreConfig, getEndpoint} from "./common";
import {IcsToJsonConverter} from "../../src";

chai.use(chaiExclude);
const {expect} = chai;

describe("CalendarStore", function () {
  this.timeout(10000);

  const cssServer = new CssServer();
  const icalServer = new IcalServer();

  before(async () => {
    await cssServer.start(calendarStoreConfig);
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
          url: "http://example.com/"
        },
      ],
    };

    const response = await getEndpoint("calendar");
    const stream = guardedStreamFrom(response[0]);

    const resultStream = await new IcsToJsonConverter().handle({
      identifier: {path: "text/calendar"},
      representation: {
        metadata: new RepresentationMetadata("text/calendar"),
        data: stream,
        binary: false,
        isEmpty: false
      },
      preferences: {},
    });

    const data = await readableToString(resultStream.data);
    const resultTyped = JSON.parse(data);

    expect(resultTyped).excludingEvery('hash').to.deep.equal(expectedResult);
  });
});
