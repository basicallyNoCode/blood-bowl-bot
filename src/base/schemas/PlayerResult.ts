import { model, Schema } from "mongoose";
import IPlayerResult from "../interfaces/IPlayerResult.js";

export default model<IPlayerResult>("PlayerResult", new Schema<IPlayerResult>({
    userId: { type: String, required: true },
    casualties: { type: Number, required: true, default:0 },
    touchdonws: { type: Number, required: true, default:0 },
    divisionId: { type: String, required: true }
},
))