import { Events } from "discord.js";
import CustomClient from "../classes/CustomClient.js";

export default interface IEvent {
    client : CustomClient;
    name: Events;
    description: string;
    once:boolean;

}