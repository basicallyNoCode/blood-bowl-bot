import { Client } from "discord.js";
import Handler from "./Handler.js";
import config from "../../../data/config.json" with { type: "json" };
export default class CustomClient extends Client {
    config;
    handler;
    constructor() {
        super({ intents: [] });
        this.config = config;
        this.handler = new Handler(this);
    }
    init() {
        this.LoadHandlers();
        this.login(this.config.token)
            .catch((error) => console.error(error));
    }
    LoadHandlers() {
        this.handler.LoadEvents();
    }
}
//# sourceMappingURL=CustomClient.js.map