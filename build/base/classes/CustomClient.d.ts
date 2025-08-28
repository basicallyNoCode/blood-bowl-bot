import { Client, Collection } from "discord.js";
import ICustomClient from "../interfaces/ICustomClient.js";
import IConfig from "../interfaces/IConfig.js";
import Handler from "./Handler.js";
import Command from "./Command.js";
import SubCommand from "./SubCommand.js";
import IMatchResult from "../interfaces/IMatchResult.js";
export default class CustomClient extends Client implements ICustomClient {
    config: IConfig;
    handler: Handler;
    commands: Collection<string, Command>;
    subCommands: Collection<string, SubCommand>;
    cooldowns: Collection<string, Collection<string, number>>;
    unConfirmedMatches: Collection<string, IMatchResult>;
    constructor();
    init(): void;
    LoadHandlers(): void;
}
//# sourceMappingURL=CustomClient.d.ts.map