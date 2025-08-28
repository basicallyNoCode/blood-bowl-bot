import ConfirmRections from "../enums/ConfirmReactions.js";

export default interface IConfirmReaction {
    reactionId: string,
    authorId: string,
    reaction: ConfirmRections;
}