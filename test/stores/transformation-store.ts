import { expect } from "chai";
import { CssServer } from "../servers/test-css-server";
import { IcalServer } from "../servers/test-ical-server";
import {
  correctConfig,
  emptyConfig,
  getEndpoint,
  removeFieldsConfig,
} from "./common";

describe("TransformationStore", function () {
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

    it("Non-applying events should only contain insensitive fields", async () => {
      const expectedResult = {
        name: "my first iCal",
        events: [
          {
            startDate: "2021-06-16T10:00:10.000Z",
            endDate: "2021-06-16T10:00:13.000Z",
            title: "Example Event",
          },
        ],
      };
      const result = await getEndpoint("busy");

      expect(result).to.deep.equal(expectedResult);
    });

    it("By default all rules apply", async () => {
      const expectedResult = {
        name: "my first iCal",
        events: [
          {
            startDate: "2021-06-16T10:00:10.000Z",
            endDate: "2021-06-16T10:00:13.000Z",
            title: "Out of office",
          },
        ],
      };
      const result = await getEndpoint("transformation");

      expect(result).to.deep.equal(expectedResult);
    });
  });

  describe("TransformationStore - Alternate", () => {
    before(async () => {
      await cssServer.start(removeFieldsConfig);
      icalServer.start();
    });

    after(async () => {
      await cssServer.stop();
      icalServer.stop();
    });

    it("removeFieldsConfig overrides default", async () => {
      const expectedResult = {
        name: "my first iCal",
        events: [
          {
            description: "It works ;)",
            location: "my room",
            url: "http://example.com/",
            hash: "a02c2ce90b9a2ace1e712f55ebf18c1c"
          },
        ],
      };

      const result = await getEndpoint("transformation");

      expect(result).to.deep.equal(expectedResult);
    });
  });

  describe("Empty config", () => {
    before(async () => {
      await cssServer.start(emptyConfig);
      icalServer.start();
    });

    after(async () => {
      await cssServer.stop();
      icalServer.stop();
    });

    it("Only insensitive data should remain", async () => {
      const expectedResult = {
        name: "my first iCal",
        events: [
          {
            startDate: "2021-06-16T10:00:10.000Z",
            endDate: "2021-06-16T10:00:13.000Z",
            title: "Example Event",
          },
        ],
      };

      const result = await getEndpoint("transformation");

      expect(result).to.deep.equal(expectedResult);
    });
  });
});

// As we're using a different icalServer we can't combine this one with the others
describe("TransformationStore - Alternate icalserver", function () {
  this.timeout(4000);

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

  it("A definition can contain multiple rules", async () => {
    const expectedResult = {
      name: "my first iCal",
      events: [
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
      ],
    };
    const result = await getEndpoint("busy");

    expect(result).to.deep.equal(expectedResult);
  });
});
