import { expect } from "chai";
import {
  readableToString,
  BadRequestHttpError,
  InternalServerError,
} from "@solid/community-server";
import { convertToJSON } from "./common";
import fs from 'fs-extra';
import path from 'path';
import sinon from 'sinon';

describe("IcsToJsonConverter", function () {
  this.timeout(4000);

  describe("Verify converter on correct input", () => {
    it("#1", async () => {
      const expectedResult = {
        name: "Test for Solid calendar",
        events: [
          {
            title: "Correctly converted",
            startDate: "2021-04-08T15:00:00.000Z",
            endDate: "2021-04-08T17:00:00.000Z",
            description: "",
            location: "",
            url: "http://example.com"
          },
        ],
      };

      const event = await fs.readFile(path.join(__dirname, 'resources/valid-calendar.ics'), 'utf-8');

      const convertedRepresentation = await convertToJSON(event);
      const data = await readableToString(convertedRepresentation.data);
      const resultTyped = JSON.parse(data);

      expect(resultTyped).excludingEvery('hash').to.deep.equal(expectedResult);
    });

    it("#2", async () => {
      const expectedResult = {
        name: "Test for Solid calendar",
        events: [
          {
            title: "Correctly converted",
            startDate: "2021-04-08T15:00:00.000Z",
            endDate: "2021-04-08T17:00:00.000Z",
          },
        ],
      };

      const event = await fs.readFile(path.join(__dirname, 'resources/valid-calendar-2.ics'), 'utf-8');

      const convertedRepresentation = await convertToJSON(event);
      const data = await readableToString(convertedRepresentation.data);
      const resultTyped = JSON.parse(data);

      expect(resultTyped).excludingEvery('hash').to.deep.equal(expectedResult);
    });

    it("Recurring events", async () => {
      const expectedResult = await fs.readJson(path.join(__dirname, 'resources/recurring-events.json'));
      const ics = await fs.readFile(path.join(__dirname, 'resources/recurring-events.ics'), 'utf-8');
      const convertedRepresentation = await convertToJSON(ics);
      const data = await readableToString(convertedRepresentation.data);
      const resultTyped = JSON.parse(data);

      expect(resultTyped).to.deep.equal(expectedResult);
    });

    it("Recurring events - daylight saving time", async () => {
      const expectedResult = await fs.readJson(path.join(__dirname, 'resources/recurring-events-dst.json'));
      const ics = await fs.readFile(path.join(__dirname, 'resources/recurring-events-dst.ics'), 'utf-8');
      const convertedRepresentation = await convertToJSON(ics);
      const data = await readableToString(convertedRepresentation.data);
      const resultTyped = JSON.parse(data);

      expect(resultTyped).to.deep.equal(expectedResult);
    });

    it("Recurring events - daylight saving time 2", async () => {
      const expectedResult = await fs.readJson(path.join(__dirname, 'resources/recurring-events-dst-2.json'));
      const ics = await fs.readFile(path.join(__dirname, 'resources/recurring-events-dst-2.ics'), 'utf-8');
      const convertedRepresentation = await convertToJSON(ics);
      const data = await readableToString(convertedRepresentation.data);
      const resultTyped = JSON.parse(data);

      expect(resultTyped).to.deep.equal(expectedResult);
    });

    it("Recurring events - change one recurrence", async () => {
      const expectedResult = await fs.readJson(path.join(__dirname, 'resources/recurring-events-change-one-recurrence.json'));
      const ics = await fs.readFile(path.join(__dirname, 'resources/recurring-events-change-one-recurrence.ics'), 'utf-8');
      const convertedRepresentation = await convertToJSON(ics);
      const data = await readableToString(convertedRepresentation.data);
      const resultTyped = JSON.parse(data);

      expect(resultTyped).to.deep.equal(expectedResult);
    });

    it("Remove Apple location fields", async () => {
      const expectedResult = await fs.readJson(path.join(__dirname, 'resources/valid-calendar-with-apple-location.json'));
      const events = await fs.readFile(path.join(__dirname, 'resources/valid-calendar-with-apple-location.ics'), 'utf-8');

      const convertedRepresentation = await convertToJSON(events, {removeAppleLocation: true});
      const data = await readableToString(convertedRepresentation.data);
      const resultTyped = JSON.parse(data);
      console.log(resultTyped);

      expect(resultTyped).excludingEvery('hash').to.deep.equal(expectedResult);
    });

    it("Remove Apple location fields: \\r\\n" , async () => {
      const expectedResult = await fs.readJson(path.join(__dirname, 'resources/valid-calendar-with-apple-location.json'));
      let events = await fs.readFile(path.join(__dirname, 'resources/valid-calendar-with-apple-location.ics'), 'utf-8');
      events = events.replace(/\n/g, '\r\n');

      const convertedRepresentation = await convertToJSON(events, {removeAppleLocation: true});
      const data = await readableToString(convertedRepresentation.data);
      const resultTyped = JSON.parse(data);
      console.log(resultTyped);

      expect(resultTyped).excludingEvery('hash').to.deep.equal(expectedResult);
    });
  });

  describe('Standard output', () => {
    const consoleWarnStub = sinon.stub(console, 'warn');

    it('Warn when no summary for event', async () => {
      const event = await fs.readFile(path.join(__dirname, 'resources/no-summary.ics'), 'utf-8');
      await convertToJSON(event);

      expect(consoleWarnStub.withArgs(`Encountered event without summary/title in calendar "Test for Solid calendar".`).callCount ).to.equal(1);
    });
  });

  describe("Verify converter on incorrect input", () => {
    it("#1", async () => {
      const event = await fs.readFile(path.join(__dirname, 'resources/invalid-body.ics'), 'utf-8');

      await expect(convertToJSON(event))
        .to.eventually.be.rejectedWith(
          "invalid ical body. component began but did not end"
        )
        .and.be.an.instanceOf(Error);
    });

    it("#2 - 500", async () => {
      const event = await fs.readFile(path.join(__dirname, 'resources/no-calendar-name.ics'), 'utf-8');

      await expect(convertToJSON(event))
        .to.eventually.be.rejectedWith("No calendar name found")
        .and.be.an.instanceOf(InternalServerError);
    });

    it("#3 - 400", async () => {
      await expect(convertToJSON(""))
        .to.eventually.be.rejectedWith("Empty input is not allowed")
        .and.be.an.instanceOf(BadRequestHttpError);
    });

    it("#4 - 500", async () => {
      const event = await fs.readFile(path.join(__dirname, 'resources/empty-calendar-name.ics'), 'utf-8');

      await expect(convertToJSON(event))
        .to.eventually.be.rejectedWith("No calendar name found")
        .and.be.an.instanceOf(InternalServerError);
    });

    it("#5 - 500", async () => {
      const event = await fs.readFile(path.join(__dirname, 'resources/no-dtstart.ics'), 'utf-8');

      await expect(convertToJSON(event))
        .to.eventually.be.rejectedWith("Dtstart needs to be provided")
        .and.be.an.instanceOf(BadRequestHttpError);
    });
  });
});
