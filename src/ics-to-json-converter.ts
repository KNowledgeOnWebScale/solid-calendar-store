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
        const data = await readableToString(representation.data);
        const events: Object[] = [];

        const jcalData = ICAL.parse(data);
        const vcalendar = new ICAL.Component(jcalData);
        const vevents = vcalendar.getAllSubcomponents('vevent');

        for (const vevent of vevents) {
            const summary = vevent.getFirstPropertyValue('summary');
            let start = vevent.getFirstPropertyValue('dtstart');
            start = new Date(start);
            let end = vevent.getFirstPropertyValue('dtend');
            end = new Date(end);

            events.push({title: summary, start, end});
        }

        return new BasicRepresentation(JSON.stringify(events), representation.metadata, outputType);
    }
}