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
            let startDate = vevent.getFirstPropertyValue('dtstart');
            startDate = new Date(startDate);
            let endDate = vevent.getFirstPropertyValue('dtend');
            endDate = new Date(endDate);

            events.push({title: summary, startDate, endDate});
        }

        return new BasicRepresentation(JSON.stringify(events), representation.metadata, outputType);
    }
}