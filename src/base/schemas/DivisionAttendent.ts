import { model, Schema } from "mongoose";
import IDivisionAttendent from "../interfaces/IDivisionAttendent.js";

export default model<IDivisionAttendent>("DivisionAttendend", new Schema<IDivisionAttendent>({
    divisionId: { type: String, required: true }, 
    userId: {type: String, required: true },
    shownName: {type: String, required: true},
    casDiff: { type: Number },
    tdDiff: { type: Number },
    points: { type: Number }

},
))