import {ApplicationCommandOptionType, ChatInputCommandInteraction, MessageFlags, PermissionsBitField, TextInputStyle } from "discord.js";
import Command from "../base/classes/Command.js";
import CustomClient from "../base/classes/CustomClient.js";
import Category from "../base/enums/Category.js";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from "@discordjs/builders";
import Competition from "../base/schemas/Competition.js";
import Division from "../base/schemas/Division.js";

export default class AddDivision extends Command{
    constructor(client: CustomClient){
        super(client, {
            name:"adddivision",
            description: "Division erstellen",
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
                    description: "Einzigartiger Divisionsname",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
            ]
        })
    }

    async execute(interaction: ChatInputCommandInteraction){
        const divisionName = interaction.options.getString("division-name");
        const competitionName= interaction.options.getString("competition")
        const competition = await Competition.findOne({competitionId: `${interaction.guildId}-${competitionName!}`, active: true});
        if(!competition){
            interaction.reply(`Die angegebene Competition ${competitionName} existiert nicht oder ist nicht mehr Aktiv`)
            return
        }

        const checkDivisionExists = await Division.findOne({divisionId: `${competition.competitionId!}-${divisionName}`})
        if(checkDivisionExists){
            interaction.reply(`Die Division ${divisionName} existiert bereits in der Competition ${competitionName}`)
            return
        }
        const division = new Division({
            divisionId: `${competition.competitionId!}-${divisionName}`,
            guildId: interaction.guildId,
            divisionAttendents: [],
            matches: [],
        });
        try{
    
            await division.save()

            //@ts-ignore cant get rid of this
            competition.divisions.push(division._id)
            await competition.save()
            interaction.reply(`Division ${divisionName} wurde in der Competition ${competitionName} angelegt`)
        }catch(error){
            console.error(error);
            interaction.reply({content: `Fehler beim schreiben in die Datenbank`, flags: [MessageFlags.Ephemeral]})
        }
    }
}