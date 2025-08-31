import {ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionsBitField, TextInputStyle } from "discord.js";
import Command from "../base/classes/Command.js";
import CustomClient from "../base/classes/CustomClient.js";
import Category from "../base/enums/Category.js";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from "@discordjs/builders";
import Competition from "../base/schemas/Competition.js";
import Division from "../base/schemas/Division.js";
import DivisionAttendent from "../base/schemas/DivisionAttendent.js";
import Match from "../base/schemas/Match.js";

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
                    required: true
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
        const divisionName = interaction.options.getString("division-name");
        const competitionName= interaction.options.getString("competition")
        const competition = await Competition.findOne({competitionId: `${interaction.guildId}-${competitionName!}`})
        if(!competition){
            interaction.reply(`Die angegebene Competition ${competitionName} existiert nicht`)
            return
        }

        const division = await Division.findOne({divisionId: `${competition.competitionId!}-${interaction.options.getString("division-name")}`})
        if(!division){
            interaction.reply(`Die angegebene Division ${interaction.options.getString("division-name")!} existiert nicht`)
            return
        }
        
        const match = new Match({
            divisonId: `${competition.competitionId!}-${interaction.options.getString("division-name")}`,
            playerOne: interaction.options.getUser("player1")?.id,
            playerTwo: interaction.options.getUser("player2")?.id,
            gamePlayedAndConfirmed: false,
            playerResults: [],
            winner: "",
            matchDay: interaction.options.getNumber("matchday")
        })

        await match.save();

        //@ts-ignore cant get rid of this
        division.matches.push(match._id)
        await division.save()
        interaction.reply(`Das Match ${interaction.options.getUser("player1")?.username} gegen ${interaction.options.getUser("player2")?.username} wurde der Division ${divisionName} in der Competition ${competitionName} hinzugefügt`)
    }
}

