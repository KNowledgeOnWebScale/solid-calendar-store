import {CssServer} from "../servers/test-css-server";
import {IcalServer} from "../servers/test-ical-server";
import * as chai from "chai";
import chaiExclude from "chai-exclude";
import {
  holidayStoreEmptyConfig,
  holidayStoreIncorrectConfig,
  getEndpoint, holidayStoreConfig,
} from "./common";

chai.use(chaiExclude);
const {expect} = chai;

describe("HolidayStore", function () {
  this.timeout(20000);

  const cssServer = new CssServer();
  const icalServer = new IcalServer();

  describe("Default", () => {
    before(async () => {
      await cssServer.start(holidayStoreConfig);
      icalServer.start();
    });

    after(async () => {
      await cssServer.stop();
      icalServer.stop();
    });

    it("Output should match expected output", async () => {
      const expectedResult = {
        name: "Holiday",
        events: [
          {
            endDate: "2023-01-01T23:59:00.000Z",
            startDate: "2023-01-01T00:00:00.000Z",
            title: "New Year",
          },
          {
            endDate: "2023-12-31T23:59:00.000Z",
            startDate: "2023-12-31T00:00:00.000Z",
            title: "New Year's Eve",
          },
          {
            endDate: "2023-04-09T23:59:00.000Z",
            startDate: "2023-04-09T00:00:00.000Z",
            title: "Easter",
          },
          {
            endDate: "2023-06-10T23:59:00.000Z",
            startDate: "2023-06-10T00:00:00.000Z",
            title: "Father's Day",
          },
        ],
      };
      const result = await getEndpoint("holidays");

      expect(result).to.deep.equal(expectedResult);
    });
  });

  describe("Empty config", () => {
    before(async () => {
      await cssServer.start(holidayStoreEmptyConfig);
      icalServer.start();
    });

    after(async () => {
      await cssServer.stop();
      icalServer.stop();
    });

    it("No events should be returned", async () => {
      const expectedResult = {
        name: "Holiday",
        events: [],
      };

      const result = await getEndpoint("holidays");

      expect(result).to.deep.equal(expectedResult);
    });
  });

  describe("Incorrect config", function () {
    before(async () => {
      await cssServer.start(holidayStoreIncorrectConfig);
      icalServer.start();
    });

    after(async () => {
      await cssServer.stop();
      icalServer.stop();
    });

    it("500", async () => {
      const result = await getEndpoint("holidays");
      expect(result).to.equal(500);
    });
  });
});
