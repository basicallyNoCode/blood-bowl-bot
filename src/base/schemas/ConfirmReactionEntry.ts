import { model, ObjectId, Schema } from "mongoose";
import IConfirmReaction from "../interfaces/IConfirmReaction.js";


const confirmReactionSchema = new Schema<IConfirmReaction>({
    matchResultId: { type: String, required: true }, // Reference to the match
    authorId: { type: String, required: true },
    agreed: { type: Boolean, required: true },
})

confirmReactionSchema.index({ matchResultId: 1, authorId: 1 }, { unique: true });

export default model<IConfirmReaction>("ConfirmReactionEntry", confirmReactionSchema)

