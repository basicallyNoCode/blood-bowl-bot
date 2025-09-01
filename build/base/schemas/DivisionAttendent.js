import { model, Schema } from "mongoose";
export default model("DivisionAttendend", new Schema({
    divisionId: { type: String, required: true },
    userId: { type: String, required: true },
    shownName: { type: String, required: true },
    casDiff: { type: Number },
    tdDiff: { type: Number },
    points: { type: Number }
}));
//# sourceMappingURL=DivisionAttendent.js.map