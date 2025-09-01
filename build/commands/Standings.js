import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command.js";
import Category from "../base/enums/Category.js";
import Competition from "../base/schemas/Competition.js";
export default class AddAttendend extends Command {
    constructor(client) {
        super(client, {
            name: "standings",
            description: "Spieler zur division hinzufügen ",
            category: Category.UTILITIES,
            default_member_permissions: PermissionsBitField.Flags.Administrator,
            dm_permession: true,
            cooldown: 3,
            options: [
                {
                    name: "competition",
                    description: "Name der Competition",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                },
            ]
        });
    }
    async execute(interaction) {
        console.log(interaction.options.getString("competition"));
    }
    async autocomplete(interaction) {
        console.log("test");
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name === "competition") {
            const competitions = await Competition.find({
                guildId: interaction.guildId
            });
            const choices = [];
            console.log(competitions);
            competitions.forEach((competition) => {
                choices.push({ name: competition.competitionName, value: competition.competitionId });
            });
            interaction.respond(choices);
        }
    }
}
//# sourceMappingURL=Standings.js.map