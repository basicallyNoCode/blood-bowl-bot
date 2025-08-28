import { ChatInputCommandInteraction } from "discord.js";
import CustomClient from "../../base/classes/CustomClient.js";
import Event from "../../base/classes/Event.js";
export default class CommandHandler extends Event {
    constructor(client: CustomClient);
    execute(interaction: ChatInputCommandInteraction): void;
}
//# sourceMappingURL=CommandHandler.d.ts.map