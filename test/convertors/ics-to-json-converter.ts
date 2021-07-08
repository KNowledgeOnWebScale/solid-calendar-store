import { expect } from "chai";
import {
  readableToString,
  BadRequestHttpError,
  InternalServerError,
} from "@solid/community-server";
import { convertToJSON } from "./common";

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
