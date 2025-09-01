import { Events, Message, MessageManager, MessageReaction, ReactionManager, User } from "discord.js";
import CustomClient from "../../base/classes/CustomClient.js";
import Event from "../../base/classes/Event.js";
import ConfirmRections from "../../base/enums/ConfirmReactions.js";
import ConfirmReactionEntry from "../../base/schemas/ConfirmReactionEntry.js";
import UnConfirmedMatches from "../../base/schemas/UnConfirmedMatches.js";
import mongoose from "mongoose";
import IMatchResult from "../../base/interfaces/IMatchResult.js";
import Match from "../../base/schemas/Match.js";
import PlayerResult from "../../base/schemas/PlayerResult.js";
import DivisionAttendent from "../../base/schemas/DivisionAttendent.js";
import Division from "../../base/schemas/Division.js";
import Competition from "../../base/schemas/Competition.js";

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
                            let pingUser = reaction.message.guild?.members.cache.get(nonReactionPlayer)?.user
                            if(!pingUser){
                                await reaction.message.guild?.members.fetch(nonReactionPlayer).then((guildMember)=>{
                                    pingUser = guildMember.user
                                })
                            }
                            reaction.message.reply(`${user} hat das match Abgelehnt, das match wird nicht erfasst und muss über den /matchresult befehl erneut eingetragen werden. \nFYI ${pingUser}`)
                            matchConfirmed = true;
                        }
                        if (checkableMatchResult.confirmReactions.length >= 2){
                            if(checkableMatchResult.confirmReactions.filter((reaction) => reaction.agreed == true).length <= 2){
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
                                })
                                if(!match){
                                    reaction.message.reply(`Das angegebene Match existiert nicht`)
                                    return
                                }

                                const playerResultsRecordingPlayer = new PlayerResult({
                                    userId: checkableMatchResult.authorId,
                                    touchdonws: checkableMatchResult.tdFor,
                                    casualties: checkableMatchResult.casFor,
                                    divisionId: match.divisionId,
                                })

                                const playerResultOpponent = new PlayerResult({
                                    userId: checkableMatchResult.opponentId,
                                    touchdonws: checkableMatchResult.tdAgainst,
                                    casualties: checkableMatchResult.casAgainst,
                                    divisionId: match.divisionId,
                                })

                                const division = await Division.findOne({divisionId: match.divisionId}).populate("divisionAttendents");
                                if(!division){
                                    reaction.message.reply("Die Division des Matches existiert nicht")
                                    return
                                }


                                const competition = await Competition.findOne({competitionId: division!.competitionId, active: true})
                                if(!competition){
                                    reaction.message.reply("Die Competition des Matches existiert nicht oder ist nicht mehr Aktiv")
                                    return
                                }
        
                                const recordingAttendent = await DivisionAttendent.findOne({
                                    divisionId: match.divisionId,
                                    userId: checkableMatchResult.authorId,
                                })
                                

                                const opposingAttendent = await DivisionAttendent.findOne({
                                    divisionId: match.divisionId,
                                    userId: checkableMatchResult.opponentId,
                                })

                                if(!recordingAttendent || !opposingAttendent){
                                    reaction.message.reply("Das Match ist nicht zwischen 2 Liga Mitgliedern ausgetragen worden")
                                    return
                                }

                                recordingAttendent.tdDiff = recordingAttendent.tdDiff + (checkableMatchResult.tdFor - checkableMatchResult.tdAgainst);
                                recordingAttendent.casDiff = recordingAttendent.casDiff + (checkableMatchResult.casFor - checkableMatchResult.casAgainst);

                                opposingAttendent.tdDiff = opposingAttendent.tdDiff + (checkableMatchResult.tdAgainst - checkableMatchResult.tdFor);
                                opposingAttendent.casDiff = opposingAttendent.casDiff + (checkableMatchResult.casAgainst - checkableMatchResult.casFor);

                                if(playerResultsRecordingPlayer.touchdonws > playerResultOpponent.touchdonws){
                                    recordingAttendent.points = recordingAttendent.points + competition.winPoints
                                    opposingAttendent.points = opposingAttendent.points + competition.lossPoints
                                }else if(playerResultsRecordingPlayer.touchdonws < playerResultOpponent.touchdonws){
                                    recordingAttendent.points = recordingAttendent.points + competition.lossPoints
                                    opposingAttendent.points = opposingAttendent.points + competition.winPoints
                                }else if(playerResultsRecordingPlayer.touchdonws === playerResultOpponent.touchdonws){
                                    recordingAttendent.points = recordingAttendent.points + competition.drawPoints
                                    opposingAttendent.points = opposingAttendent.points + competition.drawPoints
                                }
                                  
                                await recordingAttendent.save();
                                await opposingAttendent.save();

                                await playerResultsRecordingPlayer.save();
                                await playerResultOpponent.save();
            
                                //@ts-ignore
                                match.playerResults.push(playerResultsRecordingPlayer._id, playerResultOpponent._id)
                                match.gamePlayedAndConfirmed = true,
                                match.save();

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