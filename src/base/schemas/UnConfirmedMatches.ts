import { model, ObjectId, Schema } from "mongoose";
import IMatchResult from "../interfaces/IMatchResult.js";


export default model<IMatchResult>("UnConfirmedMatches", new Schema<IMatchResult>(
    {
        matchResultId: { type: String, required: true, unique: true },
        authorId: { type: String, required: true },
        opponentId: { type: String, required: true },
        tdFor: { type: Number, required: true },
        tdAgainst: { type: Number, required: true },
        casFor: { type: Number, required: true },
        casAgainst: { type: Number, required: true },
        confirmReactions: [
            { type: Schema.Types.ObjectId, ref: "ConfirmReactionEntry" },
        ],
        matchDay: {type: Number, required: true}
    },
    {
        timestamps: true,
    }
))