import { Client } from "discord.js";
import ICustomClient from "../interfaces/ICustomClient.js";
import IConfig from "../interfaces/IConfig.js";
import Handler from "./Handler.js";
import config from "../../../data/config.json" with {type: "json"};

export default class CustomClient extends Client implements ICustomClient{
    
    config: IConfig;
    handler: Handler;

    constructor (){
        super({intents: []});
        this.config = config
        this.handler = new Handler(this);
    }
    
    init(): void {
        this.LoadHandlers();
        this.login(this.config.token)
            .catch((error)=> console.error(error));
    }

    LoadHandlers(): void {
        this.handler.LoadEvents();
    }
}