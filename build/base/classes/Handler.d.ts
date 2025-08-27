import CustomClient from "./CustomClient.js";
import IHandler from "../interfaces/IHandler.js";
export default class Handler implements IHandler {
    client: CustomClient;
    constructor(client: CustomClient);
    LoadEvents(): Promise<void>;
}
//# sourceMappingURL=Handler.d.ts.map