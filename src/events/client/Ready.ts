import { Collection, Events, REST, Routes } from "discord.js";
import CustomClient from "../../base/classes/CustomClient.js";
import Event from "../../base/classes/Event.js";
import Command from "../../base/classes/Command.js";
import dotenv from "dotenv"

export default class Ready extends Event{
    constructor(client: CustomClient){
        super(client,{
            name: Events.ClientReady,
            description: "Ready client",
            once: true
        })
    }
    async execute(){
        console.log(`${this.client.user?.tag} is now ready `)
        dotenv.config();
        const commands: object[] = this.getJson(this.client.commands)
        const rest = new REST().setToken(process.env.TOKEN!);
        try{
            const setCommands:any = await rest.put(Routes.applicationCommands(this.client.config.discordClientId), 
            {
                body: commands
            })
            console.log(`successfully set ${setCommands.length} commands!`)
        }catch(error){
            console.error(error)
        }
    }

    private getJson(commands: Collection<string, Command>): object[]{
        const data: object[]= [];
        
        commands.forEach(command =>{
            data.push({
                name: command.name,
                description: command.description,
                options: command.options,
                default_member_permissions: command.default_member_permissions.toString(),
                dm_permission: command.dm_permession
            })
        })
        return data;
    }
}