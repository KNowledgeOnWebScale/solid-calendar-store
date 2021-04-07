import {
    BasicRepresentation,
    Conditions,
    PassthroughStore, readableToString,
    Representation,
    RepresentationPreferences,
    ResourceIdentifier
} from "@solid/community-server";

import { getAvailableSlots } from './calendar-utils';
import {HttpGetStore} from "./http-get-store";
import yaml from 'js-yaml';
import fs from 'fs-extra';
import path from 'path';

const outputType: string = 'application/json';

export class AvailabilityStore extends PassthroughStore<HttpGetStore> {
    private readonly baseUrl: string;
    private availabilitySlots: [];
    private readonly settingsPath: string;
    private minimumSlotDuration: number;

    constructor(source: HttpGetStore, options: {baseUrl: string, settingsPath: string}) {
        super(source);
        this.baseUrl = options.baseUrl;
        this.settingsPath = options.settingsPath;
        this.availabilitySlots = [];
        this.minimumSlotDuration = 30;
        this._getSettings();
    }

    async getRepresentation(identifier: ResourceIdentifier, preferences: RepresentationPreferences, conditions?: Conditions): Promise<Representation> {
        const sourceRepresentation: Representation = await super.getRepresentation(identifier, {type: { 'application/json': 1 }}, conditions);
        const data = await readableToString(sourceRepresentation.data);
        const events = JSON.parse(data);

        events.forEach((event: {startDate: any, endDate: any }) => {
            event.startDate = new Date(event.startDate);
            event.endDate = new Date(event.endDate);
        });

        const slots = getAvailableSlots(this.baseUrl, events, this.availabilitySlots, this.minimumSlotDuration);

        console.log(slots);

        return new BasicRepresentation(JSON.stringify(slots), identifier, outputType);
    }

    async _getSettings() {
        // @ts-ignore
        const {availabilitySlots, minimumSlotDuration} = yaml.load(await fs.readFile(path.resolve(process.cwd(), this.settingsPath), 'utf8'));
        this.availabilitySlots = availabilitySlots ? availabilitySlots : this.availabilitySlots;
        this.minimumSlotDuration = minimumSlotDuration ? minimumSlotDuration : this.minimumSlotDuration;
    }
}