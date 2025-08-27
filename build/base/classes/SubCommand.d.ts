import { ChatInputCommandInteraction } from "discord.js";
import ISubCommand from "../interfaces/ISubCommand.js";
import CustomClient from "./CustomClient.js";
import ISubCommandOptions from "../interfaces/ISubCommandOptions.js";
export default class SubCommand implements ISubCommand {
    client: CustomClient;
    name: string;
    constructor(client: CustomClient, options: ISubCommandOptions);
    execute(interaction: ChatInputCommandInteraction): void;
}
//# sourceMappingURL=SubCommand.d.ts.map