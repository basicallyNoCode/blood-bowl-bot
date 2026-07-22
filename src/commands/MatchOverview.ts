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
import IMatch from "../base/interfaces/IMatch.js";

export default class Standings extends Command{
    constructor(client: CustomClient){
        super(client, {
            name:"match-overview",
            description: "Übersicht über alle matches",
            category: Category.UTILITIES,
            default_member_permissions: PermissionsBitField.Flags.Administrator,
            dm_permession: true,
            cooldown: 600,
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
            const divisions = await Division.find({competitionId: competitionId}).populate("matches");
            if(divisions.length ===0 ){
                await interaction.reply(`Die angegebene Competition hat keine Divisionen`)
                return
            }
            const filteredDivisions = divisions.filter((div)=>{return div.matches.length >= 0})
            const divisionMatchDays = new Collection<string,Collection<number,IMatch[]>>;
            for(const fDiv of filteredDivisions){
                const matchDayCollection = new Collection<number, IMatch[]>;
                for(const match of fDiv.matches){
                    if (!matchDayCollection.has(match.matchDay)) {
                        matchDayCollection.set(match.matchDay, []);
                      }
                      matchDayCollection.get(match.matchDay)?.push(match);
                } 
                const divName = fDiv.divisionId.split("-").pop();
                divisionMatchDays.set(divName!, matchDayCollection);
            }
            const html = this.generateOuterHtml(divisionMatchDays);
            const pdfBuffer = await this.generatePDFBuffer(html);
            const currentDate = new Date()
            const dateString = currentDate.toLocaleDateString("de", {month:"2-digit", day:"2-digit", year: "numeric", })
            const fileString = dateString.split('.').join('-');
            const file = new AttachmentBuilder(pdfBuffer).setName(`${competition.competitionName}-${fileString}.pdf`)
            await interaction.editReply({content: `@everyone Die Aktuelle Tabelle für die Competition ${competition.competitionName}`, files:[file]})
            const message = await interaction.fetchReply();
            const pinnedMessages = await interaction.channel?.messages.fetchPins();
            pinnedMessages?.items.forEach((item) => {
                if (item.message.author.id === this.client.user!.id){
                    item.message.unpin();
                }
            })
            message.pin()
        }catch(error){
            await interaction.editReply("Es ist ein fehler aufgetreten, Versuche es später erneut")
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

    private generateOuterHtml(divMatchDays : Collection<string, Collection<number, IMatch[]>>){
        const divisionTablesHtml = divMatchDays.map((standings, division)=>{
            const divisionTable = this.generateDivisionRows(division, standings);
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
                        th, td { border: 0 0 1px 0 solid #6e6c6b; padding: 20px; text-align: left; },
                        th { background-color: #e0dede; }
                        tr:nth-child(even) { background-color: #e0dede; }
                    </style>
                </head>
                <body> 
                    <h1>Gespielte Matches: </h1>
                    ${divisionTablesHtml}
                </body>
            </html>
        `
    }

    private generateDivisionRows(division: string, matchDayMatches: Collection<number, IMatch[]>){
            const rows = matchDayMatches.map((match, matchday)=>{
                const matchdayTable = this.generateMatchDayRows(matchday, match);
                return `${matchdayTable}`
            }).join("")
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

    private generateMatchDayRows(matchday: number ,matches: IMatch[]){
        const rows = matches.map((matches)=>{
            return `
                <tr>
                    
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
                printBackground: true,
                landscape:true,
            })
            return Buffer.from(pdfBuffer);
        }finally{
            browser.close();
        }
    }
    
    private getStickerRotation(){
        return (Math.random() * 10 - 5).toFixed(1);
    }
}

