import { Client, Collection, IntentsBitField, Partials } from "discord.js";
import ICustomClient from "../interfaces/ICustomClient.js";
import IConfig from "../interfaces/IConfig.js";
import Handler from "./Handler.js";
import config from "../../../data/config.json" with {type: "json"};
import dotenv from 'dotenv'; 
import Command from "./Command.js";
import SubCommand from "./SubCommand.js";
import IMatchResult from "../interfaces/IMatchResult.js";
import { connect } from "mongoose";

export default class CustomClient extends Client implements ICustomClient{
    
    config: IConfig;
    handler: Handler;
    commands: Collection<string, Command>;
    subCommands: Collection<string, SubCommand>;
    cooldowns: Collection<string, Collection<string, number>>;

    constructor (){
        super({intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMembers,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.MessageContent,
            IntentsBitField.Flags.GuildMessageReactions,
        ],
        partials: [Partials.Channel, Partials.GuildMember, Partials.Reaction, Partials.Message, Partials.User],});
        this.config = config
        this.handler = new Handler(this);
        this.commands = new Collection();
        this.subCommands = new Collection();
        this.cooldowns = new Collection();
    }
    
    
    init(): void {
        dotenv.config()
        this.LoadHandlers();
        this.login(process.env.TOKEN)
            .catch((error)=> console.error(error));

        connect(process.env.MONGO_DB_URL!)
            .then(()=>{console.log("Connected to Mongo DB")})
            .catch((error)=> console.error(error))
    }

    LoadHandlers(): void {
        this.handler.LoadEvents();
        this.handler.LoadCommands();
    }
}