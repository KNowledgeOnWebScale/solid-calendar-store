import { expect } from "chai";
import { IcsToJsonConverter } from "../src/ics-to-json-converter";
import { JsonToIcsConverter } from "../src/json-to-ics-converter";

import {
  guardedStreamFrom,
  RepresentationMetadata,
  readableToString,
  BadRequestHttpError,
  InternalServerError,
} from "@solid/community-server";
import { AnyToRdfConverter } from "solid-store-rml";

/**
 * Converts an input (typically JSON) to RDF and converts the stream to string
 * @param input - Input to convert to RDF
 * @returns Converted input in string format
 */
const convertToRDF = async (input: any): Promise<any> => {
  const inputStream = guardedStreamFrom(JSON.stringify(input));
  const outputStream = await new AnyToRdfConverter(
    "./events.rml.ttl",
    "./rmlmapper.jar"
  ).handle({
    identifier: { path: "json" },
    representation: {
      metadata: new RepresentationMetadata("json"),
      data: inputStream,
      binary: false,
    },
    preferences: {},
  });
  return await readableToString(outputStream.data);
};

/**
 *
 * @param ics - The ics formatted string to convert
 * @returns JSON presentation of the ics
 */
const convertToJSON = async (ics: string | Iterable<any>) => {
  return await new IcsToJsonConverter().handle({
    identifier: { path: "text/calendar" },
    representation: {
      metadata: new RepresentationMetadata("text/calendar"),
      data: guardedStreamFrom(ics),
      binary: false,
    },
    preferences: {},
  });
};

const convertToIcs = async (input: object) => {
  const inputStream = guardedStreamFrom(JSON.stringify(input));
  return await new JsonToIcsConverter().handle({
    identifier: { path: "text/calendar" },
    representation: {
      metadata: new RepresentationMetadata("text/calendar"),
      data: inputStream,
      binary: false,
    },
    preferences: {},
  });
};

