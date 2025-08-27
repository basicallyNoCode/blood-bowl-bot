import { Client } from "discord.js";
import ICustomClient from "../interfaces/ICustomClient";
import IConfig from "../interfaces/IConfig";
import Handler from "./Handler";
export default class CustomClient extends Client implements ICustomClient {
    config: IConfig;
    handler: Handler;
    constructor();
    init(): void;
    LoadHandlers(): void;
}
//# sourceMappingURL=CustomClient.d.ts.map