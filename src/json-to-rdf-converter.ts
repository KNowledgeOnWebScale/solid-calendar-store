import {
  BadRequestHttpError,
  BasicRepresentation,
  InternalServerError,
  readableToString,
  Representation,
  RepresentationConverterArgs,
  TypedRepresentationConverter,
} from "@solid/community-server";
import fs from "fs-extra";

const RMLMapperWrapper = require("@rmlio/rmlmapper-java-wrapper");
const outputType = "text/turtle";

export class JsonToRdfConverter extends TypedRepresentationConverter {
  private rmlRulesPath: string;

  public constructor(rmlRulesPath: string) {
    super("application/json", outputType);

    this.rmlRulesPath = rmlRulesPath;
  }

  public async handle({
    identifier,
    representation,
  }: RepresentationConverterArgs): Promise<Representation> {
    const data = await readableToString(representation.data);

    if (!data.trim().length)
      throw new BadRequestHttpError("Empty input is not allowed");

    const rml = await fs.readFile(this.rmlRulesPath, "utf-8");

    const wrapper = new RMLMapperWrapper("./rmlmapper.jar", "./tmp", true);
    const result = await wrapper.execute(rml, {
      sources: { "data.json": data },
      generateMetadata: false,
      serialization: "turtle",
    });

    if (!result.output.trim().length)
      throw new InternalServerError("Could not convert the input to valid RDF");

    return new BasicRepresentation(
      result.output,
      representation.metadata,
      outputType
    );
  }
}
