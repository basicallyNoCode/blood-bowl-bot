import { model, Schema } from "mongoose";
export default model("Competition", new Schema({
    guildId: { type: String, required: true }, // Reference to the match
    competitionId: { type: String, required: true, unique: true },
    active: { type: Boolean, required: true },
    winPoints: { type: Number, required: true },
    drawPoints: { type: Number, required: true },
    lossPoints: { type: Number },
    divisions: [{ type: Schema.Types.ObjectId, ref: "Division" }],
    competitionName: { type: String, required: true },
}));
//# sourceMappingURL=Competition.js.map