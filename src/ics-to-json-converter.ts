import {
    BasicRepresentation,
    Representation, RepresentationConverterArgs,
    TypedRepresentationConverter
} from "@solid/community-server";

const ICAL = require('ical.js');
const outputType = 'application/json';

export class IcsToJsonConverter extends TypedRepresentationConverter {

    public constructor() {
        super('text/calendar', outputType);
    }

    public async handle({ identifier, representation }: RepresentationConverterArgs): Promise<Representation> {
        const jcalData = ICAL.parse(representation.data);
        const vcalendar = new ICAL.Component(jcalData);
        const vevent = vcalendar.getFirstSubcomponent('vevent');
        const data = vevent.getFirstPropertyValue('summary');

        return new BasicRepresentation(data, representation.metadata, outputType);
    }
}