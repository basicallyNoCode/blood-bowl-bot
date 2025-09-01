import { AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import Command from "../base/classes/Command.js";
import CustomClient from "../base/classes/CustomClient.js";
export default class AddAttendend extends Command {
    constructor(client: CustomClient);
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
    autocomplete(interaction: AutocompleteInteraction): Promise<void>;
}
//# sourceMappingURL=Standings.d.ts.map