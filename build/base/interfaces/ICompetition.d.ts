import IDivision from "./IDivision.js";
export default interface ICompetition {
    guildId: string;
    competitionId: string;
    active: boolean;
    winPoints: number;
    drawPoints: number;
    lossPoints: number;
    divisions: IDivision[];
}
//# sourceMappingURL=ICompetition.d.ts.map