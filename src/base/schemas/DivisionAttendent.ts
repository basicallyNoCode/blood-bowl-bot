import { model, Schema } from "mongoose";
import IDivisionAttendent from "../interfaces/IDivisionAttendent.js";

export default model<IDivisionAttendent>("DivisionAttendend", new Schema<IDivisionAttendent>({
    divisionId: { type: String, required: true }, 
    userId: {type: String, required: true },
    shownName: {type: String, required: true},
    tdFor: { type: Number, default:0 },
    tdAgainst: { type: Number, default:0 },
    casFor: { type: Number, default:0 },
    casAgainst: { type: Number, default:0 },
    points: { type: Number, default:0 }

},
))