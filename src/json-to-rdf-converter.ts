import {
    BasicRepresentation, readableToString,
    Representation, RepresentationConverterArgs, transformSafely,
    TypedRepresentationConverter
} from "@solid/community-server";
import fetch from "node-fetch";

const fs = require('fs-extra');
const outputType = 'application/json';

const RMLMAPPER_WEB_API = 'https://tw06v069.ugent.be/rmlmapper/execute';

export class JsonToRdfConverter extends TypedRepresentationConverter {
    private rmlRulesPath: string;

    public constructor(rmlRulesPath: string) {
        super('application/json', outputType);

        this.rmlRulesPath = rmlRulesPath;
    }

    public async handle({ identifier, representation }: RepresentationConverterArgs): Promise<Representation> {
        const data = await readableToString(representation.data);
        const rml = await fs.readFile(this.rmlRulesPath, 'utf-8');
        const body = {
            rml,
            sources: {'data.json': data}
        };

        const response = await fetch(RMLMAPPER_WEB_API, {
            method: 'POST',
            body: JSON.stringify(body)
        });

        return new BasicRepresentation('', representation.metadata, outputType);
    }
}