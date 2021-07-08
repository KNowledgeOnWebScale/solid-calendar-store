import { CssServer } from "../servers/test-css-server";
import { IcalServer } from "../servers/test-ical-server";
import {
  getDaysBetween,
  getUtcComponents,
  inWeekend,
  onHoliday,
} from "../../src/date-utils";
import { expect } from "chai";
import * as assert from "assert";
import * as holiday_config_json from "../configs/holidays.json";
import {
  correctConfig,
  getEndpoint,
  holidayConfig,
  noStartDateConfig,
  weekendConfig,
} from "./common";
import * as test_config_json from "../configs/test-config.json";

describe("AvailabilityStore", function () {
  this.timeout(4000);

  const cssServer = new CssServer();
  const icalServer = new IcalServer();

  describe("Default", () => {
    before(async () => {
      await cssServer.start(correctConfig);
      icalServer.start();
    });

    after(async () => {
      await cssServer.stop();
      icalServer.stop();
    });

    it("Summary of each event should be: 'Available for meetings'", async () => {
      const expectedResult = "Available for meetings";

      const result = await getEndpoint("availability");
      const resultTitle = result.events.map(
        ({ title }: { title: String }) => title
      );

      expect(resultTitle.every((s: string) => s === expectedResult)).to.equal(
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

  describe("No startDate", function () {
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

  describe("Weekend", function () {
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

  describe("Holiday", function () {
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
});
