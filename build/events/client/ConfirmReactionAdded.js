import { Events } from "discord.js";
import Event from "../../base/classes/Event.js";
import ConfirmRections from "../../base/enums/ConfirmReactions.js";
import ConfirmReactionEntry from "../../base/schemas/ConfirmReactionEntry.js";
import UnConfirmedMatches from "../../base/schemas/UnConfirmedMatches.js";
import Match from "../../base/schemas/Match.js";
import PlayerResult from "../../base/schemas/PlayerResult.js";
export default class ConfirmReactionAdded extends Event {
    constructor(client) {
        super(client, {
            name: Events.MessageReactionAdd,
            description: "Check if Match got confrimed",
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
                    if (reaction.emoji.name == ConfirmRections.CONFIRM || reaction.emoji.name == ConfirmRections.DENY) {
                        const confirmReaction = new ConfirmReactionEntry({
                            matchResultId: messageId,
                            authorId: user.id,
                            agreed: this.isAgreed(reaction.emoji.name)
                        });
                        await confirmReaction.save();
                        //@ts-ignore cant get rid of this
                        unConfirmedMatch.confirmReactions.push(confirmReaction._id);
                        unConfirmedMatch.save();
                    }
                    else {
                        return;
                    }
                    const nonReactionPlayer = this.getNonReactionPlayer(user.id, unConfirmedMatch);
                    const checkableMatchResult = await UnConfirmedMatches.findOne({ matchResultId: messageId }).populate("confirmReactions");
                    let matchConfirmed = false;
                    if (checkableMatchResult) {
                        if (checkableMatchResult.confirmReactions.filter((reaction) => reaction.agreed == false).length >= 1) {
                            reaction.message.reply(`${user} hat das match Abgelehnt, das match wird nicht erfasst und muss über den /matchresult befehl erneut eingetragen werden. \nFYI ${reaction.message.guild?.members.cache.get(nonReactionPlayer)?.user}`);
                            matchConfirmed = true;
                        }
                        if (checkableMatchResult.confirmReactions.length >= 2) {
                            if (checkableMatchResult.confirmReactions.filter((reaction) => reaction.agreed == true).length <= 2) {
                                let playerTwo = reaction.message.guild?.members.cache.get(nonReactionPlayer)?.id;
                                if (!playerTwo) {
                                    await reaction.message.guild?.members.fetch(nonReactionPlayer)?.then((guildMember) => {
                                        playerTwo = guildMember.user.id;
                                        console.log(playerTwo);
                                    });
                                }
                                const match = await Match.findOne({
                                    matchDay: checkableMatchResult.matchDay,
                                    $or: [
                                        {
                                            playerOne: user?.id,
                                            playerTwo: nonReactionPlayer,
                                        },
                                        {
                                            playerOne: nonReactionPlayer,
                                            playerTwo: user?.id,
                                        },
                                    ],
                                });
                                console.log(match);
                                if (!match) {
                                    reaction.message.reply(`Das angegebene Match existiert nicht`);
                                    return;
                                }
                                const playerResultPlayer1 = new PlayerResult({
                                    userId: checkableMatchResult.authorId,
                                    touchdonws: checkableMatchResult.tdFor,
                                    casualties: checkableMatchResult.casFor,
                                    divisionId: match.divisionId,
                                });
                                const playerResultPlayer2 = new PlayerResult({
                                    userId: checkableMatchResult.authorId,
                                    touchdonws: checkableMatchResult.tdFor,
                                    casualties: checkableMatchResult.casFor,
                                    divisionId: match.divisionId,
                                });
                                await playerResultPlayer1.save();
                                await playerResultPlayer2.save();
                                //@ts-ignore
                                match.playerResults.push(playerResultPlayer1._id, playerResultPlayer2._id);
                                match.gamePlayedAndConfirmed = true,
                                    match.save();
                                reaction.message.reply(`${user} und ${reaction.message.guild?.members.cache.get(nonReactionPlayer)?.user} hat das match bestätigt. Das Match wird in die Tabelle eingetragen`);
                                matchConfirmed = true;
                            }
                        }
                        if (matchConfirmed) {
                            this.cleanDatabase(messageId);
                        }
                    }
                }
            }
        }
    }
    isAgreed(emoji) {
        if (emoji === ConfirmRections.DENY) {
            return false;
        }
        if (emoji === ConfirmRections.CONFIRM) {
            return true;
        }
    }
    getNonReactionPlayer(reactionUserId, unConfrimedMatch) {
        if (reactionUserId === unConfrimedMatch.authorId) {
            return unConfrimedMatch.opponentId;
        }
        else if (reactionUserId !== unConfrimedMatch.authorId) {
            return unConfrimedMatch.authorId;
        }
    }
    async cleanDatabase(messageId) {
        await ConfirmReactionEntry.deleteMany({ matchResultId: messageId });
        await UnConfirmedMatches.deleteOne({ matchResultId: messageId });
    }
}
//# sourceMappingURL=ConfirmReactionAdded.js.map