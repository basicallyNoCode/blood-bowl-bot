import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command.js";
import Category from "../base/enums/Category.js";
export default class Test extends Command {
    constructor(client) {
        super(client, {
            name: "test",
            description: "my test command",
            category: Category.UTILITIES,
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            dm_permession: true,
            cooldown: 3,
            options: [
                {
                    name: "one",
                    description: "this sub command 1",
                    type: ApplicationCommandOptionType.Subcommand
                },
                {
                    name: "two",
                    description: "this sub command 2",
                    type: ApplicationCommandOptionType.Subcommand
                },
            ]
        });
    }
}
//# sourceMappingURL=Test.js.map