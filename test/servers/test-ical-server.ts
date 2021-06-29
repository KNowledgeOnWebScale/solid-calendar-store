import ical from "ical-generator";
import http from "http";

// An example event
const event = {
  start: "Wed Jun 16 2021 12:00:10 GMT+0200",
  end: "Wed Jun 16 2021 12:00:13 GMT+0200",
  summary: "Example Event",
  description: "It works ;)",
  location: "my room",
  url: "http://sebbo.net/",
};

// An example available event
const availableEvent = {
  start: "Wed Jun 16 2021 12:00:10 GMT+0200",
  end: "Wed Jun 16 2021 12:00:13 GMT+0200",
  summary: "+ Available Event",
  description: "It works ;)",
  location: "my room",
  url: "http://sebbo.net/",
};

// An example busy event
const busyEvent = {
  start: "Wed Jun 16 2021 12:00:10 GMT+0200",
  end: "Wed Jun 16 2021 12:00:13 GMT+0200",
  summary: "* Busy Event",
  description: "It works ;)",
  location: "my room",
  url: "http://sebbo.net/",
};

// Represents an ICal server
export class IcalServer {
  // An empty calendar, with the title: 'my first iCal'
  private calendar = ical({ name: "my first iCal" });

  private icalServer = http.createServer((req, res) =>
    this.calendar.serve(res)
  );

  /**
   * The calendar only has 1 event to make testing easier.
   * @param isBusy - Indicates whether the calendar should be initialised with a plain example event, or a busy example event
   */
  constructor(isBusy: boolean = false, noEvents: boolean = false) {
    if (!noEvents) {
      this.calendar.createEvent(event);

      if (isBusy) {
        this.calendar.createEvent(availableEvent);
        this.calendar.createEvent(busyEvent);
      }
    }
  }

  // The server starts on localhost on port 3001
  public start() {
    this.icalServer.listen(3001, "127.0.0.1");
  }

  public stop() {
    this.icalServer.close();
  }
}
