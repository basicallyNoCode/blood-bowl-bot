import { Collection, Events, MessageReaction, User } from "discord.js";
import CustomClient from "../../base/classes/CustomClient.js";
import Event from "../../base/classes/Event.js";
import ConfirmRections from "../../base/enums/ConfirmReactions.js";
import ConfirmReactionEntry from "../../base/schemas/ConfirmReactionEntry.js";
import UnConfirmedMatches from "../../base/schemas/UnConfirmedMatches.js";
import IMatchResult from "../../base/interfaces/IMatchResult.js";
import Match from "../../base/schemas/Match.js";
import PlayerResult from "../../base/schemas/PlayerResult.js";
import DivisionAttendent from "../../base/schemas/DivisionAttendent.js";
import Division from "../../base/schemas/Division.js";
import Competition from "../../base/schemas/Competition.js";

export default class ConfirmReactionAdded extends Event{
    reactionQueues: Collection<string, Promise<void>>;

    constructor(client: CustomClient){
        super(client,{
            name: Events.MessageReactionAdd,
            description: "Check if Match got confrimed",
            once: false
        })
        this.reactionQueues = new Collection();
    }
    async execute(reaction: MessageReaction, user: User){
        await this.enqueueReaction(reaction.message.id, async () => {
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
                                    await reaction.message.reply(`${user} hat das match Abgelehnt, das match wird nicht erfasst und muss über den /matchresult befehl erneut eingetragen werden. \nFYI ${pingUser}`)
                                    matchConfirmed = true;
                                }
                                if (checkableMatchResult.confirmReactions.length >= 2){
                                    if(checkableMatchResult.confirmReactions.filter((reaction) => reaction.agreed == true).length <= 2){
                                        const match = await Match.findOne({
                                            matchDay: checkableMatchResult.matchDay,
                                            competitionId: checkableMatchResult.competitionId,
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
                                            await reaction.message.reply(`Das angegebene Match existiert nicht`)
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
                                            await reaction.message.reply("Die Division des Matches existiert nicht")
                                            return
                                        }


                                        const competition = await Competition.findOne({competitionId: division!.competitionId, active: true})
                                        if(!competition){
                                            await reaction.message.reply("Die Competition des Matches existiert nicht oder ist nicht mehr Aktiv")
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
                                            await reaction.message.reply("Das Match ist nicht zwischen 2 Liga Mitgliedern ausgetragen worden")
                                            return
                                        }

                                        recordingAttendent.tdFor = (recordingAttendent.tdFor ?? 0) + (checkableMatchResult.tdFor ?? 0);
                                        recordingAttendent.casFor = (recordingAttendent.casFor ?? 0) + (checkableMatchResult.casFor ?? 0);
                                        recordingAttendent.tdAgainst = (recordingAttendent.tdAgainst ?? 0) + (checkableMatchResult.tdAgainst ?? 0);
                                        recordingAttendent.casAgainst = (recordingAttendent.casAgainst ?? 0) + (checkableMatchResult.casAgainst ?? 0);

                                        opposingAttendent.tdFor = (opposingAttendent.tdFor ?? 0) + (checkableMatchResult.tdAgainst ?? 0);
                                        opposingAttendent.casFor = (opposingAttendent.casFor ?? 0) + (checkableMatchResult.casAgainst ?? 0);
                                        opposingAttendent.tdAgainst = (opposingAttendent.tdAgainst ?? 0) + (checkableMatchResult.tdFor ?? 0);
                                        opposingAttendent.casAgainst = (opposingAttendent.casAgainst ?? 0) + (checkableMatchResult.casFor ?? 0);

                                        const winPoints = competition.winPoints ?? 0;
                                        const lossPoints = competition.lossPoints ?? 0;
                                        const drawPoints = competition.drawPoints ?? 0;

                                        if(playerResultsRecordingPlayer.touchdonws > playerResultOpponent.touchdonws){
                                            recordingAttendent.points = (recordingAttendent.points ?? 0) + winPoints
                                            opposingAttendent.points = (opposingAttendent.points ?? 0) + lossPoints
                                            recordingAttendent.wins = (recordingAttendent.wins ?? 0) + 1
                                            opposingAttendent.losses = (opposingAttendent.losses ?? 0) + 1
                                        }else if(playerResultsRecordingPlayer.touchdonws < playerResultOpponent.touchdonws){
                                            recordingAttendent.points = (recordingAttendent.points ?? 0) + lossPoints
                                            opposingAttendent.points = (opposingAttendent.points ?? 0) + winPoints
                                            recordingAttendent.losses = (recordingAttendent.losses ?? 0) + 1
                                            opposingAttendent.wins = (opposingAttendent.wins ?? 0) + 1
                                        }else if(playerResultsRecordingPlayer.touchdonws === playerResultOpponent.touchdonws){
                                            recordingAttendent.points = (recordingAttendent.points ?? 0) + drawPoints
                                            opposingAttendent.points = (opposingAttendent.points ?? 0) + drawPoints
                                            recordingAttendent.draws = (recordingAttendent.draws ?? 0) + 1
                                            opposingAttendent.draws = (opposingAttendent.draws ?? 0) + 1
                                        }
                                        
                                        await recordingAttendent.save();
                                        await opposingAttendent.save();

                                        await playerResultsRecordingPlayer.save();
                                        await playerResultOpponent.save();
                                        //@ts-ignore
                                        match.playerResults.push(playerResultsRecordingPlayer._id, playerResultOpponent._id)
                                        match.gamePlayedAndConfirmed = true,
                                        match.save();

                                        let nonReactionPlayerUser = reaction.message.guild?.members.cache.get(nonReactionPlayer)?.user
                                        if(!nonReactionPlayerUser){
                                            nonReactionPlayerUser = (await reaction.message.guild?.members.fetch(nonReactionPlayer))!.user
                                        }
                                        await reaction.message.reply(`${user} und ${nonReactionPlayerUser} hat das match bestätigt. Das Match wird in die Tabelle eingetragen`)
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
            }catch(error){
                console.error(error);
            }
        })
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

    

    private async enqueueReaction(messageId: string, task: () => Promise<void>) {
        const prev = this.reactionQueues.get(messageId) ?? Promise.resolve();
    
        // Chain the new task after the previous one
        const next = prev.then(task).catch((err) => {
            console.error("Reaction queue error:", err);
        });
    
        // Store the new promise back in the collection
        this.reactionQueues.set(messageId, next);
    
        return next;
    }
}