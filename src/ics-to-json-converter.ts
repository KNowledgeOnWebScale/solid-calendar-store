import {
    BasicRepresentation, readableToString,
    Representation, RepresentationConverterArgs, transformSafely,
    TypedRepresentationConverter
} from "@solid/community-server";

const ICAL = require('ical.js');
const outputType = 'application/json';

export class IcsToJsonConverter extends TypedRepresentationConverter {

    public constructor() {
        super('text/calendar', outputType);
    }

    public async handle({ identifier, representation }: RepresentationConverterArgs): Promise<Representation> {
        const data = await readableToString(representation.data)

        const jcalData = ICAL.parse(data);
        const vcalendar = new ICAL.Component(jcalData);
        const vevent = vcalendar.getFirstSubcomponent('vevent');
        const data2 = vevent.getFirstPropertyValue('summary');

        return new BasicRepresentation(data2, representation.metadata, outputType);
    }
}