export default class Command {
    client;
    name;
    description;
    category;
    options;
    default_member_permissions;
    dm_permession;
    cooldown;
    constructor(client, options) {
        this.client = client;
        this.name = options.name;
        this.description = options.description;
        this.category = options.category;
        this.options = options.options;
        this.default_member_permissions = options.default_member_permissions;
        this.dm_permession = options.dm_permession;
        this.cooldown = options.cooldown;
    }
    execute(interaction) {
    }
    autocomplete(interaction) {
    }
}
//# sourceMappingURL=Command.js.map