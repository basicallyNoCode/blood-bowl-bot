import { model, Schema } from "mongoose";
export default model("Match", new Schema({
    divisonId: { type: String, required: true },
    playerOne: { type: String, required: true },
    playerTwo: { type: String, required: true },
    gamePlayedAndConfirmed: { type: Boolean, required: true },
    playerResults: [{ type: Schema.Types.ObjectId, ref: "PlayerResult" }],
    winner: { type: String },
    matchDay: { type: Number, required: true }
}, {
    timestamps: true
}));
//# sourceMappingURL=Match.js.map