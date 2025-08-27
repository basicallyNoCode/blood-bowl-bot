export default class Event {
    client;
    name;
    description;
    once;
    constructor(client, options) {
        this.client = client;
        this.name = options.name;
        this.description = options.description;
        this.once = options.once;
    }
    execute(...args) { }
    ;
}
//# sourceMappingURL=Event.js.map