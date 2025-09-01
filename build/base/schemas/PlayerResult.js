import { model, Schema } from "mongoose";
export default model("PlayerResult", new Schema({
    userId: { type: String, required: true },
    casualties: { type: Number, required: true },
    touchdonws: { type: Number, required: true },
    divisionId: { type: String, required: true }
}));
//# sourceMappingURL=PlayerResult.js.map