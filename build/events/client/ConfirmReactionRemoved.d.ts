import { MessageReaction, User } from "discord.js";
import CustomClient from "../../base/classes/CustomClient.js";
import Event from "../../base/classes/Event.js";
export default class ConfirmReactionRemoved extends Event {
    constructor(client: CustomClient);
    execute(reaction: MessageReaction, user: User): Promise<void>;
}
//# sourceMappingURL=ConfirmReactionRemoved.d.ts.map