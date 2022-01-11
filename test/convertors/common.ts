import {
  RepresentationMetadata,
  guardedStreamFrom,
} from "@solid/community-server";
import { IcsToJsonConverter } from "../../src/ics-to-json-converter";

/**
 *
 * @param ics - The ics formatted string to convert
 * @returns JSON presentation of the ics
 */
export const convertToJSON = async (ics: string | Iterable<any>) => {
  return await new IcsToJsonConverter().handle({
    identifier: { path: "text/calendar" },
    representation: {
      metadata: new RepresentationMetadata("text/calendar"),
      data: guardedStreamFrom(ics),
      binary: false,
      isEmpty: false
    },
    preferences: {},
  });
};
