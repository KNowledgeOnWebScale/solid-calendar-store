import { createHash } from "crypto";

export function hash(str: string) {
  return createHash("md5").update(str).digest("hex");
}
