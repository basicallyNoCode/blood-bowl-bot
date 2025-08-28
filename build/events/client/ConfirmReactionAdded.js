import { Events } from "discord.js";
import Event from "../../base/classes/Event.js";
import ConfirmRections from "../../base/enums/ConfirmReactions.js";
export default class ConfirmReactionAdded extends Event {
    constructor(client) {
        super(client, {
            name: Events.MessageReactionAdd,
            description: "Check if Match got confrimed",
            once: false
        });
    }
    execute(reaction, user) {
        if (reaction.message.author.id == this.client.user?.id) {
            const unConfrimedMatch = this.client.unConfirmedMatches.get(reaction.message.id);
            if (unConfrimedMatch) {
                if (!user.bot && (user.id == unConfrimedMatch.authorId || user.id == unConfrimedMatch.opponentId)) {
                    if (reaction.emoji.name == ConfirmRections.CONFIRM) {
                        unConfrimedMatch.confirmReactions.push({ reactionId: reaction.message.id + user.id + reaction.emoji.id, authorId: user.id, reaction: ConfirmRections.CONFIRM });
                    }
                    else if (reaction.emoji.name == ConfirmRections.DENY) {
                        unConfrimedMatch.confirmReactions.push({ reactionId: reaction.message.id + user.id + reaction.emoji.id, authorId: user.id, reaction: ConfirmRections.DENY });
                    }
                    else {
                        return;
                    }
                    let nonReactionPlayer = "";
                    if (user.id === unConfrimedMatch.authorId) {
                        nonReactionPlayer = unConfrimedMatch.opponentId;
                    }
                    else if (user.id !== unConfrimedMatch.authorId) {
                        nonReactionPlayer = unConfrimedMatch.authorId;
                    }
                    const matchPlayersConfirmReactions = unConfrimedMatch.confirmReactions.filter((confirmReaction) => {
                        return confirmReaction.authorId == unConfrimedMatch.authorId || confirmReaction.authorId == unConfrimedMatch.opponentId;
                    });
                    if (matchPlayersConfirmReactions.filter((reaction) => reaction.reaction == ConfirmRections.DENY).length >= 1) {
                        console.log("before", this.client.unConfirmedMatches.size);
                        reaction.message.reply(`${user} hat das match Abgelehnt, das match wird nicht erfasst und muss über den /matchresult befehl erneut eingetragen werden. \nFYI ${reaction.message.guild?.members.cache.get(nonReactionPlayer)?.user}`);
                        this.client.unConfirmedMatches.delete(reaction.message.id);
                        console.log("after ", this.client.unConfirmedMatches.size);
                    }
                    if (matchPlayersConfirmReactions.length >= 2) {
                        if (matchPlayersConfirmReactions.filter((reaction) => reaction.reaction == ConfirmRections.CONFIRM).length == 2) {
                            console.log("push message to Database");
                            reaction.message.reply(`${user} und ${reaction.message.guild?.members.cache.get(nonReactionPlayer)?.user} hat das match bestätigt. Das Match wird in die Tabelle eingetragen`);
                            this.client.unConfirmedMatches.delete(reaction.message.id);
                        }
                    }
                    this.client.unConfirmedMatches.set(reaction.message.id, unConfrimedMatch);
                }
            }
        }
    }
}
//# sourceMappingURL=ConfirmReactionAdded.js.map