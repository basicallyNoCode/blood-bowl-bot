import {ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction, MessageFlags, PermissionsBitField, TextInputStyle } from "discord.js";
import Command from "../base/classes/Command.js";
import CustomClient from "../base/classes/CustomClient.js";
import Category from "../base/enums/Category.js";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from "@discordjs/builders";
import Competition from "../base/schemas/Competition.js";
import Division from "../base/schemas/Division.js";
import { IChoice } from "../base/interfaces/IChoice.js";

export default class AddDivision extends Command{
    constructor(client: CustomClient){
        super(client, {
            name:"competition-overview",
            description: "Zeige alle Divisions Attendents und Matches an",
            category: Category.UTILITIES,
            default_member_permissions: PermissionsBitField.Flags.Administrator,
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
            const divisionName = interaction.options.getString("division-name");
            const competitionId= interaction.options.getString("competition")
            const competition = await Competition.findOne({competitionId: competitionId!});
            if(!competition){
                interaction.reply(`Die angegebene Competition ${competitionId} existiert nicht oder ist nicht mehr Aktiv`)
                return
            }
            const divisions = await Division.find({competitionId: competition.competitionId}).populate("divisionAttendents").populate("matches");
            let resultReply = "";
            for(const div of divisions){
                const divName = div.divisionId.split("-").pop();
                let attendendString = "Teilnehmer: \n"
                let matchString = "Matches: \n"
                for (const att of div.divisionAttendents){
                    attendendString = `${attendendString} ${att.shownName} \n` 
                }
                for (const match of div.matches){
                    let player1Name = interaction.guild?.members.cache.get(match.playerOne)?.displayName
                    if(!player1Name){
                        await interaction.guild?.members.fetch(match.playerOne)?.then((member)=>{
                            player1Name= member.user.displayName;
                        })
                    }
                    let player2Name = interaction.guild?.members.cache.get(match.playerTwo)?.displayName
                    if(!player2Name){
                        await interaction.guild?.members.fetch(match.playerTwo)?.then((member)=>{
                            player2Name = member.user.displayName;
                        })
                    }
                    matchString = `${matchString} Spieltag: ${match.matchDay}: ${player1Name} vs ${player2Name} \n`
                }
                const divString = `${divName}:\n ${attendendString} ${matchString}`
                resultReply = resultReply + divString;
            }
            
            interaction.reply(resultReply)
        }catch(error){
            interaction.reply("Es ist ein fehler aufgetreten, Versuche es später erneut")
            console.error(error);
        }
    }

    async autocomplete(interaction: AutocompleteInteraction) {
     
        const focusedOption = interaction.options.getFocused(true);
        if(focusedOption.name === "competition"){
            const competitions = await Competition.find({
                guildId: interaction.guildId,
            })
            const choices: IChoice[] =[];
            
            competitions.forEach((competition)=>{
                choices.push({name: competition.competitionName, value: competition.competitionId})
            })
            interaction.respond(choices)
        }
    }
}