import { model, ObjectId, Schema } from "mongoose";
import IMatchResult from "../interfaces/IMatchResult.js";


export default model<IMatchResult>("UnConfirmedMatches", new Schema<IMatchResult>({
    matchResultId: String,
    authorId: String,
    opponentId: String,
    tdFor: Number,
    tdAgainst: Number,
    casFor: Number,
    casAgainst: Number,
    confirmReactions: [{type: String, ref: "ConfirmReactionEntry"}],
},
{
    timestamps: true
}))