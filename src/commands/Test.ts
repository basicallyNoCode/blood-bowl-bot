import { Application, ApplicationCommandOptionType, ChatInputApplicationCommandData, ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command.js";
import CustomClient from "../base/classes/CustomClient.js";
import Category from "../base/enums/Category.js";

export default class Test extends Command{
    constructor(client: CustomClient){
        super(client, {
            name:"test",
            description: "my test command",
            category: Category.UTILITIES,
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            dm_permession: true,
            cooldown: 3,
            options: [
                {
                    name: "one",
                    description: "this sub command 1",
                    type: ApplicationCommandOptionType.Subcommand
                },
                {
                    name: "two",
                    description: "this sub command 2",
                    type: ApplicationCommandOptionType.Subcommand
                },
        ]
        })
    }

    //execute(interaction: ChatInputCommandInteraction){
    //    interaction.reply({content:"test war erfolgreich"})
    //}
}