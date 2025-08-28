import { model, ObjectId, Schema } from "mongoose";
import IConfirmReaction from "../interfaces/IConfirmReaction.js";


export default model<IConfirmReaction>("ConfirmReaction", new Schema<IConfirmReaction>({
    reactionId: String,
    authorId: String,
    reaction: String,
},
{
    timestamps: true
}))