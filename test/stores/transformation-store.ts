import * as chai from "chai";
import chaiExclude from "chai-exclude";
import {CssServer} from "../servers/test-css-server";
import {IcalServer} from "../servers/test-ical-server";
import {
  transformationStoreEmptyConfig,
  getEndpoint,
  transformationStoreRemoveFieldsConfig,
  transformationStoreConfig, transformationStoreAlternateIcalServerConfig,
} from "./common";

chai.use(chaiExclude);
const {expect} = chai;

describe("TransformationStore", function () {
  this.timeout(60000);

  const cssServer = new CssServer();
  const icalServer = new IcalServer();

  describe("Default", () => {
    before(async () => {
      await cssServer.start(transformationStoreConfig);
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
      await cssServer.start(transformationStoreRemoveFieldsConfig);
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
            url: "http://example.com/"
          },
        ],
      };

      const result = await getEndpoint("transformation");

      expect(result).excludingEvery('hash').to.deep.equal(expectedResult);
    });
  });

  describe("Empty config", () => {
    before(async () => {
      await cssServer.start(transformationStoreEmptyConfig);
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
  this.timeout(60000);

  const cssServer = new CssServer();
  const icalServer = new IcalServer({isBusy: true});

  before(async () => {
    await cssServer.start(transformationStoreAlternateIcalServerConfig);
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
          location: "my room",
          url: "http://example.com/",
          title: "Busy",
        },
      ],
    };
    const result = await getEndpoint("busy");

    expect(result).excludingEvery('hash').to.deep.equal(expectedResult);
  });
});
