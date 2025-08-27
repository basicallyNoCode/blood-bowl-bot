import {ChatInputCommandInteraction} from "discord.js";
import CustomClient from "../base/classes/CustomClient.js";
import SubCommand from "../base/classes/SubCommand.js";

export default class TestTwo extends SubCommand{
    constructor(client: CustomClient){
        super(client, {
            name:"test.two",
        })
    }

    execute(interaction: ChatInputCommandInteraction){
        interaction.reply({content:"test 2 war erfolgreich"})
    }
}