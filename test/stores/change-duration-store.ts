import {expect} from "chai";
import {CssServer} from "../servers/test-css-server";
import {IcalServer} from "../servers/test-ical-server";
import {
  changeDurationStoreConfig,
  getEndpoint,
} from "./common";

describe("ChangeDurationStore", function () {
  this.timeout(60000);

  const cssServer = new CssServer();
  const icalServer = new IcalServer({
    events: [
      {
        start: "Wed Jun 16 2021 12:00:10 GMT+0200",
        end: "Wed Jun 16 2021 12:00:13 GMT+0200",
        summary: "Example Event (PH) 🚗15,10",
        description: "It works ;)",
        location: "my room",
        url: "http://example.com/",
      },
      {
        start: "Thu Jun 17 2021 12:00:10 GMT+0200",
        end: "Thu Jun 17 2021 12:00:13 GMT+0200",
        summary: "🚗15,10 Test",
        description: "It works ;)",
        location: "my room",
        url: "http://example.com/",
      },
      {
        start: "Thu Jun 17 2021 12:00:10 GMT+0200",
        end: "Thu Jun 17 2021 12:00:13 GMT+0200",
        summary: "Test with car",
        description: "It works ;)",
        location: "my room",
        url: "http://example.com/",
      }
    ]
  });

  describe("Default", () => {
    before(async () => {
      await cssServer.start(changeDurationStoreConfig);
      icalServer.start();
    });

    after(async () => {
      await cssServer.stop();
      icalServer.stop();
    });

    describe("Add time before and after using prefix", () => {
      it("Keep prefix in output", async () => {
        const expectedResult = {
          name: "my first iCal",
          events: [
            {
              "description": "It works ;)",
              "endDate": "2021-06-16T10:10:13.000Z",
              "location": "my room",
              "startDate": "2021-06-16T09:45:10.000Z",
              "title": "Example Event (PH) 🚗15,10",
              "url": "http://example.com/"
            },
            {
              "description": "It works ;)",
              "endDate": "2021-06-17T10:10:13.000Z",
              "location": "my room",
              "startDate": "2021-06-17T09:45:10.000Z",
              "title": "🚗15,10 Test",
              "url": "http://example.com/"
            },
            {
              "description": "It works ;)",
              "endDate": "2021-06-17T10:00:13.000Z",
              "location": "my room",
              "startDate": "2021-06-17T10:00:10.000Z",
              "title": "Test with car",
              "url": "http://example.com/"
            }
          ],
        };
        const result = await getEndpoint("change-duration-prefix");

        expect(result.events).excluding('hash').to.deep.equal(expectedResult.events);
      });

      it("Remove prefix in output", async () => {
        const expectedResult = {
          name: "my first iCal",
          events: [
            {
              "description": "It works ;)",
              "endDate": "2021-06-16T10:10:13.000Z",
              "location": "my room",
              "startDate": "2021-06-16T09:45:10.000Z",
              "title": "Example Event (PH)",
              "url": "http://example.com/"
            },
            {
              "description": "It works ;)",
              "endDate": "2021-06-17T10:10:13.000Z",
              "location": "my room",
              "startDate": "2021-06-17T09:45:10.000Z",
              "title": "Test",
              "url": "http://example.com/"
            },
            {
              "description": "It works ;)",
              "endDate": "2021-06-17T10:00:13.000Z",
              "location": "my room",
              "startDate": "2021-06-17T10:00:10.000Z",
              "title": "Test with car",
              "url": "http://example.com/"
            }
          ],
        };
        const result = await getEndpoint("change-duration-prefix-remove-duration");

        expect(result.events).excluding('hash').to.deep.equal(expectedResult.events);
      });
    });

    it("Add time before and after using match", async () => {
      const expectedResult = {
        name: "my first iCal",
        events: [
          {
            "description": "It works ;)",
            "endDate": "2021-06-16T10:00:13.000Z",
            "location": "my room",
            "startDate": "2021-06-16T10:00:10.000Z",
            "title": "Example Event (PH) 🚗15,10",
            "url": "http://example.com/"
          },
          {
            "description": "It works ;)",
            "endDate": "2021-06-17T10:00:13.000Z",
            "location": "my room",
            "startDate": "2021-06-17T10:00:10.000Z",
            "title": "🚗15,10 Test",
            "url": "http://example.com/"
          },
          {
            "description": "It works ;)",
            "endDate": "2021-06-17T10:30:13.000Z",
            "location": "my room",
            "startDate": "2021-06-17T09:30:10.000Z",
            "title": "Test with car",
            "url": "http://example.com/"
          }
        ],
      };
      const result = await getEndpoint("change-duration-selected");

      expect(result.events).excluding('hash').to.deep.equal(expectedResult.events);
    });
  });
});