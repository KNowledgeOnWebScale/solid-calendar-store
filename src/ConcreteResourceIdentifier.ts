import {ResourceIdentifier} from "@solid/community-server";

export class ConcreteResourceIdentifier implements ResourceIdentifier {
  path: string;

  constructor(path: string) {
    this.path = path;
  }
}