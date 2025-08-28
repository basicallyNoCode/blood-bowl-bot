import IConfirmReaction from "./IConfirmReaction.js";
export default interface IMatchResult {
    matchResultId: string;
    authorId: string;
    opponentId: string;
    tdFor: number;
    tdAgainst: number;
    casFor: number;
    casAgainst: number;
    confirmReactions: IConfirmReaction[];
}
//# sourceMappingURL=IMatchResult.d.ts.map