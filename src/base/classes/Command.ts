import { ChatInputCommandInteraction, AutocompleteInteraction } from "discord.js";
import Category from "../enums/Category.js";
import ICommand from "../interfaces/ICommand.js";
import CustomClient from "./CustomClient.js";
import ICommandOptions from "../interfaces/ICommandOptions.js";

export default class Command implements ICommand{
    client: CustomClient;
    name: string;
    description: string;
    category: Category;
    options: object;
    default_member_permissions: bigint;
    dm_permession: boolean;
    cooldown: number;

    constructor(client:CustomClient, options: ICommandOptions){
        this.client = client;
        this.name = options.name;
        this.description = options.description;
        this.category = options.category;
        this.options = options.options;
        this.default_member_permissions = options.default_member_permissions;
        this.dm_permession = options.dm_permession;
        this.cooldown = options.cooldown;
    }


    execute(interaction: ChatInputCommandInteraction): void {
    
    }
    autocomplete(interaction: AutocompleteInteraction): void {
    
    }

}