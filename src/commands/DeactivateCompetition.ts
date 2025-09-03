import {ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction, MessageFlags, PermissionsBitField, TextInputStyle } from "discord.js";
import Command from "../base/classes/Command.js";
import CustomClient from "../base/classes/CustomClient.js";
import Category from "../base/enums/Category.js";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from "@discordjs/builders";
import Competition from "../base/schemas/Competition.js";
import Division from "../base/schemas/Division.js";
import DivisionAttendent from "../base/schemas/DivisionAttendent.js";
import Match from "../base/schemas/Match.js";
import { IChoice } from "../base/interfaces/IChoice.js";

export default class AddAttendend extends Command{
    constructor(client: CustomClient){
        super(client, {
            name:"deactivatecompetitions",
            description: "Competition deaktivieren Nur aktive Competitions können bearbeitet werden",
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
            const competitionId= interaction.options.getString("competition")
            const competition = await Competition.findOne({competitionId: competitionId!, active: true});
            if(!competition){
                interaction.reply(`Die angegebene Competition ${competitionId} existiert nicht oder ist nicht mehr Aktiv`)
                return
            }
            //@ts-ignore cant get rid of this
            try{
            competition.active = false;
            competition.save();
            interaction.reply(`Die Competition ${competitionId!} wurde deaktiviert`)
            }catch(error){
                console.error(error);
                interaction.reply({content: `Fehler beim schreiben in die Datenbank`, flags: [MessageFlags.Ephemeral]})
            }
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
                active: true

            })
            const choices: IChoice[] =[];
            
            competitions.forEach((competition)=>{
                choices.push({name: competition.competitionName, value: competition.competitionId})
            })
            interaction.respond(choices)
        }
    }
}

