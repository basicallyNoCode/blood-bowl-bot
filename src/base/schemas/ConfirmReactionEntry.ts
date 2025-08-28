import { model, ObjectId, Schema } from "mongoose";
import IConfirmReaction from "../interfaces/IConfirmReaction.js";


interface IConfirmReactionEntry extends IConfirmReaction{
    reactionId: ObjectId
}

export default model<IConfirmReactionEntry>("ConfirmReactionEntry", new Schema<IConfirmReactionEntry>({
    reactionId: Schema.Types.ObjectId,
    authorId: String,
    reaction: String,
},
{
    timestamps: true
}))