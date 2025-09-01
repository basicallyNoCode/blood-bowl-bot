import { model, Schema } from "mongoose";
export default model("Match", new Schema({
    divisionId: { type: String, required: true },
    playerOne: { type: String, required: true },
    playerTwo: { type: String, required: true },
    gamePlayedAndConfirmed: { type: Boolean, required: true },
    playerResults: [{ type: Schema.Types.ObjectId, ref: "PlayerResult" }],
    matchDay: { type: Number, required: true }
}, {
    timestamps: true
}));
//# sourceMappingURL=Match.js.map