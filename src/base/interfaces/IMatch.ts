import IPlayerResult from "./IPlayerResult.js";

export default interface IMatch{
    divisonId: string,
    playerOne: string,
    playerTwo: string,
    gamePlayedAndConfirmed: boolean,
    winner: string | undefined,
    playerResults: IPlayerResult[],
    matchDay: number,
}