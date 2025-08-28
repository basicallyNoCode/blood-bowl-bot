import { Events } from "discord.js";
import IEvent from "../interfaces/IEvent.js";
import CustomClient from "./CustomClient.js";
import IEventOptions from "../interfaces/IEventOptions.js";
export default class Event implements IEvent {
    client: CustomClient;
    name: Events;
    description: string;
    once: boolean;
    constructor(client: CustomClient, options: IEventOptions);
    execute(...args: any): void;
}
//# sourceMappingURL=Event.d.ts.map