import IPlayerResult from "./IPlayerResult.js";
export default interface IMatch {
    divisionId: string;
    playerOne: string;
    playerTwo: string;
    gamePlayedAndConfirmed: boolean;
    playerResults: IPlayerResult[];
    matchDay: number;
}
//# sourceMappingURL=IMatch.d.ts.map