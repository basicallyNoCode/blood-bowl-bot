import { Client, Collection } from "discord.js";
import ICustomClient from "../interfaces/ICustomClient.js";
import IConfig from "../interfaces/IConfig.js";
import Handler from "./Handler.js";
import config from "../../../data/config.json" with {type: "json"};
import Command from "./Command.js";
import SubCommand from "./SubCommand.js";

export default class CustomClient extends Client implements ICustomClient{
    
    config: IConfig;
    handler: Handler;
    commands: Collection<string, Command>;
    subCommands: Collection<string, SubCommand>;
    cooldowns: Collection<string, Collection<string, number>>;

    constructor (){
        super({intents: []});
        this.config = config
        this.handler = new Handler(this);
        this.commands = new Collection();
        this.subCommands = new Collection();
        this.cooldowns = new Collection();
    }
    
    
    init(): void {
        this.LoadHandlers();
        this.login(this.config.token)
            .catch((error)=> console.error(error));
    }

    LoadHandlers(): void {
        this.handler.LoadEvents();
        this.handler.LoadCommands();
    }
}