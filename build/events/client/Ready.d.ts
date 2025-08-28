import CustomClient from "../../base/classes/CustomClient.js";
import Event from "../../base/classes/Event.js";
export default class Ready extends Event {
    constructor(client: CustomClient);
    execute(): Promise<void>;
    private getJson;
}
//# sourceMappingURL=Ready.d.ts.map