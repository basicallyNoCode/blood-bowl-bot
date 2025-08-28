import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import CustomClient from "../classes/CustomClient.js";
import Category from "../enums/Category.js";
export default interface ICommand {
    client: CustomClient;
    name: string;
    description: string;
    category: Category;
    options: object;
    default_member_permissions: bigint;
    dm_permession: boolean;
    cooldown: number;
    execute(interaction: ChatInputCommandInteraction): void;
    autocomplete(interaction: AutocompleteInteraction): void;
}
//# sourceMappingURL=ICommand.d.ts.map