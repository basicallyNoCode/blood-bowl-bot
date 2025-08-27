import { Events } from "discord.js";
import IEvent from "../interfaces/IEvent.js";
import CustomClient from "./CustomClient.js";
import IEventOptions from "../interfaces/IEventOptions.js";

export default class Event implements IEvent{
    client: CustomClient;
    name: Events;
    description: string;
    once: boolean;

    constructor(client: CustomClient, options: IEventOptions){
        this.client = client;
        this.name = options.name;
        this.description = options.description;
        this.once = options.once;
    }

    execute(...args:any):void{};
}