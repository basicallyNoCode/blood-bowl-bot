import { model, Schema } from "mongoose";
export default model("ConfirmReactionEntry", new Schema({
    matchResultId: { type: String, required: true }, // Reference to the match
    authorId: { type: String, required: true },
    agreed: { type: Boolean, required: true },
}));
//# sourceMappingURL=ConfirmReactionEntry.js.map