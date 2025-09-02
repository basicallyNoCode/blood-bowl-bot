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
            description: "Spieler zur division hinzufügen ",
            category: Category.UTILITIES,
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            dm_permession: true,
            cooldown: 3,
            options: [
                {
                    name: "competition",
                    description: "Name der Competition",
                    type: ApplicationCommandOptionType.String,
                    required: true
                    
                },
            ]
        })
    }

    async execute(interaction: ChatInputCommandInteraction){
        const competitionId = interaction.options.getString("competition");
        const competition = await Competition.find({competitionId: competitionId})
        
        if(!competition){
            interaction.reply(`Die angegebene Competition existiert nicht oder ist nicht mehr Aktiv`)
            return
        }
        const divisions = await Division.find({competitionId: competitionId}).populate("divisionAttendents");
        if(divisions.length >=0 ){
            interaction.reply(`Die angegebene Competition hat keine Divisionen`)
            return
        }
        const standings : Collection<string, IStanding[]> = new Collection();
        const filteredDivisions = divisions.filter((div)=>{div.divisionAttendents.length >= 2 && div.matches.length >= 2})
        filteredDivisions.forEach(async (fDiv)=>{
            const divStandings: IStanding[] = [];
            const sortedAttendents = await DivisionAttendent.find({divisionId: fDiv.divisionId}).sort({points: -1, tdDiff: -1, casDiff: -1}).exec();
            if(sortedAttendents){
                sortedAttendents.forEach((sortedAttendend, index)=>{
                    divStandings.push({
                        playerName: sortedAttendend.shownName,
                        rank: index + 1,
                        points: sortedAttendend.points,
                        tdDiff: sortedAttendend.tdFor - sortedAttendend.tdAgainst,
                        casDiff: sortedAttendend.casFor - sortedAttendend.casAgainst
                    })
                })
            }
            const divName = fDiv.divisionId.split("-").pop();
            if(divStandings.length > 0 && divName){
                standings.set(divName, divStandings);
            }
        })
    }
    
    async autocomplete(interaction: AutocompleteInteraction) {
        console.log("test")
        const focusedOption = interaction.options.getFocused(true);
        if(focusedOption.name === "competition"){
            const competitions = await Competition.find({
                guildId: interaction.guildId
            })
            const choices: IChoice[] =[];
            console.log(competitions);
            competitions.forEach((competition)=>{
                choices.push({name: competition.competitionName, value: competition.competitionId})
            })
            interaction.respond(choices)
        }
    }
}

