import * as chai from "chai";
import chaiExclude from "chai-exclude";
import {CssServer} from "../servers/test-css-server";
import {IcalServer} from "../servers/test-ical-server";
import {
  getEndpoint, keepEventsStoreOnlyUpcomingConfig, mergeEventsStoreConfig, mergeEventsStoreDistanceConfig,
} from "./common";

chai.use(chaiExclude);
const {expect} = chai;

describe("MergeEventsStore", function () {
  this.timeout(60000);

  const cssServer = new CssServer();
  const icalServer = new IcalServer({
    events: [
      {
        start: "Wed Jun 16 2021 12:00:00 GMT+0200",
        end: "Wed Jun 16 2021 13:00:00 GMT+0200",
        summary: "Example Event (PH)",
      },
      {
        start: "Wed Jun 16 2021 13:00:00 GMT+0200",
        end: "Wed Jun 16 2021 14:00:00 GMT+0200",
        summary: "Example Event (PH)",
      },
      {
        start: "Wed Jun 16 2021 14:05:00 GMT+0200",
        end: "Wed Jun 16 2021 15:00:00 GMT+0200",
        summary: "Example Event (PH)",
      }
    ]
  });

  describe("Match all. Distance = 0s", () => {
    before(async () => {
      await cssServer.start(mergeEventsStoreConfig);
      icalServer.start();
    });

    after(async () => {
      await cssServer.stop();
      icalServer.stop();
    });

    it("Only keep two events", async () => {
      const expectedResult = {
        name: "my first iCal",
        events: [
          {
            startDate: "2021-06-16T10:00:00.000Z",
            endDate: "2021-06-16T12:00:00.000Z",
            title: "Example Event (PH)",
          },
          {
            startDate: "2021-06-16T12:05:00.000Z",
            endDate: "2021-06-16T13:00:00.000Z",
            title: "Example Event (PH)",
          },
        ],
      };
      const result = await getEndpoint("merge");

      expect(result.events).excluding('hash').to.deep.equal(expectedResult.events);
    });
  });

  describe("Match all. Distance = 3m", () => {
    before(async () => {
      await cssServer.start(mergeEventsStoreDistanceConfig);
      icalServer.start();
    });

    after(async () => {
      await cssServer.stop();
      icalServer.stop();
    });

    it("Only keep one event", async () => {
      const expectedResult = {
        name: "my first iCal",
        events: [
          {
            startDate: "2021-06-16T10:00:00.000Z",
            endDate: "2021-06-16T13:00:00.000Z",
            title: "Example Event (PH)",
          }
        ],
      };
      const result = await getEndpoint("merge");

      expect(result.events).excluding('hash').to.deep.equal(expectedResult.events);
    });
  });
});
