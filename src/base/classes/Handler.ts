import path from "path";
import { glob } from "glob";
import CustomClient from "./CustomClient";
import Event from "./Event";
import IHandler from "../interfaces/IHandler";

export default class Handler implements IHandler{

    client: CustomClient

    constructor(client: CustomClient){
        this.client = client;
    }

    async LoadEvents() {
        const files = (await glob(`build/event/**/*.js`))
            .map(filePath => path.resolve(filePath));
        files.map(async (file: string)=> {
            const event: Event = new(await import(file)).default(this.client);
            if(!event.name){
                console.log(`${file.split("/").pop()} does not have a name.`)
                return delete require.cache[require.resolve(file)];
            }
            const execute = (...args: any) => event.execute(...args);
            if(event.once){
                //@ts-ignore no  way to get rid of this
                this.client.once(event.name, execute);
            }else{
                //@ts-ignore no  way to get rid of this
                this.client.on(event.name, execute)
            }
            return delete require.cache[require.resolve(file)];
        });
    }

}