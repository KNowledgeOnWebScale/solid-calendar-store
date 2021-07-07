import { expect } from "chai";
import { CssServer } from "../servers/test-css-server";
import { IcalServer } from "../servers/test-ical-server";
import { correctConfig, getEndpoint, removeFieldsConfig } from "./common";

describe("alternate icalserver", function () {
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

  describe("TransformationStore", () => {
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
});

describe("Alternate TransformationStore", () => {
  const cssServer = new CssServer();
  const icalServer = new IcalServer();

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
        },
      ],
    };

    const result = await getEndpoint("transformation");

    expect(result).to.deep.equal(expectedResult);
  });
});
