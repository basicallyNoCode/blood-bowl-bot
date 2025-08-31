import { ApplicationCommandOptionType, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command.js";
import Category from "../base/enums/Category.js";
import Competition from "../base/schemas/Competition.js";
import Division from "../base/schemas/Division.js";
export default class CreateDivison extends Command {
    constructor(client) {
        super(client, {
            name: "adddivision",
            description: "Division erstellen",
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
            ]
        });
    }
    async execute(interaction) {
        const divisionName = interaction.options.getString("division-name");
        const competitionName = interaction.options.getString("competition");
        const competition = await Competition.findOne({ competitionId: `${interaction.guildId}-${competitionName}` });
        if (!competition) {
            interaction.reply(`Die angegebene Competition ${competitionName} existiert nicht`);
            return;
        }
        const checkDivisionExists = await Division.findOne({ divisionId: `${competition.competitionId}-${divisionName}` });
        if (checkDivisionExists) {
            interaction.reply(`Die Division ${divisionName} existiert bereits in der Competition ${competitionName}`);
            return;
        }
        const division = new Division({
            divisionId: `${competition.competitionId}-${divisionName}`,
            guildId: interaction.guildId,
            divisionAttendents: [],
            matches: [],
        });
        await division.save();
        //@ts-ignore cant get rid of this
        competition.divisions.push(division._id);
        await competition.save();
        interaction.reply(`Division ${divisionName} wurde in der Competition ${competitionName} angelegt`);
    }
}
//# sourceMappingURL=AddDivision.js.map