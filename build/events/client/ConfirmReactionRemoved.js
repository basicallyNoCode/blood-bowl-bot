import { Events } from "discord.js";
import Event from "../../base/classes/Event.js";
import ConfirmRections from "../../base/enums/ConfirmReactions.js";
import ConfirmReactionEntry from "../../base/schemas/ConfirmReactionEntry.js";
import UnConfirmedMatches from "../../base/schemas/UnConfirmedMatches.js";
export default class ConfirmReactionRemoved extends Event {
    constructor(client) {
        super(client, {
            name: Events.MessageReactionRemove,
            description: "removed Confirmed Reaction Handling",
            once: false
        });
    }
    async execute(reaction, user) {
        if (reaction.partial) {
            try {
                await reaction.fetch();
            }
            catch (error) {
                console.error("Error fetching reaction:", error);
                return;
            }
        }
        if (reaction.message.partial) {
            try {
                await reaction.message.fetch();
            }
            catch (error) {
                console.error("Error fetching message:", error);
                return;
            }
        }
        if (reaction.message.author.id == this.client.user?.id) {
            const messageId = reaction.message.id;
            const unConfirmedMatch = await UnConfirmedMatches.findOne({ matchResultId: messageId }).populate("confirmReactions");
            if (unConfirmedMatch) {
                if (!user.bot && (user.id == unConfirmedMatch.authorId || user.id == unConfirmedMatch.opponentId)) {
                    if (reaction.emoji.name == ConfirmRections.CONFIRM) {
                        unConfirmedMatch.confirmReactions = unConfirmedMatch.confirmReactions.filter((r) => {
                            if (user.id == r.authorId) {
                                return !r.agreed;
                            }
                            else {
                                return true;
                            }
                        });
                        await unConfirmedMatch.save();
                        await ConfirmReactionEntry.deleteMany({ matchResultId: messageId, authorId: user.id });
                    }
                }
            }
        }
    }
}
//# sourceMappingURL=ConfirmReactionRemoved.js.map