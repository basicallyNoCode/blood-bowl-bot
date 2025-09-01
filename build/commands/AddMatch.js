import { ApplicationCommandOptionType, MessageFlags, PermissionsBitField } from "discord.js";
import Command from "../base/classes/Command.js";
import Category from "../base/enums/Category.js";
import Competition from "../base/schemas/Competition.js";
import Division from "../base/schemas/Division.js";
import Match from "../base/schemas/Match.js";
export default class AddAttendend extends Command {
    constructor(client) {
        super(client, {
            name: "addmatch",
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
                    required: true
                },
                {
                    name: "division-name",
                    description: "Name der Divisionsname",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "player1",
                    description: "Erster Spieler",
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "player2",
                    description: "Zweiter Spieler",
                    type: ApplicationCommandOptionType.User,
                    required: true
                },
                {
                    name: "matchday",
                    description: "Spieltag der begegnung",
                    type: ApplicationCommandOptionType.Number,
                    required: true
                }
            ]
        });
    }
    async execute(interaction) {
        const divisionName = interaction.options.getString("division-name");
        const competitionName = interaction.options.getString("competition");
        const playerOne = interaction.options.getUser("player1");
        const playerTwo = interaction.options.getUser("player2");
        const competition = await Competition.findOne({ competitionId: `${interaction.guildId}-${competitionName}`, active: true });
        if (!competition) {
            interaction.reply(`Die angegebene Competition ${competitionName} existiert nicht oder ist nicht mehr Aktiv`);
            return;
        }
        const division = await Division.findOne({ divisionId: `${competition.competitionId}-${interaction.options.getString("division-name")}` }).populate("divisionAttendents");
        if (!division) {
            interaction.reply(`Die angegebene Division ${interaction.options.getString("division-name")} existiert nicht`);
            return;
        }
        if (division.divisionAttendents.filter((dA) => { return dA.userId === playerOne?.id || dA.userId === playerTwo?.id; }).length < 2) {
            interaction.reply(`Die user ${playerOne?.displayName} und ${playerTwo?.displayName} sind nicht Teil der Division bitte erst Teilnehmer der Division hinzufügen mit dem /addattendend command`);
        }
        try {
            const match = new Match({
                divisionId: `${competition.competitionId}-${interaction.options.getString("division-name")}`,
                playerOne: playerOne?.id,
                playerTwo: playerTwo?.id,
                gamePlayedAndConfirmed: false,
                playerResults: [],
                matchDay: interaction.options.getNumber("matchday")
            });
            await match.save();
            //@ts-ignore cant get rid of this
            division.matches.push(match._id);
            await division.save();
            interaction.reply(`Das Match ${interaction.options.getUser("player1")?.displayName} gegen ${interaction.options.getUser("player2")?.displayName} wurde der Division ${divisionName} in der Competition ${competitionName} hinzugefügt`);
        }
        catch (error) {
            console.error(error);
            interaction.reply({ content: `Fehler beim schreiben in die Datenbank`, flags: [MessageFlags.Ephemeral] });
        }
    }
}
//# sourceMappingURL=AddMatch.js.map