import { Events, REST, Routes } from "discord.js";
import Event from "../../base/classes/Event.js";
export default class Ready extends Event {
    constructor(client) {
        super(client, {
            name: Events.ClientReady,
            description: "Ready client",
            once: true
        });
    }
    async execute() {
        console.log(`${this.client.user?.tag} is now ready `);
        const commands = this.getJson(this.client.commands);
        console.log(commands);
        const rest = new REST().setToken(this.client.config.token);
        const setCommands = await rest.put(Routes.applicationGuildCommands(this.client.config.discordClientId, this.client.config.guildId), {
            body: commands
        });
        console.log(`successfully set ${setCommands.length} commands!`);
    }
    getJson(commands) {
        const data = [];
        console.log(commands);
        commands.forEach(command => {
            data.push({
                name: command.name,
                description: command.description,
                options: command.options,
                default_member_permissions: command.default_member_permissions.toString(),
                dm_permission: command.dm_permession
            });
        });
        return data;
    }
}
//# sourceMappingURL=Ready.js.map