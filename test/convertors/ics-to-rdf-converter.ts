import {
  guardedStreamFrom,
  readableToString,
  RepresentationMetadata,
} from "@solid/community-server";
import { expect } from "chai";
import { convertToJSON } from "./common";
import { AnyToRdfConverter } from "@rmlio/solid-rml-store";

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
      metadata: new RepresentationMetadata("application/json"),
      data: inputStream,
      binary: false,
    },
    preferences: {},
  });
  return await readableToString(outputStream.data);
};

describe("IcsToRdfConverter", function () {
  this.timeout(4000);

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
    <http://example.com/event/2d4bb875c6c9f10695ea238e952c6e67>;
  <http://schema.org/name> "Test for Solid calendar" .

<http://example.com/event/2d4bb875c6c9f10695ea238e952c6e67> a <http://schema.org/Event>;
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
