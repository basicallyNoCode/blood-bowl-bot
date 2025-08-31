import { model, Schema } from "mongoose";
import IDivision from "../interfaces/IDivision.js";

export default model<IDivision>("Division", new Schema<IDivision>({
    guildId: { type: String, required: true }, // Reference to the match
    divisionId: {type: String, required: true, unique: true},
    divisionAttendents: [{type: Schema.Types.ObjectId, ref: "DivisionAttendend"}],
    matches: [{type: Schema.Types.ObjectId, ref: "Match"}]

},
{
    timestamps: true
}))