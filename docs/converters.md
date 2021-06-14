# Converters

## IcsToJsonConverter

_type: IcsToJsonConverter_

## JsonToRdfConverter

_type: JsonToRdfConverter_

## RdfRepresentationConverter

_type: ChainedConverter_

[![](https://mermaid.ink/img/eyJjb2RlIjoiZ3JhcGggTFJcbiAgICBBW0lDU10gLS0-IHxJY3NUb0pzb25Db252ZXJ0ZXJ8QihKU09OKVxuICAgIEIgLS0-IHxKc29uVG9SZGZDb252ZXJ0ZXJ8QyhSREYpIiwibWVybWFpZCI6eyJ0aGVtZSI6ImRlZmF1bHQifSwidXBkYXRlRWRpdG9yIjpmYWxzZSwiYXV0b1N5bmMiOnRydWUsInVwZGF0ZURpYWdyYW0iOmZhbHNlfQ)](https://mermaid-js.github.io/mermaid-live-editor/edit/##eyJjb2RlIjoiZ3JhcGggTFJcbiAgICBBW0lDU10gLS0-IHxJY3NUb0pzb25Db252ZXJ0ZXJ8QihKU09OKVxuICAgIEIgLS0-IHxKc29uVG9SZGZDb252ZXJ0ZXJ8QyhSRCkiLCJtZXJtYWlkIjoie1xuICBcInRoZW1lXCI6IFwiZGVmYXVsdFwiXG59IiwidXBkYXRlRWRpdG9yIjpmYWxzZSwiYXV0b1N5bmMiOnRydWUsInVwZGF0ZURpYWdyYW0iOmZhbHNlfQ)

## RepresentationConverter

_type: WaterfallHandler_

Handles data, using a handler, to transform it to a representation. (More information about representations: [page 3](https://rubenverborgh.github.io/solid-server-architecture/solid-architecture-v1-3-0.pdf))

The following converters are tried (in order):

1. IndexConverter (CSS)
2. IfNeededConverter (CSS)
3. ContentTypeReplacer (CSS)
4. JsonToRdfConverter
5. IcsToJsonConverter
6. RdfRepresentationConverter
