import { model, Schema } from "mongoose";
export default model("ConfirmReactionEntry", new Schema({
    reactionId: String,
    authorId: String,
    reaction: String,
}, {
    timestamps: true
}));
//# sourceMappingURL=ConfirmReactionEntry.js.map