import {ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction, Collection, MessageFlags, PermissionsBitField, TextInputStyle } from "discord.js";
import Command from "../base/classes/Command.js";
import CustomClient from "../base/classes/CustomClient.js";
import Category from "../base/enums/Category.js";
import Competition from "../base/schemas/Competition.js";
import { IChoice } from "../base/interfaces/IChoice.js";
import Division from "../base/schemas/Division.js";
import IStanding from "../base/interfaces/IStanding.js";
import DivisionAttendent from "../base/schemas/DivisionAttendent.js";

export default class Standings extends Command{
    constructor(client: CustomClient){
        super(client, {
            name:"standings",
            description: "Tabelle ausgeben ",
            category: Category.UTILITIES,
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            dm_permession: true,
            cooldown: 3,
            options: [
                {
                    name: "competition",
                    description: "Name der Competition",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                },
            ]
        })
    }

    async execute(interaction: ChatInputCommandInteraction){
        try{
            const competitionId = interaction.options.getString("competition");
            const competition = await Competition.findOne({competitionId: competitionId})
            
            if(!competition){
                interaction.reply(`Die angegebene Competition existiert nicht oder ist nicht mehr Aktiv`)
                return
            }
            const divisions = await Division.find({competitionId: competitionId}).populate("divisionAttendents");
            if(divisions.length ===0 ){
                interaction.reply(`Die angegebene Competition hat keine Divisionen`)
                return
            }
            const standings : Collection<string, IStanding[]> = new Collection();
            const filteredDivisions = divisions.filter((div)=>{return div.divisionAttendents.length >= 2 && div.matches.length >= 2})
            filteredDivisions.forEach(async (fDiv)=>{
                const divStandings: IStanding[] = [];
                const sortedAttendents = await DivisionAttendent.aggregate([
                    {
                        $match: { divisionId: fDiv.divisionId }
                    },
                    {
                        $addFields: {
                        tdDiff: { $subtract: ["$tdFor", "$tdAgainst"] },
                        casDiff: { $subtract: ["$casFor", "$casAgainst"] }
                        }
                    },
                    {
                        $sort: {
                        points: -1,     // highest points first
                        tdDiff: -1,     // then tdDiff
                        casDiff: -1     // then casDiff
                        }
                    }
                ]);

                let currentRank = 1;
                if(sortedAttendents.length > 0){
                    sortedAttendents.forEach((attendent, index)=>{
                        if(index >0){
                            const prevAttendent = sortedAttendents[index - 1]
                            const tiedRank = ( attendent.points === prevAttendent.points
                            && (attendent.tdFor - attendent.tdAgainst) === (prevAttendent.tdFor - prevAttendent.tdAgainst)
                            && (attendent.casFor - attendent.casAgainst) === (prevAttendent.casFor - prevAttendent.casAgainst)
                            )

                            if(!tiedRank){
                                currentRank = index + 1
                            }
                        }
                        divStandings.push({
                            playerName: attendent.shownName,
                            rank: currentRank,
                            points: attendent.points ?? 0,
                            tdDiff: (attendent.tdFor ?? 0) - (attendent.tdAgainst ?? 0),
                            casDiff: (attendent.casFor ?? 0) - (attendent.casAgainst ?? 0),
                            wins: attendent.wins ?? 0,
                            draws: attendent.draws ?? 0,
                            losses: attendent.losses,
                            matchesPlayed: (attendent.wins ?? 0) + (attendent.draws ?? 0) + (attendent.losses ?? 0)
                        })
                    })
                } 
                const divName = fDiv.divisionId.split("-").pop();
                console.log(divStandings)
                if(divStandings.length > 0 && divName){
                    standings.set(divName, divStandings);
                }
            })
            console.log(standings);
            interaction.reply(`Hier die Aktuelle Tabelle `)
        }catch(error){
            interaction.reply("Es ist ein fehler aufgetreten, Versuche es später erneut")
            console.error(error);
        }
    }
    
    async autocomplete(interaction: AutocompleteInteraction) {
     
        const focusedOption = interaction.options.getFocused(true);
        if(focusedOption.name === "competition"){
            const competitions = await Competition.find({
                guildId: interaction.guildId
            })
            const choices: IChoice[] =[];
            
            competitions.forEach((competition)=>{
                choices.push({name: competition.competitionName, value: competition.competitionId})
            })
            interaction.respond(choices)
        }
    }
}

