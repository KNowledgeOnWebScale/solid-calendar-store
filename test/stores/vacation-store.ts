import * as chai from "chai";
import chaiExclude from 'chai-exclude';

import { CssServer } from "../servers/test-css-server";
import { IcalServer } from "../servers/test-ical-server";
import {
  getEndpoint,
  aggregateNameConfig,
  aggregateStoreConfig,
  vacationStoreConfig,
  vacationStoreAlternateConfig
} from "./common";

chai.use(chaiExclude);
const expect = chai.expect;

describe("VacationStore", function () {
  this.timeout(20000);

  const cssServer = new CssServer();
  const icalServer = new IcalServer({
    events: [
      {
        start: "2021-06-16T00:00:00.000Z",
        end: "2021-06-16T23:59:59.000Z",
        summary: "[vacation]"
      },
      {
        start: "2021-06-17T00:00:00.000Z",
        end: "2021-06-17T23:59:59.000Z",
        summary: "[vacation] PM"
      },
      {
        start: "2021-06-18T00:00:00.000Z",
        end: "2021-06-18T20:59:59.000Z",
        summary: "[vacation] PM"
      },
      {
        start: "2021-06-19T00:00:00.000Z",
        end: "2021-06-19T23:59:59.000Z",
        summary: "[vacation] AM"
      },
    ]
  });

  describe("Default", () => {
    before(async () => {
      await cssServer.start(vacationStoreConfig);
      icalServer.start();
    });

    after(async () => {
      await cssServer.stop();
      icalServer.stop();
    });

    it("All days are returned", async () => {
      const expectedResult = {
        days: [
          {
            date: "2021-06-16",
            partOfDay: "FullDay"
          },
          {
            date: "2021-06-17",
            partOfDay: "Afternoon"
          },
          {
            date: "2021-06-19",
            partOfDay: "Morning"
          },
        ],
      };

      const result = await getEndpoint("vacation");
      expect(result).excludingEvery(['name', 'hash']).to.deep.equal(expectedResult);
    });

    it("Default name is used", async () => {
      const expectedResult = {
        name: "Vacation calendar",
      };

      const result = await getEndpoint("vacation");

      expect(result).excluding("days").to.deep.equal(expectedResult);
    });
  });

  describe("Alternate", function () {
    before(async () => {
      await cssServer.start(vacationStoreAlternateConfig);
      icalServer.start();
    });

    after(async () => {
      await cssServer.stop();
      icalServer.stop();
    });

    it("Calendar name is the custom defined name", async () => {
      const expectedResult = {
        name: "I'm free!",
      };

      const result = await getEndpoint("vacation");

      expect(result).excluding("days").to.deep.equal(expectedResult);
    });
  });
});
