import {expect} from "chai";
import {CssServer} from "../servers/test-css-server";
import {IcalServer} from "../servers/test-ical-server";
import {
  keepEventsStoreConfig,
  getEndpoint, keepEventsStoreOnlyUpcomingConfig,
} from "./common";

describe("KeepEventsStore", function () {
  this.timeout(60000);

  const cssServer = new CssServer();
  const icalServer = new IcalServer({
    events: [
      {
        start: "Wed Jun 16 2021 12:00:10 GMT+0200",
        end: "Wed Jun 16 2021 12:00:13 GMT+0200",
        summary: "Example Event (PH)",
        description: "It works ;)",
        location: "my room",
        url: "http://example.com/",
      },
      {
        start: "Wed Jun 17 2021 12:00:10 GMT+0200",
        end: "Wed Jun 17 2021 12:00:13 GMT+0200",
        summary: "Remove this",
        description: "It works ;)",
        location: "my room",
        url: "http://example.com/",
      },
      {
        start: "Wed Jan 28 2032 12:00:10 GMT+0200",
        end: "Wed Jan 28 2032 12:00:13 GMT+0200",
        summary: "Keep this"
      }
    ]
  });

  describe("Match", () => {
    before(async () => {
      await cssServer.start(keepEventsStoreConfig);
      icalServer.start();
    });

    after(async () => {
      await cssServer.stop();
      icalServer.stop();
    });

    it("Only keep events with 'PH' in title", async () => {
      const expectedResult = {
        name: "my first iCal",
        events: [
          {
            startDate: "2021-06-16T10:00:10.000Z",
            endDate: "2021-06-16T10:00:13.000Z",
            title: "Example Event (PH)",
            description: "It works ;)",
            location: "my room",
            url: "http://example.com/",
          }
        ],
      };
      const result = await getEndpoint("keep");

      expect(result.events).excluding('hash').to.deep.equal(expectedResult.events);
    });

    it("Only keep upcoming events", async () => {
      const expectedResult = {
        name: "my first iCal",
        events: [
          {
            startDate: "2021-06-16T10:00:10.000Z",
            endDate: "2021-06-16T10:00:13.000Z",
            title: "Example Event (PH)",
            description: "It works ;)",
            location: "my room",
            url: "http://example.com/",
          }
        ],
      };
      const result = await getEndpoint("keep");

      expect(result.events).excluding('hash').to.deep.equal(expectedResult.events);
    });
  });

  describe("pastEvents", () => {
    before(async () => {
      await cssServer.start(keepEventsStoreOnlyUpcomingConfig);
      icalServer.start();
    });

    after(async () => {
      await cssServer.stop();
      icalServer.stop();
    });

    it("Only keep upcoming events", async () => {
      const expectedResult = {
        name: "my first iCal",
        events: [
          {
            "endDate": "2032-01-28T10:00:13.000Z",
            "startDate": "2032-01-28T10:00:10.000Z",
            "title": "Keep this"
          }
        ],
      };
      const result = await getEndpoint("keep");

      expect(result.events).excluding('hash').to.deep.equal(expectedResult.events);
    });
  });
});