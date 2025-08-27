import path from "path";
import { glob } from "glob";
export default class Handler {
    client;
    constructor(client) {
        this.client = client;
    }
    async LoadEvents() {
        const files = (await glob(`build/events/**/*.js`))
            .map(filePath => path.resolve(filePath));
        for (const file of files) {
            try {
                const module = await import(`file://${file}`);
                if (typeof module.default !== "function") {
                    throw new Error(`The default export of file ${file} is not a constructor`);
                }
                const event = new module.default(this.client);
                if (!event.name) {
                    console.log(`${file.split("/").pop()} does not have a name.`);
                    return;
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
            }
            catch (error) {
                console.error(error);
            }
        }
    }
}
//# sourceMappingURL=Handler.js.map