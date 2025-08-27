import { Collection } from "discord.js";
import Command from "../classes/Command.js";
import IConfig from "./IConfig.js"
import SubCommand from "../classes/SubCommand.js";

export default interface ICustomClient{
    config: IConfig;
    commands: Collection<string,Command>;
    subCommands: Collection<string,SubCommand>;
    cooldowns: Collection<string,Collection<string, number>>;

    init(): void;
    LoadHandlers(): void;
}