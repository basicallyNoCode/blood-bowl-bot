import { Events } from "discord.js";
import CustomClient from "../../base/classes/CustomClient.js";
import Event from "../../base/classes/Event.js";

export default class Ready extends Event{
    constructor(client: CustomClient){
        super(client,{
            name: Events.ClientReady,
            description: "Ready client",
            once: true
        })
    }
    execute(){
        console.log(`${this.client.user?.tag} is now ready `)
    }
}