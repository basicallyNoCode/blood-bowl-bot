import { model, ObjectId, Schema } from "mongoose";
import IConfirmReaction from "../interfaces/IConfirmReaction.js";


interface IConfirmReactionEntry extends IConfirmReaction{
    matchResultId: string
}

export default model<IConfirmReactionEntry>("ConfirmReactionEntry", new Schema<IConfirmReactionEntry>({
    matchResultId: { type: String, required: true }, // Reference to the match
    authorId: { type: String, required: true },
    agreed: { type: Boolean, required: true },
},
))