import { PermissionsBitField, TextInputStyle } from "discord.js";
import Command from "../base/classes/Command.js";
import Category from "../base/enums/Category.js";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from "@discordjs/builders";
import Competition from "../base/schemas/Competition.js";
export default class CreateDivison extends Command {
    constructor(client) {
        super(client, {
            name: "createdivision",
            description: "Division erstellen",
            category: Category.UTILITIES,
            default_member_permissions: PermissionsBitField.Flags.Administrator,
            dm_permession: true,
            cooldown: 3,
            options: []
        });
    }
    async execute(interaction) {
        const modal = new ModalBuilder().setCustomId(`competition-${interaction.user?.id}`).setTitle("Competition");
        const competitionNameInput = new TextInputBuilder().setCustomId("competitionNameInput").setLabel("Unique Name der Competition").setStyle(TextInputStyle.Short);
        const winPointsInput = new TextInputBuilder().setCustomId("winPointsInput").setLabel("Punkte bei Sieg").setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(2);
        const drawPointsInput = new TextInputBuilder().setCustomId("drawPointsInput").setLabel("Punkte Bei Unentschieden").setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(2);
        const lossPointsInput = new TextInputBuilder().setCustomId("lossPointsInput").setLabel("Punkte für Niederlage").setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(2);
        const firstActionRow = new ActionRowBuilder().addComponents(competitionNameInput);
        const secondActionRow = new ActionRowBuilder().addComponents(winPointsInput);
        const thirdActionRow = new ActionRowBuilder().addComponents(drawPointsInput);
        const fourthActionRow = new ActionRowBuilder().addComponents(lossPointsInput);
        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);
        await interaction.showModal(modal);
        const filter = (interaction) => interaction.customId === `competition-${interaction.user?.id}`;
        // wait for modal submit 
        interaction
            .awaitModalSubmit({ filter, time: 360000 })
            .then(async (modalInteraction) => {
            const nameValue = modalInteraction.fields.getTextInputValue("competitionNameInput");
            const winPointsValue = modalInteraction.fields.getTextInputValue("winPointsInput");
            const drawPointsValue = modalInteraction.fields.getTextInputValue("drawPointsInput");
            const lossPointsValue = modalInteraction.fields.getTextInputValue("lossPointsInput");
            if (Number.isNaN(winPointsValue) || Number.isNaN(drawPointsValue) || Number.isNaN(lossPointsValue)) {
                modalInteraction.reply("Es ist ein fehler aufgetreten bitte stelle sicher, dass die Punkte Angaben in Zahlen sind");
                return;
            }
            console.log("win: ", parseInt(winPointsValue), " draw: ", parseInt(drawPointsValue), " loss: ", parseInt(lossPointsValue));
            await Competition.create({
                guildId: interaction.guildId,
                competitionId: interaction.guildId + nameValue,
                divisions: [],
                winPoints: parseInt(winPointsValue),
                drawPoints: parseInt(drawPointsValue),
                lossPointsValue: parseInt(lossPointsValue) ? parseInt(lossPointsValue) : 0,
                active: false,
            });
            modalInteraction.reply(`Competition ${nameValue} wurde angelegt`);
        }).catch((error) => console.error(error));
    }
}
//# sourceMappingURL=CreateDivisionModal.js.map