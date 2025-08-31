import { Events, Message, MessageManager, MessageReaction, ReactionManager, User } from "discord.js";
import CustomClient from "../../base/classes/CustomClient.js";
import Event from "../../base/classes/Event.js";
import ConfirmRections from "../../base/enums/ConfirmReactions.js";
import ConfirmReactionEntry from "../../base/schemas/ConfirmReactionEntry.js";
import UnConfirmedMatches from "../../base/schemas/UnConfirmedMatches.js";
import mongoose from "mongoose";
import IMatchResult from "../../base/interfaces/IMatchResult.js";

export default class ConfirmReactionAdded extends Event{

    constructor(client: CustomClient){
        super(client,{
            name: Events.MessageReactionAdd,
            description: "Check if Match got confrimed",
            once: false
        })
    }
    async execute(reaction: MessageReaction, user: User){
        if(reaction.partial){
            try {
                await reaction.fetch();
            } catch (error) {
                console.error("Error fetching reaction:", error);
                return;
            }
        }
        if (reaction.message.partial) {
            try {
                await reaction.message.fetch();
            } catch (error) {
                console.error("Error fetching message:", error);
                return;
            }
        }
        if(reaction.message.author!.id == this.client.user?.id!){
            const messageId = reaction.message.id;
            const unConfirmedMatch = await UnConfirmedMatches.findOne({matchResultId: messageId}).populate("confirmReactions");
            if(unConfirmedMatch){
                if(!user.bot && (user.id == unConfirmedMatch.authorId || user.id == unConfirmedMatch.opponentId)){
                    if(reaction.emoji.name == ConfirmRections.CONFIRM || reaction.emoji.name == ConfirmRections.DENY){
                        const confirmReaction = new ConfirmReactionEntry({
                            matchResultId: messageId,
                            authorId: user.id,
                            agreed: this.isAgreed(reaction.emoji.name)
                        })
                        await confirmReaction.save();
                        //@ts-ignore cant get rid of this
                        unConfirmedMatch.confirmReactions.push(confirmReaction._id);
                        unConfirmedMatch.save();
                    }else{
                        return
                    }
                    const nonReactionPlayer = this.getNonReactionPlayer(user.id, unConfirmedMatch)!
                    const checkableMatchResult = await UnConfirmedMatches.findOne({matchResultId: messageId}).populate("confirmReactions");
                    let matchConfirmed = false;
                    if(checkableMatchResult){
                        if(checkableMatchResult.confirmReactions.filter((reaction)=> reaction.agreed == false).length >= 1){
                            reaction.message.reply(`${user} hat das match Abgelehnt, das match wird nicht erfasst und muss über den /matchresult befehl erneut eingetragen werden. \nFYI ${reaction.message.guild?.members.cache.get(nonReactionPlayer)?.user}`)
                            matchConfirmed = true;
                        }
                        if (checkableMatchResult.confirmReactions.length >= 2){
                            if(checkableMatchResult.confirmReactions.filter((reaction) => reaction.agreed == true).length == 2){
                                reaction.message.reply(`${user} und ${reaction.message.guild?.members.cache.get(nonReactionPlayer)?.user} hat das match bestätigt. Das Match wird in die Tabelle eingetragen`)
                                matchConfirmed = true
                            }
                        }
                        if(matchConfirmed){
                            this.cleanDatabase(messageId);
                        }
                    }
                }
            }
        }
    }

    private isAgreed(emoji: string){
        if(emoji === ConfirmRections.DENY){
            return false
        }
        if(emoji === ConfirmRections.CONFIRM){
            return true
        }
    } 

    private getNonReactionPlayer(reactionUserId : string, unConfrimedMatch: IMatchResult){
        if(reactionUserId === unConfrimedMatch.authorId){
            return unConfrimedMatch.opponentId
        }else if(reactionUserId !== unConfrimedMatch.authorId){
            return unConfrimedMatch.authorId
        }
    }
    
    private async cleanDatabase(messageId: string){
        await ConfirmReactionEntry.deleteMany({matchResultId: messageId})
        await UnConfirmedMatches.deleteOne({matchResultId: messageId})
    }
}