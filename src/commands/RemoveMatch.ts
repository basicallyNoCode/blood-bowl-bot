import {ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction, CommandInteractionOptionResolver, MessageFlags, PermissionsBitField, TextInputStyle } from "discord.js";
import Command from "../base/classes/Command.js";
import CustomClient from "../base/classes/CustomClient.js";
import Category from "../base/enums/Category.js";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from "@discordjs/builders";
import Competition from "../base/schemas/Competition.js";
import Division from "../base/schemas/Division.js";
import DivisionAttendent from "../base/schemas/DivisionAttendent.js";
import Match from "../base/schemas/Match.js";
import IMatch from "../base/interfaces/IMatch.js";
import { IChoice } from "../base/interfaces/IChoice.js";

export default class RemoveDivision extends Command{
    constructor(client: CustomClient){
        super(client, {
            name:"removematch",
            description: "Match entfernen",
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
                {
                    name: "division-name",
                    description: "Einzigartiger Divisionsname",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "player1",
                    description: "Nutzer",
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "player2",
                    description: "Nutzer",
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "matchday",
                    description: "Nutzer",
                    type: ApplicationCommandOptionType.Number,
                    required: true
                }
            ]
        })
    }

    async execute(interaction: ChatInputCommandInteraction){
        try{
                
            const competitionId= interaction.options.getString("competition")
            
            const competition = await Competition.findOne({competitionId: competitionId!, active: true}).populate('divisions');;
            if(!competition){
                interaction.reply(`Die angegebene Competition ${competitionId} existiert nicht oder ist nicht mehr Aktiv`)
                return
            }
            const division = await Division.findOne({divisionId: `${competition.competitionId!}-${interaction.options.getString("division-name")}`})
                .populate("matches");
            if(!division){
                interaction.reply(`Die angegebene Division ${interaction.options.getString("division-name")!} existiert nicht`)
                return
            }

            const match = await Match.findOne(
                {
                    divisionId: division.divisionId,
                    playerOne: interaction.options.getUser("player1")?.id,
                    playerTwo: interaction.options.getUser("player2")?.id,
                    matchDay: interaction.options.getNumber("matchday"),
                    gamePlayedAndConfirmed: false,
                });

            if(!match){
                interaction.reply(`Das angegebene Match in der division  ${interaction.options.getString("division-name")!} existiert entweder nicht oder ist bereits confirmed und kann nicht mehr gelöscht werden.`)
                return
            }
            

            division.matches = division.matches.filter((m: any)=>{
                //@ts-ignore cant get rid
                return m._id.toString() !== match._id.toString();
            })
            try{
                await division.save()
                await Match.deleteMany(
                    {
                        divisionId: `${competition.competitionId!}-${interaction.options.getString("division-name")}`,
                        playerOne: interaction.options.getUser("player1")?.id,
                        playerTwo: interaction.options.getUser("player2")?.id,
                        matchDay: interaction.options.getNumber("matchday"),
                    });
                interaction.reply("Match erfolgreich entfernt");
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

