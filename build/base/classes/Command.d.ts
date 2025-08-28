import { ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";
import Category from "../enums/Category.js";
import ICommand from "../interfaces/ICommand.js";
import CustomClient from "./CustomClient.js";
import ICommandOptions from "../interfaces/ICommandOptions.js";
export default class Command implements ICommand {
    client: CustomClient;
    name: string;
    description: string;
    category: Category;
    options: object;
    default_member_permissions: bigint;
    dm_permession: boolean;
    cooldown: number;
    constructor(client: CustomClient, options: ICommandOptions);
    execute(interaction: ChatInputCommandInteraction): void;
    autocomplete(interaction: AutocompleteInteraction): void;
}
//# sourceMappingURL=Command.d.ts.map