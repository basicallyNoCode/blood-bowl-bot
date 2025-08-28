import { Events, REST, Routes } from "discord.js";
import Event from "../../base/classes/Event.js";
import dotenv from "dotenv";
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
        dotenv.config();
        const commands = this.getJson(this.client.commands);
        const rest = new REST().setToken(process.env.TOKEN);
        const setCommands = await rest.put(Routes.applicationCommands(this.client.config.discordClientId), {
            body: commands
        });
        console.log(`successfully set ${setCommands.length} commands!`);
    }
    getJson(commands) {
        const data = [];
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