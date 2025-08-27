"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const glob_1 = require("glob");
class Handler {
    client;
    constructor(client) {
        this.client = client;
    }
    async LoadEvents() {
        const files = (await (0, glob_1.glob)(`build/event/**/*.js`))
            .map(filePath => path_1.default.resolve(filePath));
        files.map(async (file) => {
            const event = new (await import(file)).default(this.client);
            if (!event.name) {
                console.log(`${file.split("/").pop()} does not have a name.`);
                return delete require.cache[require.resolve(file)];
            }
            const execute = (...args) => event.execute(...args);
            if (event.once) {
                //@ts-ignore no  way to get rid of this
                this.client.once(event.name, execute);
            }
            else {
                //@ts-ignore no  way to get rid of this
                this.client.on(event.name, execute);
            }
            return delete require.cache[require.resolve(file)];
        });
    }
}
exports.default = Handler;
//# sourceMappingURL=Handler.js.map