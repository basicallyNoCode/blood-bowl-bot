import CustomClient from "./CustomClient";
import IHandler from "../interfaces/IHandler";
export default class Handler implements IHandler {
    client: CustomClient;
    constructor(client: CustomClient);
    LoadEvents(): Promise<void>;
}
//# sourceMappingURL=Handler.d.ts.map