import { model, Schema } from "mongoose";
import IMatch from "../interfaces/IMatch.js";

export default model<IMatch>("Match", new Schema<IMatch>({
    divisionId: {type: String, required: true},
    playerOne: {type: String, required: true},
    playerTwo: {type: String, required: true},
    gamePlayedAndConfirmed: {type: Boolean, required: true},
    playerResults: [{type: Schema.Types.ObjectId, ref: "PlayerResult"}],
    matchDay: {type: Number, required:true}
},
))