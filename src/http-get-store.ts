import {BaseResourceStore, BasicRepresentation, Representation, ResourceIdentifier} from "@solid/community-server";
import fetch from 'node-fetch';

export class HttpGetStore extends BaseResourceStore {
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
        const contentType = response.headers.get('content-type') || 'text/plain';

        return new BasicRepresentation(text, identifier, 'text/calendar');
    }
}