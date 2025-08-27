import { ChatInputCommandInteraction } from "discord.js";
import CustomClient from "../base/classes/CustomClient.js";
import SubCommand from "../base/classes/SubCommand.js";

export default class TestOne extends SubCommand{
    constructor(client: CustomClient){
        super(client, {
            name:"test.one",
        })
    }

    execute(interaction: ChatInputCommandInteraction){
        interaction.reply({content:"test 1 war erfolgreich"})
    }
}