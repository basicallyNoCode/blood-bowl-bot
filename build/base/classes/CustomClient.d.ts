import { Client } from "discord.js";
import ICustomClient from "../interfaces/ICustomClient.js";
import IConfig from "../interfaces/IConfig.js";
import Handler from "./Handler.js";
export default class CustomClient extends Client implements ICustomClient {
    config: IConfig;
    handler: Handler;
    constructor();
    init(): void;
    LoadHandlers(): void;
}
//# sourceMappingURL=CustomClient.d.ts.map