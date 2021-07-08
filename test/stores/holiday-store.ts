import { CssServer } from "../servers/test-css-server";
import { IcalServer } from "../servers/test-ical-server";
import { expect } from "chai";
import {
  correctConfig,
  emptyConfig,
  getEndpoint,
  incorrectConfig,
} from "./common";

describe("HolidayStore", function () {
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

describe("HolidayStore - empty config", () => {
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

  it("No events should be returned", async () => {
    const expectedResult = {
      name: "Holiday",
      events: [],
    };

    const result = await getEndpoint("holidays");

    expect(result).to.deep.equal(expectedResult);
  });
});

describe("HolidayStore - incorrect config", function () {
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

  it("500", async () => {
    await expect(getEndpoint("holidays")).to.eventually.equal(500);
  });
});
