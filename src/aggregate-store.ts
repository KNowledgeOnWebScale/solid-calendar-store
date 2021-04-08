import {
    BaseResourceStore,
    BasicRepresentation,
    readableToString,
    Representation, RepresentationConvertingStore,
    ResourceIdentifier
} from "@solid/community-server";

const outputType = 'application/json';

export class AggregateStore extends BaseResourceStore {
    private source1: RepresentationConvertingStore;
    private source2: RepresentationConvertingStore;

    constructor(source1: RepresentationConvertingStore, source2: RepresentationConvertingStore) {
        super();

        this.source1 = source1;
        this.source2 = source2;
    }

    public async getRepresentation(identifier: ResourceIdentifier): Promise<Representation> {
        const events1 = await this._getJson(this.source1, identifier);
        const events2 = await this._getJson(this.source2, identifier);

        const allEvents = events1.concat(events2);

        return new BasicRepresentation(JSON.stringify(allEvents), outputType);
    }

    async _getJson(source: RepresentationConvertingStore, identifier: ResourceIdentifier) {
        const sourceRepresentation: Representation = await source.getRepresentation(identifier, {type: { 'application/json': 1 }});
        const data = await readableToString(sourceRepresentation.data);
        return JSON.parse(data);
    }
}