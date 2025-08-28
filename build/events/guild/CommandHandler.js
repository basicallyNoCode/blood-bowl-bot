import { Collection, Events } from "discord.js";
import Event from "../../base/classes/Event.js";
import { EmbedBuilder } from "@discordjs/builders";
export default class CommandHandler extends Event {
    constructor(client) {
        super(client, {
            name: Events.InteractionCreate,
            description: "Command Handler Event",
            once: false
        });
    }
    execute(interaction) {
        if (!interaction.isChatInputCommand()) {
            return;
        }
        const command = this.client.commands.get(interaction.commandName);
        if (!command) {
            interaction.reply({ content: "Dieser command existiert nicht" });
            this.client.commands.delete(interaction.commandName);
            return;
        }
        const { cooldowns } = this.client;
        if (!cooldowns.has(command.name)) {
            cooldowns.set(command.name, new Collection());
        }
        const now = Date.now();
        const timestamps = cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;
        if (timestamps.has(interaction.user.id)
            && (now < (timestamps.get(interaction.user.id) || 0) + cooldownAmount)) {
            const cooldownRemaining = ((((timestamps.get(interaction.user.id) || 0) + cooldownAmount) - now) / 1000).toFixed(1);
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setDescription(`Dieses Command kann aktuell nicht benutzt werden bitte warte \`${cooldownRemaining}\` seconds`)
                ],
                ephemeral: true,
            });
            return;
        }
        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
        try {
            const subCommandGroup = interaction.options.getSubcommandGroup(false);
            const subCommand = `${interaction.commandName}${subCommandGroup ? `.${subCommandGroup}` : ""}.${interaction.options.getSubcommand(false) || ""}`;
            this.client.subCommands.get(subCommand)?.execute(interaction) || command.execute(interaction);
        }
        catch (error) {
            console.error(error);
        }
    }
}
//# sourceMappingURL=CommandHandler.js.map