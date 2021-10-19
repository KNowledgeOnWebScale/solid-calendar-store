import {
  BaseResourceStore,
  BasicRepresentation,
  Representation,
  ResourceIdentifier,
} from "@solid/community-server";
import {RepresentationPreferences} from "@solid/community-server/dist/ldp/representation/RepresentationPreferences";
import fs from "fs-extra";
import {google, Common} from "googleapis";
import {Event} from './event';

/**
 * Fetches the resource at an URL
 */
export class GoogleCalendarGetStore extends BaseResourceStore {
  private readonly SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
  private readonly TOKEN_PATH = 'token.json';
  // @ts-ignore
  private oAuth2Client: Common.OAuth2Client;
  private calendarId: string;
  private amountOfDays: number;

  public constructor(options : {calendarId: string, amountOfDays: number}) {
    super();

    this.calendarId = options.calendarId;
    this.amountOfDays = options.amountOfDays;
  }

  /**
   * Retrieves a JSON representation of events in the calender.
   */
  public async getRepresentation(
    identifier: ResourceIdentifier,
    preferences: RepresentationPreferences
  ): Promise<Representation> {
    let contentType = "application/json";

    if (!this.oAuth2Client) {
      await this.setUpClient();
    }

    const events = await this.getEvents(this.oAuth2Client);

    return new BasicRepresentation(JSON.stringify(events), identifier, contentType);
  }

  private async setUpClient() {
    const credentials = await fs.readJSON('credentials.json');
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    this.oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

    // Load client secrets from a local file.
    try {
      const tokens = await fs.readJSON(this.TOKEN_PATH);
      // Authorize a client with credentials, then call the Google Calendar API.
      this.oAuth2Client.setCredentials(tokens);
    } catch (err) {
      return console.log('Error loading client secret file:', err);
    }
  }

  private async getEvents(client: Common.OAuth2Client) {
    const calendar = google.calendar({version: 'v3', auth: client});
    try {
      const timeMax = new Date();
      timeMax.setDate(timeMax.getDate() + this.amountOfDays);

      const res = await calendar.events.list({
        calendarId: this.calendarId,
        timeMin: (new Date()).toISOString(),
        singleEvents: true,
        timeMax: timeMax.toISOString(),
        orderBy: 'startTime',
      });

      const events = res.data.items;
      const results: Event[] = [];

      if (events?.length) {
        events.forEach(event => {
          // @ts-ignore
          const start: string = event?.start?.dateTime || event?.start?.date;
          // @ts-ignore
          const end: string = event?.end?.dateTime || event?.end?.date;
          results.push({
            endDate: new Date(end),
            startDate: new Date(start),
            title: event.summary || ''
          });
        });
      } else {
        console.log('No upcoming events found.');
      }

      return results;
    } catch (err) {
      return console.log('The API returned an error: ' + err);
    }
  }
}
