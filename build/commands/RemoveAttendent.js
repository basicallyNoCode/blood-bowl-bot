import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command.js";
import Category from "../base/enums/Category.js";
import Competition from "../base/schemas/Competition.js";
import Division from "../base/schemas/Division.js";
import DivisionAttendent from "../base/schemas/DivisionAttendent.js";
export default class RemoveDivision extends Command {
    constructor(client) {
        super(client, {
            name: "removeattendend",
            description: "Spieler entfernen",
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
                {
                    name: "division-name",
                    description: "Einzigartiger Divisionsname",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "user",
                    description: "Nutzer",
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        });
    }
    async execute(interaction) {
        const competition = await Competition.findOne({ competitionId: `${interaction.guildId}-${interaction.options.getString("competition")}` })
            .populate('divisions');
        console.log(competition);
        if (!competition) {
            interaction.reply(`Die angegebene Competition ${interaction.options.getString("competition")} existiert nicht`);
            return;
        }
        const division = await Division.findOne({ divisionId: `${competition.competitionId}-${interaction.options.getString("division-name")}` });
        if (!division) {
            interaction.reply(`Die angegebene Division ${interaction.options.getString("division-name")} existiert nicht`);
            return;
        }
        const attendend = await DivisionAttendent.find({
            divisionId: `${competition.competitionId}-${interaction.options.getString("division-name")}`,
            userId: interaction.options.getUser("user")?.id,
        });
        if (attendend.length === 0) {
            interaction.reply(`Die angegebene Division ${interaction.options.getString("division-name")} existiert nicht`);
            return;
        }
        division.divisionAttendents = division.divisionAttendents.filter((dA) => {
            //@ts-ignore cant get rid
            return dA._id.toString() !== attendend[0]._id.toString();
        });
        await division.save();
        await DivisionAttendent.deleteMany({
            divisionId: `${competition.competitionId}-${interaction.options.getString("division-name")}`,
            userId: interaction.options.getUser("user")?.id,
        });
        interaction.reply("Spieler erfolgreich entfernt");
    }
}
//# sourceMappingURL=RemoveAttendent.js.map