import { ApplicationCommandOptionType, MessageFlags, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command.js";
import Category from "../base/enums/Category.js";
import Competition from "../base/schemas/Competition.js";
export default class AddAttendend extends Command {
    constructor(client) {
        super(client, {
            name: "removecompetition",
            description: "Competition Löschen nur inaktive Competitions können gelöscht werden",
            category: Category.UTILITIES,
            default_member_permissions: PermissionsBitField.Flags.Administrator,
            dm_permession: true,
            cooldown: 3,
            options: [
                {
                    name: "competition",
                    description: "Name der Competition",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
            ]
        });
    }
    async execute(interaction) {
        const competitionName = interaction.options.getString("competition");
        const competition = await Competition.findOne({ competitionId: `${interaction.guildId}-${competitionName}`, active: false });
        if (!competition) {
            interaction.reply(`Die angegebene Competition ${competitionName} existiert nicht oder ist noch Aktiv. Bitte erst Competition deaktivieren`);
            return;
        }
        //@ts-ignore cant get rid of this
        try {
            competition.active = false;
            competition.save();
            interaction.reply(`Die Competition ${competitionName} wurde deaktiviert`);
        }
        catch (error) {
            console.error(error);
            interaction.reply({ content: `Fehler beim schreiben in die Datenbank`, flags: [MessageFlags.Ephemeral] });
        }
    }
}
//# sourceMappingURL=RemoveCompetition.js.map