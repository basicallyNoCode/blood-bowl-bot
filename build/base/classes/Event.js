"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Event {
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
exports.default = Event;
//# sourceMappingURL=Event.js.map