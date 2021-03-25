import {
    BasicRepresentation, readableToString,
    Representation, RepresentationConverterArgs, transformSafely,
    TypedRepresentationConverter
} from "@solid/community-server";
import fetch from "node-fetch";

const fs = require('fs-extra');
const RMLMapperWrapper = require('@rmlio/rmlmapper-java-wrapper');
const outputType = 'text/turtle';

export class JsonToRdfConverter extends TypedRepresentationConverter {
    private rmlRulesPath: string;

    public constructor(rmlRulesPath: string) {
        super('application/json', outputType);

        this.rmlRulesPath = rmlRulesPath;
    }

    public async handle({ identifier, representation }: RepresentationConverterArgs): Promise<Representation> {
        const data = await readableToString(representation.data);
        const rml = await fs.readFile(this.rmlRulesPath, 'utf-8');

        const wrapper = new RMLMapperWrapper('./rmlmapper.jar', './tmp', true);
        const result = await wrapper.execute(rml, {sources: {'data.json': data}, generateMetadata: false, serialization: 'turtle'});

        return new BasicRepresentation(result.output, representation.metadata, outputType);
    }
}