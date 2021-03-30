import {
    BasicRepresentation,
    Conditions,
    PassthroughStore, readableToString,
    Representation,
    RepresentationPreferences,
    ResourceIdentifier
} from "@solid/community-server";

import { getAvailableSlots } from './calendar-utils';
import {HttpGetStore} from "./http-get-store";

const outputType: string = 'application/json';

export class AvailabilityStore extends PassthroughStore<HttpGetStore> {
    private readonly baseUrl: string;

    constructor(source: HttpGetStore, options: {baseUrl: string}) {
        super(source);
        this.baseUrl = options.baseUrl;
    }

    async getRepresentation(identifier: ResourceIdentifier, preferences: RepresentationPreferences, conditions?: Conditions): Promise<Representation> {
        const sourceRepresentation: Representation = await super.getRepresentation(identifier, preferences, conditions);
        const data = await readableToString(sourceRepresentation.data);
        const events = JSON.parse(data);

        events.forEach((event: {startDate: any, endDate: any }) => {
            event.startDate = new Date(event.startDate);
            event.endDate = new Date(event.endDate);
        });

        const slots = getAvailableSlots(this.baseUrl, events);

        console.log(slots);

        return new BasicRepresentation(JSON.stringify(slots), identifier, outputType);
    }
}