describe("converters", function () {
  this.timeout(4000);

  describe("IcsToJsonConverter", () => {
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
              url: "http://example.com",
            },
          ],
        };

        const event = `BEGIN:VCALENDAR
PRODID:-//Google Inc//Google Calendar 70.9054//EN
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Test for Solid calendar
X-WR-TIMEZONE:Europe/Brussels
BEGIN:VEVENT
DTSTART:20210408T150000Z
DTEND:20210408T170000Z
DTSTAMP:20210618T121947Z
UID:04jkkr8hoj6jdcc5ikrrhk2c5o@google.com
CREATED:20210408T124806Z
DESCRIPTION:
LAST-MODIFIED:20210408T124806Z
LOCATION:
URL:http://example.com
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:Correctly converted
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;

        const convertedRepresentation = await convertToJSON(event);
        const data = await readableToString(convertedRepresentation.data);
        const resultTyped = JSON.parse(data);

        expect(resultTyped).to.deep.equal(expectedResult);
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

        const event = `BEGIN:VCALENDAR
PRODID:-//Google Inc//Google Calendar 70.9054//EN
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Test for Solid calendar
X-WR-TIMEZONE:Europe/Brussels
BEGIN:VEVENT
DTSTART:20210408T150000Z
DTEND:20210408T170000Z
DTSTAMP:20210618T121947Z
UID:04jkkr8hoj6jdcc5ikrrhk2c5o@google.com
CREATED:20210408T124806Z
LAST-MODIFIED:20210408T124806Z
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:Correctly converted
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;

        const convertedRepresentation = await convertToJSON(event);
        const data = await readableToString(convertedRepresentation.data);
        const resultTyped = JSON.parse(data);

        expect(resultTyped).to.deep.equal(expectedResult);
      });
    });

    describe("Verify converter on incorrect input", () => {
      it("#1", async () => {
        const event = `BEGIN:VCALENDAR
PRODID:-//Google Inc//Google Calendar 70.9054//EN
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Test for Solid calendar
X-WR-TIMEZONE:Europe/Brussels
BEGIN:VEVENT
DTSTART:20210408T150000Z
DTEND:20210408T170000Z
DTSTAMP:20210618T121947Z
UID:04jkkr8hoj6jdcc5ikrrhk2c5o@google.com
CREATED:20210408T124806Z
DESCRIPTION:
LAST-MODIFIED:20210408T124806Z
LOCATION:
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:Correctly converted
TRANSP:OPAQUE
END:VEVENT`;

        await expect(convertToJSON(event))
          .to.eventually.be.rejectedWith(
            "invalid ical body. component began but did not end"
          )
          .and.be.an.instanceOf(Error);
      });

      it("#2 - 500", async () => {
        const event = `BEGIN:VEVENT
DTSTART:20210408T150000Z
DTEND:20210408T170000Z
DTSTAMP:20210618T121947Z
UID:04jkkr8hoj6jdcc5ikrrhk2c5o@google.com
CREATED:20210408T124806Z
DESCRIPTION:
LAST-MODIFIED:20210408T124806Z
LOCATION:
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:Correctly converted
TRANSP:OPAQUE
END:VEVENT`;

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
        const event = `BEGIN:VCALENDAR
PRODID:-//Google Inc//Google Calendar 70.9054//EN
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:
X-WR-TIMEZONE:Europe/Brussels
BEGIN:VEVENT
DTSTART:20210408T150000Z
DTEND:20210408T170000Z
DTSTAMP:20210618T121947Z
UID:04jkkr8hoj6jdcc5ikrrhk2c5o@google.com
CREATED:20210408T124806Z
DESCRIPTION:
LAST-MODIFIED:20210408T124806Z
LOCATION:
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:Correctly converted
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;

        await expect(convertToJSON(event))
          .to.eventually.be.rejectedWith("No calendar name found")
          .and.be.an.instanceOf(InternalServerError);
      });

      it("#5 - 500", async () => {
        const event_1 = `BEGIN:VCALENDAR
PRODID:-//Google Inc//Google Calendar 70.9054//EN
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Test for Solid calendar
X-WR-TIMEZONE:Europe/Brussels
BEGIN:VEVENT
DTSTART:20210408T150000Z
DTEND:20210408T170000Z
DTSTAMP:20210618T121947Z
UID:04jkkr8hoj6jdcc5ikrrhk2c5o@google.com
CREATED:20210408T124806Z
LAST-MODIFIED:20210408T124806Z
SEQUENCE:0
STATUS:CONFIRMED
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;

        await expect(convertToJSON(event_1))
          .to.eventually.be.rejectedWith("Summary needs to be provided")
          .and.be.an.instanceOf(BadRequestHttpError);

        const event_2 = `BEGIN:VCALENDAR
PRODID:-//Google Inc//Google Calendar 70.9054//EN
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Test for Solid calendar
X-WR-TIMEZONE:Europe/Brussels
BEGIN:VEVENT
DTEND:20210408T170000Z
DTSTAMP:20210618T121947Z
UID:04jkkr8hoj6jdcc5ikrrhk2c5o@google.com
CREATED:20210408T124806Z
LAST-MODIFIED:20210408T124806Z
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:Correctly converted
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;

        await expect(convertToJSON(event_2))
          .to.eventually.be.rejectedWith("Dtstart needs to be provided")
          .and.be.an.instanceOf(BadRequestHttpError);
      });
    });
  });

  describe("IcsToRdfConverter", () => {
    it("Verify that the chain of conversions works", async () => {
      const event = `BEGIN:VCALENDAR
PRODID:-//Google Inc//Google Calendar 70.9054//EN
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Test for Solid calendar
X-WR-TIMEZONE:Europe/Brussels
BEGIN:VEVENT
DTSTART:20210408T150000Z
DTEND:20210408T170000Z
DTSTAMP:20210618T121947Z
UID:04jkkr8hoj6jdcc5ikrrhk2c5o@google.com
CREATED:20210408T124806Z
LAST-MODIFIED:20210408T124806Z
SEQUENCE:0
STATUS:CONFIRMED
SUMMARY:Correctly converted
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;

      const expectedResult = `
<http://example.com/calendar/Test%20for%20Solid%20calendar> <http://schema.org/event>
    <http://example.com/event/Correctly%20converted>;
  <http://schema.org/name> "Test for Solid calendar" .

<http://example.com/event/Correctly%20converted> a <http://schema.org/Date>;
  <http://schema.org/endDate> "2021-04-08T17:00:00.000Z";
  <http://schema.org/name> "Correctly converted";
  <http://schema.org/startDate> "2021-04-08T15:00:00.000Z" .\n`;

      const convertedRepresentation = await convertToJSON(event);
      const data = await readableToString(convertedRepresentation.data);
      const resultJSON = JSON.parse(data);

      const resultRDF = await convertToRDF(resultJSON);

      expect(resultRDF).equal(expectedResult);
    });
  });

  describe("JsonToIcsConverter", () => {
    describe("Verify converter on correct input", () => {
      it("#1", async () => {
        const event = {
          name: "Test for Solid calendar",
          events: [
            {
              title: "Correctly converted",
              startDate: "2021-04-08T15:00:00.000Z",
              endDate: "2021-04-08T17:00:00.000Z",
            },
          ],
        };

        const convertedRepresentation = await convertToIcs(event);
        const dataIcs = await readableToString(convertedRepresentation.data);
        const result = await convertToJSON(dataIcs);
        const dataJson = await readableToString(result.data);
        const resultTyped = JSON.parse(dataJson);

        expect(resultTyped).to.deep.equal(event);
      });

      it("#2", async () => {
        const event = {
          name: "Test for Solid calendar",
          events: [
            {
              title: "Correctly converted",
              startDate: "2021-04-08T15:00:00.000Z",
              endDate: "2021-04-08T17:00:00.000Z",
              description: "An event",
              location: "My room",
              url: "http://example.com",
            },
          ],
        };

        const convertedRepresentation = await convertToIcs(event);
        const dataIcs = await readableToString(convertedRepresentation.data);
        const result = await convertToJSON(dataIcs);
        const dataJson = await readableToString(result.data);
        const resultTyped = JSON.parse(dataJson);

        expect(resultTyped).to.deep.equal(event);
      });
    });

    describe("Verify converter on incorrect input", () => {
      it("#1 - 400", async () => {
        const event = {
          events: [
            {
              title: "Correctly converted",
              startDate: "2021-04-08T15:00:00.000Z",
              endDate: "2021-04-08T17:00:00.000Z",
            },
          ],
        };

        await expect(convertToIcs(event))
          .to.eventually.be.rejectedWith("Calendar name needs to be provided")
          .and.be.an.instanceOf(BadRequestHttpError);
      });

      it("#2 - 400", async () => {
        const event_1 = {
          name: "Test for Solid calendar",
          events: [
            {
              startDate: "2021-04-08T15:00:00.000Z",
              endDate: "2021-04-08T17:00:00.000Z",
            },
          ],
        };

        await expect(convertToIcs(event_1))
          .to.eventually.be.rejectedWith(
            "Each event needs a title to be provided"
          )
          .and.be.an.instanceOf(BadRequestHttpError);

        const event_2 = {
          name: "Test for Solid calendar",
          events: [
            {
              title: "Correctly converted",
              endDate: "2021-04-08T17:00:00.000Z",
            },
          ],
        };

        await expect(convertToIcs(event_2))
          .to.eventually.be.rejectedWith(
            "Each event needs a startDate to be provided"
          )
          .and.be.an.instanceOf(BadRequestHttpError);

        const event_3 = {
          name: "Test for Solid calendar",
          events: [
            {
              startDate: "2021-04-08T15:00:00.000Z",
              title: "Correctly converted",
            },
          ],
        };

        await expect(convertToIcs(event_3))
          .to.eventually.be.rejectedWith(
            "Each event needs an endDate to be provided"
          )
          .and.be.an.instanceOf(BadRequestHttpError);
      });
    });
  });
});
