import { Collection } from "discord.js";
import ConfirmRections from "../enums/ConfirmReactions.js";
import IConfirmReaction from "./IConfirmReaction.js";
import { ObjectId } from "mongoose";

export default interface IMatchResult{
    matchResultId: string,
    authorId: string,
    opponentId: string,
    tdFor: number,
    tdAgainst: number,
    casFor: number,
    casAgainst: number,
    confirmReactions: IConfirmReaction[],
}