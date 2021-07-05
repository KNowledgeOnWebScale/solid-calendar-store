# Converters

## IcsToJsonConverter

_type: IcsToJsonConverter_

## JsonToRdfConverter

_type: JsonToRdfConverter_

Code for this convertor is hosted [here](https://gitlab.ilabt.imec.be/KNoWS/solid-store-rml).

## RdfRepresentationConverter

_type: ChainedConverter_

[![](https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggTFJcbiAgICBBW0lDU10gLS0-IHxJY3NUb0pzb25Db252ZXJ0ZXJ8QihKU09OKVxuICAgIEIgLS0-IHxKc29uVG9SZGZDb252ZXJ0ZXJ8QyhSREYpIiwibWVybWFpZCI6eyJ0aGVtZSI6ImRlZmF1bHQifSwidXBkYXRlRWRpdG9yIjpmYWxzZSwiYXV0b1N5bmMiOnRydWUsInVwZGF0ZURpYWdyYW0iOmZhbHNlfQ)](https://mermaid-js.github.io/mermaid-live-editor/edit/##eyJjb2RlIjoiZ3JhcGggTFJcbiAgICBBW0lDU10gLS0-IHxJY3NUb0pzb25Db252ZXJ0ZXJ8QihKU09OKVxuICAgIEIgLS0-IHxKc29uVG9SZGZDb252ZXJ0ZXJ8QyhSRCkiLCJtZXJtYWlkIjoie1xuICBcInRoZW1lXCI6IFwiZGVmYXVsdFwiXG59IiwidXBkYXRlRWRpdG9yIjpmYWxzZSwiYXV0b1N5bmMiOnRydWUsInVwZGF0ZURpYWdyYW0iOmZhbHNlfQ)

## RepresentationConverter

_type: WaterfallHandler_

Converts data to a representation of the requested output. (More information about representations: [page 3](https://rubenverborgh.github.io/solid-server-architecture/solid-architecture-v1-3-0.pdf))

The following converters are tried (in order) to match the requested output:

1. IndexConverter (See CSS)
2. IfNeededConverter (See CSS)
3. ContentTypeReplacer (See CSS)
4. JsonToRdfConverter
5. IcsToJsonConverter
6. RdfRepresentationConverter

This converter follows the waterfall principle, i.e. if the Indexconverter can convert to a given output type, the converter will stop and those underneath won't be tried.
