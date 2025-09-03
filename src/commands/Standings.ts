import {ApplicationCommandOptionType, AttachmentBuilder, AutocompleteInteraction, ChatInputCommandInteraction, Collection, MessageFlags, PermissionsBitField, TextInputStyle } from "discord.js";
import Command from "../base/classes/Command.js";
import CustomClient from "../base/classes/CustomClient.js";
import Category from "../base/enums/Category.js";
import Competition from "../base/schemas/Competition.js";
import { IChoice } from "../base/interfaces/IChoice.js";
import Division from "../base/schemas/Division.js";
import IStanding from "../base/interfaces/IStanding.js";
import DivisionAttendent from "../base/schemas/DivisionAttendent.js";
import puppeteer from "puppeteer";

export default class Standings extends Command{
    constructor(client: CustomClient){
        super(client, {
            name:"standings",
            description: "Tabelle ausgeben ",
            category: Category.UTILITIES,
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            dm_permession: true,
            cooldown: 3,
            options: [
                {
                    name: "competition",
                    description: "Name der Competition",
                    type: ApplicationCommandOptionType.String,
                    required: true,
                    autocomplete: true
                },
            ]
        })
    }

    async execute(interaction: ChatInputCommandInteraction){
        try{
            await interaction.deferReply();
            const competitionId = interaction.options.getString("competition");
            const competition = await Competition.findOne({competitionId: competitionId})
            
            if(!competition){
                await interaction.reply(`Die angegebene Competition existiert nicht oder ist nicht mehr Aktiv`)
                return
            }
            const divisions = await Division.find({competitionId: competitionId}).populate("divisionAttendents");
            if(divisions.length ===0 ){
                await interaction.reply(`Die angegebene Competition hat keine Divisionen`)
                return
            }
            const standings : Collection<string, IStanding[]> = new Collection();
            const filteredDivisions = divisions.filter((div)=>{return div.divisionAttendents.length >= 2 && div.matches.length >= 2})
            for(const fDiv of filteredDivisions){
                const divStandings: IStanding[] = [];
                const sortedAttendents = await DivisionAttendent.aggregate([
                    {
                        $match: { divisionId: fDiv.divisionId }
                    },
                    {
                        $addFields: {
                        tdDiff: { $subtract: ["$tdFor", "$tdAgainst"] },
                        casDiff: { $subtract: ["$casFor", "$casAgainst"] }
                        }
                    },
                    {
                        $sort: {
                        points: -1,     // highest points first
                        tdDiff: -1,     // then tdDiff
                        casDiff: -1     // then casDiff
                        }
                    }
                ]);

                let currentRank = 1;
                if(sortedAttendents.length > 0){
                    sortedAttendents.forEach((attendent, index)=>{
                        if(index >0){
                            const prevAttendent = sortedAttendents[index - 1]
                            const tiedRank = ( attendent.points === prevAttendent.points
                            && (attendent.tdFor - attendent.tdAgainst) === (prevAttendent.tdFor - prevAttendent.tdAgainst)
                            && (attendent.casFor - attendent.casAgainst) === (prevAttendent.casFor - prevAttendent.casAgainst)
                            )

                            if(!tiedRank){
                                currentRank = index + 1
                            }
                        }
                        divStandings.push({
                            playerName: attendent.shownName,
                            rank: currentRank,
                            points: attendent.points ?? 0,
                            tdDiff: (attendent.tdFor ?? 0) - (attendent.tdAgainst ?? 0),
                            casDiff: (attendent.casFor ?? 0) - (attendent.casAgainst ?? 0),
                            wins: attendent.wins ?? 0,
                            draws: attendent.draws ?? 0,
                            losses: attendent.losses,
                            matchesPlayed: (attendent.wins ?? 0) + (attendent.draws ?? 0) + (attendent.losses ?? 0)
                        })
                    })
                } 
                const divName = fDiv.divisionId.split("-").pop();
                if(divStandings.length > 0 && divName){
                    standings.set(divName, divStandings);
                }
            }
            const html = this.generateOuterHtml(standings);
            const pdfBuffer = await this.generatePDFBuffer(html);
            const currentDate = new Date()
            const dateString = currentDate.toLocaleDateString("de", {month:"2-digit", day:"2-digit", year: "numeric", })
            const fileString = dateString.split('.').join('-');
            const file = new AttachmentBuilder(pdfBuffer).setName(`${competition.competitionName}-${fileString}.pdf`)
            await interaction.editReply({content: `@here Die Aktuelle Tabelle für die Competition ${competition.competitionName}`, files:[file]})
        }catch(error){
            await interaction.reply("Es ist ein fehler aufgetreten, Versuche es später erneut")
            console.error(error);
        }
    }
    
    async autocomplete(interaction: AutocompleteInteraction) {
     
        const focusedOption = interaction.options.getFocused(true);
        if(focusedOption.name === "competition"){
            const competitions = await Competition.find({
                guildId: interaction.guildId
            })
            const choices: IChoice[] =[];
            
            competitions.forEach((competition)=>{
                choices.push({name: competition.competitionName, value: competition.competitionId})
            })
            interaction.respond(choices)
        }
    }

    private generateOuterHtml(standings : Collection<string, IStanding[]>){
        const divisionTablesHtml = standings.map((standings, division)=>{
            const divisionTable = this.generateDivsionStandingTable(division, standings);
            return `${divisionTable}`
        }).join("")
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <style>
                        body {font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #333; text-align: center; }
                        h2 { color: #333; text-align: center; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 0 0 1px 0 solid #6e6c6b; padding: 8px; text-align: left; },
                        th { background-color: #e0dede; }
                        tr:nth-child(even) { background-color: #e0dede; }
                    </style>
                </head>
                <body> 
                    <h1>Tabelle: </h1>
                    ${divisionTablesHtml}
                </body>
            </html>
        `
    }

    private generateDivsionStandingTable(division: string, standings: IStanding[]){
            const rows = this.generateDivisionStandingRowsHtml(standings);
            return `
                <h2>${division}</h2>
                <table>
                    <thead>
                        <th>Platzierung</th>
                        <th>Spieler Name</th>
                        <th>Punkte</th>
                        <th>TD Diff</th>
                        <th>Cas Diff</th>
                        <th>Spiele</th>
                        <th>W</th>
                        <th>D</th>
                        <th>L</th>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbod>
                </table>`
    }

    private generateDivisionStandingRowsHtml(standings: IStanding[]){
        const rows = standings.map((standing)=>{
            return `
                <tr>
                    <td>${standing.rank}</td>
                    <td>${standing.playerName}</td>
                    <td>${standing.points}</td>
                    <td>${standing.tdDiff}</td>
                    <td>${standing.casDiff}</td>
                    <td>${standing.matchesPlayed}</td>
                    <td>${standing.wins}</td>
                    <td>${standing.draws}</td>
                    <td>${standing.losses?? 0}</td>
                </tr>
            `
        }).join("");
        return rows;
    }

    private async generatePDFBuffer(html: string): Promise<Buffer>{
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        try {
            const page = await browser.newPage();
            await page.setContent(html);
            const pdfBuffer = await page.pdf({
                format: "A4",
                printBackground: true
            })
            return Buffer.from(pdfBuffer);
        }finally{
            browser.close();
        }
    }
}

