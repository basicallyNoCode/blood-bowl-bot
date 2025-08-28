import { MessageReaction, User } from "discord.js";
import CustomClient from "../../base/classes/CustomClient.js";
import Event from "../../base/classes/Event.js";
export default class ConfirmReactionAdded extends Event {
    constructor(client: CustomClient);
    execute(reaction: MessageReaction, user: User): Promise<void>;
}
//# sourceMappingURL=ConfirmReactionAdded.d.ts.map