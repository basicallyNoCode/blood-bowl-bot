import {ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction, CommandInteractionOptionResolver, MessageFlags, PermissionsBitField, TextInputStyle } from "discord.js";
import Command from "../base/classes/Command.js";
import CustomClient from "../base/classes/CustomClient.js";
import Category from "../base/enums/Category.js";
import Competition from "../base/schemas/Competition.js";
import Division from "../base/schemas/Division.js";
import { IChoice } from "../base/interfaces/IChoice.js";

export default class RemoveDivision extends Command{
    constructor(client: CustomClient){
        super(client, {
            name:"removedivision",
            description: "Division entfernen",
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
            const competitionId= interaction.options.getString("competition")!
            
            const competition = await Competition.findOne({competitionId: competitionId!, active: true}).populate('divisions');;
            if(!competition){
                interaction.reply(`Die angegebene Competition ${competitionId} existiert nicht oder ist nicht mehr Aktiv`)
                return
            }
            const division = await Division.findOne({divisionId: `${competition.competitionId!}-${interaction.options.getString("division-name")}`})
            if(!division){
                interaction.reply(`Die angegebene Division ${interaction.options.getString("division-name")!} existiert nicht`)
                return
            }

            competition.divisions = competition.divisions.filter((d: any)=>{
                //@ts-ignore cant get rid
                return d._id.toString() !== division._id.toString();
            })
            try{
                await competition.save()
                await Division.deleteOne({divisionId: `${competition.competitionId!}-${interaction.options.getString("division-name")}`});
                interaction.reply("Division erfolgreich entfernt");
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



