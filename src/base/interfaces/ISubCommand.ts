import { ChatInputCommandInteraction } from "discord.js";
import CustomClient from "../classes/CustomClient.js";

export default interface ISubCommand {
    client: CustomClient,
    name: string;

    execute(interaction: ChatInputCommandInteraction): void;
}