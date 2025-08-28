import { model, Schema } from "mongoose";
export default model("ConfirmReaction", new Schema({
    reactionId: String,
    authorId: String,
    reaction: String,
}, {
    timestamps: true
}));
//# sourceMappingURL=ConfrimReaction.js.map