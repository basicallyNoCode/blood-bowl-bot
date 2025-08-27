import { Client, Collection } from "discord.js";
import Handler from "./Handler.js";
import config from "../../../data/config.json" with { type: "json" };
export default class CustomClient extends Client {
    config;
    handler;
    commands;
    subCommands;
    cooldowns;
    constructor() {
        super({ intents: [] });
        this.config = config;
        this.handler = new Handler(this);
        this.commands = new Collection();
        this.subCommands = new Collection();
        this.cooldowns = new Collection();
    }
    init() {
        this.LoadHandlers();
        this.login(this.config.token)
            .catch((error) => console.error(error));
    }
    LoadHandlers() {
        this.handler.LoadEvents();
        this.handler.LoadCommands();
    }
}
//# sourceMappingURL=CustomClient.js.map