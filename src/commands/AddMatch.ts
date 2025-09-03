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
            name:"addmatch",
            description: "Spieler zur division hinzufügen ",
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
                    description: "Name der Divisionsname",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "player1",
                    description: "Erster Spieler",
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "player2",
                    description: "Zweiter Spieler",
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "matchday",
                    description: "Spieltag der begegnung",
                    type: ApplicationCommandOptionType.Number,
                    required: true
                }
            ]
        })
    }

    async execute(interaction: ChatInputCommandInteraction){
        try{
            const divisionName = interaction.options.getString("division-name");
            const competitionId= interaction.options.getString("competition");
            const playerOne = interaction.options.getUser("player1");
            const playerTwo = interaction.options.getUser("player2");
            const competition = await Competition.findOne({competitionId: competitionId!, active: true});
            if(!competition){
                await interaction.reply(`Die angegebene Competition ${competitionId} existiert nicht oder ist nicht mehr Aktiv`)
                return
            }

            const division = await Division.findOne({divisionId: `${competition.competitionId!}-${interaction.options.getString("division-name")}`}).populate("divisionAttendents")
            if(!division){
                await interaction.reply(`Die angegebene Division ${interaction.options.getString("division-name")!} existiert nicht`)
                return
            }
            if(division.divisionAttendents.filter((dA)=>{return dA.userId === playerOne?.id || dA.userId === playerTwo?.id}).length < 2){
                await interaction.reply(`Die user ${playerOne?.displayName} und ${playerTwo?.displayName} sind nicht Teil der Division bitte erst Teilnehmer der Division hinzufügen mit dem /addattendend command`)
                return
            }

            const match = await Match.findOne({
                matchDay: interaction.options.getNumber("matchday"),
                competitionId: competition.competitionId,
                $or: [
                    {
                        playerOne: playerTwo!.id,
                        playerTwo: playerOne!.id,
                    },
                    {
                        playerOne: playerOne!.id,
                        playerTwo: playerTwo!.id,
                    },
                ],
            })

            if(match){
                await interaction.reply(`Das angegebene Match zwischen ${playerOne?.displayName} und ${playerTwo?.displayName} existiert bereits für den Spieltag ${interaction.options.getNumber("matchday")} in der angegeben Competition`)
                return
            }

            try{
                const match = new Match({
                    divisionId: `${competition.competitionId!}-${interaction.options.getString("division-name")}`,
                    playerOne: playerOne?.id,
                    playerTwo: playerTwo?.id,
                    gamePlayedAndConfirmed: false,
                    playerResults: [],
                    matchDay: interaction.options.getNumber("matchday"),
                    competitionId: competition.competitionId!
                })

                await match.save();

                //@ts-ignore cant get rid of this
                division.matches.push(match._id)
                await division.save()
                await interaction.reply(`Das Match ${interaction.options.getUser("player1")?.displayName} gegen ${interaction.options.getUser("player2")?.displayName} wurde der Division ${divisionName} in der Competition ${competitionId} hinzugefügt`)
            }catch(error){
                console.error(error);
                await interaction.reply({content: `Fehler beim schreiben in die Datenbank`, flags: [MessageFlags.Ephemeral]})
            }
        }catch(error){
            await interaction.reply("Es ist ein fehler aufgetreten, Versuche es später erneut")
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

