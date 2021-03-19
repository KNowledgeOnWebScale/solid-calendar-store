import {BaseResourceStore, BasicRepresentation, Representation, ResourceIdentifier} from "@solid/community-server";
import fetch from 'node-fetch';
const ICAL = require('ical.js');

export class ICalendarStore extends BaseResourceStore {
    private readonly url: string;

    public constructor(options: {
        url: string;
    }) {
        super();
        this.url = options.url;
    }

    /**
     * Retrieves a JSON representation of events in the calender.
     */
    public async getRepresentation(identifier: ResourceIdentifier): Promise<Representation> {
        const response = await fetch(this.url);
        const text = await response.text();
        const jcalData = ICAL.parse(text);
        const vcalendar = new ICAL.Component(jcalData);
        const vevent = vcalendar.getFirstSubcomponent('vevent');
        const test = vevent.getFirstPropertyValue('summary');

        const rep = new BasicRepresentation(test, identifier, 'text/plain');
        return rep;
    }
}