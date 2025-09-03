import {ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction, MessageFlags, PermissionsBitField, TextInputStyle } from "discord.js";
import Command from "../base/classes/Command.js";
import CustomClient from "../base/classes/CustomClient.js";
import Category from "../base/enums/Category.js";
import Competition from "../base/schemas/Competition.js";
import Division from "../base/schemas/Division.js";
import { IChoice } from "../base/interfaces/IChoice.js";

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
                    required: true,
                    autocomplete: true
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
        try{
            const divisionName = interaction.options.getString("division-name");
            const competitionId= interaction.options.getString("competition")
            const competition = await Competition.findOne({competitionId: competitionId!, active: true});
            if(!competition){
                await interaction.reply(`Die angegebene Competition ${competitionId} existiert nicht oder ist nicht mehr Aktiv`)
                return
            }

            const checkDivisionExists = await Division.findOne({divisionId: `${competition.competitionId!}-${divisionName}`})
            if(checkDivisionExists){
                await interaction.reply(`Die Division ${divisionName} existiert bereits in der Competition ${competitionId}`)
                return
            }
            const division = new Division({
                divisionId: `${competition.competitionId!}-${divisionName}`,
                guildId: interaction.guildId,
                divisionAttendents: [],
                matches: [],
                competitionId: competition.competitionId
            });
            try{
        
                await division.save()

                //@ts-ignore cant get rid of this
                competition.divisions.push(division._id)
                await competition.save()
                await interaction.reply(`Division ${divisionName} wurde in der Competition ${competitionId} angelegt`)
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