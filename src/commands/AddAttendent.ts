import {ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction, MessageFlags, PermissionsBitField, TextInputStyle } from "discord.js";
import Command from "../base/classes/Command.js";
import CustomClient from "../base/classes/CustomClient.js";
import Category from "../base/enums/Category.js";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from "@discordjs/builders";
import Competition from "../base/schemas/Competition.js";
import Division from "../base/schemas/Division.js";
import DivisionAttendent from "../base/schemas/DivisionAttendent.js";
import { IChoice } from "../base/interfaces/IChoice.js";

export default class AddAttendend extends Command{
    constructor(client: CustomClient){
        super(client, {
            name:"addattendend",
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
                    name: "user",
                    description: "Nutzer",
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "shown-name",
                    description: "In Tabelle anzuzeigender Name",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
            ]
        })
    }

    async execute(interaction: ChatInputCommandInteraction){
        try{
            const divisionName = interaction.options.getString("division-name");
            const competitionId= interaction.options.getString("competition")
            const competition = await Competition.findOne({competitionId: competitionId!, active: true});
            if(!competition){
                interaction.reply(`Die angegebene Competition ${competitionId} existiert nicht oder ist nicht mehr Aktiv`)
                return
            }

            const division = await Division.findOne({divisionId: `${competition.competitionId!}-${interaction.options.getString("division-name")}`})
                .populate("divisionAttendents");
            if(!division){
                interaction.reply(`Die angegebene Division ${interaction.options.getString("division-name")!} existiert nicht`)
                return
            }
            if(division.divisionAttendents.filter((divA) =>{
                return interaction.options.getUser("user")?.id === divA.userId;
            }).length > 0){
                interaction.reply(`Der Nutzer ${interaction.options.getUser("user")?.displayName} ist bereits in der Division ${interaction.options.getString("division-name")!}`)
                return
            }
            const attendend = new DivisionAttendent({
                divisionId: `${competition.competitionId!}-${interaction.options.getString("division-name")}`,
                userId: interaction.options.getUser("user")?.id,
                shownName: interaction.options.getString("shown-name"),
            })
            try{
        
                await attendend.save()

                //@ts-ignore cant get rid of this
                division.divisionAttendents.push(attendend._id)
                await division.save()
                interaction.reply(`Der Nutzer ${interaction.options.getUser("user")?.displayName} wurde der Division ${divisionName} in der Competition ${competitionId} hinzugefügt`)
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

