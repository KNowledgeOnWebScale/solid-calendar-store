import {
  BaseResourceStore, BasicRepresentation, Conditions,
  readableToString, Representation,
  RepresentationPreferences,
  ResourceIdentifier
} from "@solid/community-server";
import {ConcreteResourceIdentifier} from "./concrete- resource-identifier";
const humanToMilliseconds = require('human-to-milliseconds');

export class PreGenerateStore extends BaseResourceStore {
  private latestRepresentationData: string | undefined;
  private readonly resourcePath: string;
  private readonly onlyOnce: boolean;
  private readonly duration: any;
  private readonly source: BaseResourceStore;
  private readonly preferences: object;
  private latestRepresentationDataContentType: string | undefined;

  constructor(
    source: BaseResourceStore,
    options: {
      duration?: string,
      resourcePath?: string,
      preferences?: any
    }
  ) {
    super();

    this.source = source;
    this.onlyOnce = options.duration === 'once';
    this.duration = options.duration === 'once' ? null : humanToMilliseconds(options.duration || '60s');
    this.resourcePath = options.resourcePath || '';
    this.preferences = options.preferences || {type: {"application/json": 1}};

    this._activatePreGeneration();
  }

  async getRepresentation(
    identifier: ResourceIdentifier,
    preferences: RepresentationPreferences,
    conditions?: Conditions
  ): Promise<Representation> {
    let representationData: string;
    let representationContentType: string | undefined;

    if (this.resourcePath && this.resourcePath === identifier.path && this.latestRepresentationData) {
      console.log(`Use pre-generated representation for resource "${identifier.path}".`);
      representationData = this.latestRepresentationData;
      representationContentType = this.latestRepresentationDataContentType;
    } else {
      const {data, contentType} = (await this._getLatestRepresentationData(identifier));
      representationData = data;
      representationContentType = contentType;
    }

    return new BasicRepresentation(
      representationData,
      identifier,
      representationContentType
    );
  }

  /**
   * This method actives the pre-generation of the calendar.
   * It does this only for the resource identified by this.resourcePath.
   * It regenerates the representation after the duration given by this.duration,
   * which is in milliseconds.
   */
  async _activatePreGeneration() {
    const fn = async () => {
      const {data, contentType} = await this._getLatestRepresentationData();
      this.latestRepresentationDataContentType = contentType;
      this.latestRepresentationData = data
      console.log(`Pre-generated representation for resource "${this.resourcePath}" has been updated.`);
    };

    await fn();

    if (!this.onlyOnce) {
      setInterval(fn, this.duration);
    }
  }

  async _getLatestRepresentationData(identifier?: ResourceIdentifier) {
    identifier = identifier || new ConcreteResourceIdentifier(this.resourcePath);
    const result = (await this.source.getRepresentation(identifier, this.preferences));
    const contentType = result.metadata.contentType;

    return {data: await readableToString(result.data), contentType};
  }
}