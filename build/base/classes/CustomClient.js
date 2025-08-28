import { Client, Collection, IntentsBitField } from "discord.js";
import Handler from "./Handler.js";
import config from "../../../data/config.json" with { type: "json" };
import dotenv from 'dotenv';
import { connect } from "mongoose";
export default class CustomClient extends Client {
    config;
    handler;
    commands;
    subCommands;
    cooldowns;
    unConfirmedMatches;
    constructor() {
        super({ intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.MessageContent,
                IntentsBitField.Flags.GuildMessageReactions,
            ] });
        this.config = config;
        this.handler = new Handler(this);
        this.commands = new Collection();
        this.subCommands = new Collection();
        this.cooldowns = new Collection();
        this.unConfirmedMatches = new Collection;
    }
    init() {
        dotenv.config();
        this.LoadHandlers();
        this.login(process.env.TOKEN)
            .catch((error) => console.error(error));
        connect(process.env.MONGO_DB_URL)
            .then(() => { console.log("Connected to Mongo DB"); })
            .catch((error) => console.error(error));
    }
    LoadHandlers() {
        this.handler.LoadEvents();
        this.handler.LoadCommands();
    }
}
//# sourceMappingURL=CustomClient.js.map