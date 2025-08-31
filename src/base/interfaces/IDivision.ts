import IMatch from "./IMatch.js"
import IDivisionAttendent from "./IDivisionAttendent.js"

export default interface IDivision{
    guildId: string,
    divisionId: string, // Competition id + division name
    divisionAttendents: IDivisionAttendent[],
    matches: IMatch[],
}