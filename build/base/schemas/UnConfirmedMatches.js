import { model, Schema } from "mongoose";
export default model("UnConfirmedMatches", new Schema({
    matchResultId: String,
    authorId: String,
    opponentId: String,
    tdFor: Number,
    tdAgainst: Number,
    casFor: Number,
    casAgainst: Number,
    confirmReactions: [{ type: String, ref: "ConfirmReaction" }],
}, {
    timestamps: true
}));
//# sourceMappingURL=UnConfirmedMatches.js.map