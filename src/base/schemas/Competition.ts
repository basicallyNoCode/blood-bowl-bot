import { model, Schema } from "mongoose";
import ICompetition from "../interfaces/ICompetition.js";

export default model<ICompetition>("Competition", new Schema<ICompetition>({
    guildId: { type: String, required: true }, // Reference to the match
    competitionId: {type: String, required: true, unique: true},
    active: {type: Boolean, required: true},
    winPoints: {type: Number, required: true, default: 0},
    drawPoints: {type: Number, required: true, default: 0},
    lossPoints: {type: Number, default: 0},
    divisions: [{ type: Schema.Types.ObjectId, ref: "Division" }],
    competitionName: {type: String, required: true},
},
))