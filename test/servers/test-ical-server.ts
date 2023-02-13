import ical from "ical-generator";
import http from "http";

// An example event
const event = {
  start: "Wed Jun 16 2021 12:00:10 GMT+0200",
  end: "Wed Jun 16 2021 12:00:13 GMT+0200",
  summary: "Example Event",
  description: "It works ;)",
  location: "my room",
  url: "http://example.com/",
};

// An example available event
const availableEvent = {
  start: "Wed Jun 16 2021 12:00:10 GMT+0200",
  end: "Wed Jun 16 2021 12:00:13 GMT+0200",
  summary: "+ Available Event",
  description: "It works ;)",
  location: "my room",
  url: "http://example.com/",
};

// An example busy event
const busyEvent = {
  start: "Wed Jun 16 2021 12:00:10 GMT+0200",
  end: "Wed Jun 16 2021 12:00:13 GMT+0200",
  summary: "* Busy Event",
  description: "It works ;)",
  location: "my room",
  url: "http://example.com/",
};

// Represents an ICal server
export class IcalServer {
  // An empty calendar, with the title: 'my first iCal'
  private calendar = ical({ name: "my first iCal" });

  private icalServer = http.createServer((req, res) =>
    this.calendar.serve(res)
  );

  /**
   * @param options
   */
  constructor(options : {isBusy?: boolean, noEvents?: boolean, events?: {}[]} = {isBusy: false, noEvents: false, events: []}) {
    if (options.events && options.events.length > 0) {
      options.events.forEach(event => {
        this.calendar.createEvent(event);
      });
    } else if (!options.noEvents) {
      this.calendar.createEvent(event);

      if (options.isBusy) {
        this.calendar.createEvent(availableEvent);
        this.calendar.createEvent(busyEvent);
      }
    }
  }

  // The server starts on localhost on port 3001
  public start() {
      this.icalServer.listen(3001, "localhost");
  }

  public stop() {
    this.icalServer.close();
  }
}
