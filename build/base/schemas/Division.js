import { model, Schema } from "mongoose";
export default model("Division", new Schema({
    guildId: { type: String, required: true }, // Reference to the match
    divisionId: { type: String, required: true, unique: true },
    divisionAttendents: [{ type: Schema.Types.ObjectId, ref: "DivisionAttendend" }],
    matches: [{ type: Schema.Types.ObjectId, ref: "Match" }]
}, {
    timestamps: true
}));
//# sourceMappingURL=Division.js.map