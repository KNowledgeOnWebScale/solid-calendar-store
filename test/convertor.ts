import { expect } from "chai";
import { IcsToJsonConverter } from "../src/ics-to-json-converter";
import { JsonToRdfConverter } from "../src/json-to-rdf-converter";

import {
  guardedStreamFrom,
  RepresentationMetadata,
  readableToString,
  BadRequestHttpError,
  InternalServerError,
} from "@solid/community-server";

/**
 * Converts an input (typically JSON) to RDF and converts the stream to string
 * @param input - Input to convert to RDF
 * @returns Converted input in string format
 */
const convertToRDF = async (input: any): Promise<any> => {
  const inputStream = guardedStreamFrom(JSON.stringify(input));
  const outputStream = await new JsonToRdfConverter("./events.rml.ttl").handle({
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

describe("converters", function () {
  this.timeout(4000);

  describe("IcsToJsonConverter", () => {
    it("Verify converter on correct input", async () => {
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
DESCRIPTION:
LAST-MODIFIED:20210408T124806Z
LOCATION:
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
    });

    describe("JsonToRdfConverter", () => {
      it("Verify converter on correct input", async () => {
        const input = {
          name: "Test for Solid calendar",
          events: [
            {
              title: "Correctly converted",
              startDate: "2021-04-08T15:00:00.000Z",
              endDate: "2021-04-08T17:00:00.000Z",
            },
          ],
        };
        const expectedResult = `
<http://example.com/calendar/Test%20for%20Solid%20calendar> <http://schema.org/event>
    <http://example.com/event/Correctly%20converted>;
  <http://schema.org/name> "Test for Solid calendar" .

<http://example.com/event/Correctly%20converted> a <http://schema.org/Date>;
  <http://schema.org/endDate> "2021-04-08T17:00:00.000Z";
  <http://schema.org/name> "Correctly converted";
  <http://schema.org/startDate> "2021-04-08T15:00:00.000Z" .\n`;

        const data = await convertToRDF(input);

        expect(data).equal(expectedResult);
      });

      describe("Verify convertor on incorrect input", () => {
        it("#1 - Partially correct input shouldn't crash the convertor", async () => {
          const input = {
            name: "Test for Solid calendar",
            events: [
              {
                title: "Correctly converted",
              },
            ],
            abcdef: "0123456",
          };
          const expectedResult = `
<http://example.com/calendar/Test%20for%20Solid%20calendar> <http://schema.org/event>
    <http://example.com/event/Correctly%20converted>;
  <http://schema.org/name> "Test for Solid calendar" .

<http://example.com/event/Correctly%20converted> a <http://schema.org/Date>;
  <http://schema.org/name> "Correctly converted" .\n`;

          const data = await convertToRDF(input);

          expect(data).equal(expectedResult);
        });

        it("#2 - 500", async () => {
          const input = [{}];

          await expect(convertToRDF(input))
            .to.eventually.be.rejectedWith(
              "Could not convert the input to valid RDF"
            )
            .and.be.an.instanceOf(InternalServerError);
        });

        it("#3 - 500", async () => {
          const input = [
            {
              abcdef: "Random field",
            },
          ];

          await expect(convertToRDF(input))
            .to.eventually.be.rejectedWith(
              "Could not convert the input to valid RDF"
            )
            .and.be.an.instanceOf(InternalServerError);
        });

        it("#4 - 400", async () => {
          await expect(
            new JsonToRdfConverter("./events.rml.ttl").handle({
              identifier: { path: "json" },
              representation: {
                metadata: new RepresentationMetadata("json"),
                data: guardedStreamFrom(""),
                binary: false,
              },
              preferences: {},
            })
          )
            .to.eventually.be.rejectedWith("Empty input is not allowed")
            .and.be.an.instanceOf(BadRequestHttpError);
        });
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
DESCRIPTION:
LAST-MODIFIED:20210408T124806Z
LOCATION:
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
});
