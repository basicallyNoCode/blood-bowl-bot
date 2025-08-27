import { Events } from "discord.js";
import Event from "../../base/classes/Event.js";
export default class Ready extends Event {
    constructor(client) {
        super(client, {
            name: Events.ClientReady,
            description: "Ready client",
            once: true
        });
    }
    execute() {
        console.log(`${this.client.user?.tag} is now ready `);
    }
}
//# sourceMappingURL=Ready.js.map