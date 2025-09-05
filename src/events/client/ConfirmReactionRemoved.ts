import { Events, Message, MessageManager, MessageReaction, ReactionManager, User } from "discord.js";
import CustomClient from "../../base/classes/CustomClient.js";
import Event from "../../base/classes/Event.js";
import ConfirmRections from "../../base/enums/ConfirmReactions.js";
import ConfirmReactionEntry from "../../base/schemas/ConfirmReactionEntry.js";
import UnConfirmedMatches from "../../base/schemas/UnConfirmedMatches.js";
import mongoose from "mongoose";
import IMatchResult from "../../base/interfaces/IMatchResult.js";
import { enqueueReaction } from "../../base/util/reactionQueue.js";

export default class ConfirmReactionRemoved extends Event {

    constructor(client: CustomClient){
        super(client,{
            name: Events.MessageReactionRemove,
            description: "removed Confirmed Reaction Handling",
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

        if (reaction.message.author?.id !== this.client.user?.id) return;

                
        if(reaction.emoji.name != ConfirmRections.CONFIRM && reaction.emoji.name != ConfirmRections.DENY){
            return
        }

        await enqueueReaction(reaction.message.id, async () => {
            try{
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
                const messageId = reaction.message.id;
                const unConfirmedMatch = await UnConfirmedMatches.findOne({matchResultId: messageId}).populate("confirmReactions");
                if(unConfirmedMatch){
                    if(!user.bot && (user.id == unConfirmedMatch.authorId || user.id == unConfirmedMatch.opponentId)){
                        try{
                            const reactionToRemove = await ConfirmReactionEntry.findOne(
                                { matchResultId: messageId, authorId: user.id },
                                "_id"
                            );
                            if(reactionToRemove){
                                await UnConfirmedMatches.updateOne(
                                    { matchResultId: messageId },
                                    //@ts-ignore mongoose error
                                    { $pull: { confirmReactions: reactionToRemove._id } }
                                    );
                                    await ConfirmReactionEntry.deleteOne({ matchResultId: messageId, authorId: user.id });
                            }
                        } catch(error){
                            console.error("error when removing confirmReaction or unConfirmed match", error);
                        }
                    }      
                }
            }catch(error){
                console.error("error when trying to handle Remove Reaction", error)
            }
        })
    }
}