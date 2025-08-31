import ConfirmRections from "../enums/ConfirmReactions.js";

export default interface IConfirmReaction {
    authorId: string,
    agreed: boolean;
}