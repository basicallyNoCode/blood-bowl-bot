import { ChatInputCommandInteraction } from "discord.js";
import Command from "../base/classes/Command.js";
import CustomClient from "../base/classes/CustomClient.js";
export default class CreateDivison extends Command {
    constructor(client: CustomClient);
    execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
//# sourceMappingURL=AddDivision.d.ts.map