import { model, Schema } from "mongoose";
import IMatchResult from "../interfaces/IMatchResult.js";

const unConfirmedMatchSchema = new Schema<IMatchResult>(
    {
        matchResultId: { type: String, required: true, unique: true },
        authorId: { type: String, required: true },
        opponentId: { type: String, required: true },
        tdFor: { type: Number, required: true, default: 0 },
        tdAgainst: { type: Number, required: true, default: 0 },
        casFor: { type: Number, required: true, default: 0 },
        casAgainst: { type: Number, required: true, default: 0 },
        confirmReactions: [
            { type: Schema.Types.ObjectId, ref: "ConfirmReactionEntry" },
        ],
        matchDay: { type: Number, required: true, default: 0 },
        competitionId: { type: String, required: true },
    },
    {
        timestamps: true,
    }
);

unConfirmedMatchSchema.index(
    { competitionId: 1, matchDay: 1, authorId: 1, opponentId: 1 },
    { unique: true }
);

export default model<IMatchResult>("UnConfirmedMatches", unConfirmedMatchSchema);
