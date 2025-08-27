import { ApplicationCommandOptionType, ChatInputCommandInteraction, ComponentType, Events, Message, PermissionsBitField, TextInputStyle } from "discord.js";
import Command from "../base/classes/Command.js";
import CustomClient from "../base/classes/CustomClient.js";
import Category from "../base/enums/Category.js";
import { ActionRowBuilder, ModalBuilder, TextInputBuilder } from "@discordjs/builders";

export default class RecordMatchResultModal extends Command{
    constructor(client: CustomClient){
        super(client, {
            name:"matchresult",
            description: "Spielergebnis eintragen",
            category: Category.UTILITIES,
            default_member_permissions: PermissionsBitField.Flags.UseApplicationCommands,
            dm_permession: true,
            cooldown: 3,
            options: [
                {
                    name: "opponent",
                    description: "Wähle deinen Gegner aus",
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        })
    }

    async execute(interaction: ChatInputCommandInteraction){

        const opponent= interaction.options.getUser("opponent")

        const modal = new ModalBuilder().setCustomId(`matchresult-${interaction.user?.id}`).setTitle("Spielergebnis")

        const casAgainstInput = new TextInputBuilder().setCustomId("casAgainst").setLabel("Gegnerische Casualties").setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(2)

        const tdForInput = new TextInputBuilder().setCustomId("tdForInput").setLabel("Eigene Touchdowns").setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(2)

        const tdAgainstInput = new TextInputBuilder().setCustomId("tdAgainstInput").setLabel("Gegnerische Touchdowns").setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(2)

        const casForInput = new TextInputBuilder().setCustomId("casFor").setLabel("Eigene zugefügte Casualties").setStyle(TextInputStyle.Short).setMinLength(1).setMaxLength(2);

        const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(tdForInput);
        const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(tdAgainstInput);
        const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(casForInput);
        const fourthActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(casAgainstInput);


        modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow)


        await interaction.showModal(modal);

        const filter = (interaction : any) => interaction.customId === `matchresult-${interaction.user?.id}`

        // wait for modal submit 

        interaction
            .awaitModalSubmit({filter, time: 360000})
            .then(async (modalInteraction) => {
                const casForValue = modalInteraction.fields.getTextInputValue("casFor")
                const casAgainstValue = modalInteraction.fields.getTextInputValue("casAgainst")
                const tdForValue = modalInteraction.fields.getTextInputValue("tdForInput")
                const tdAgainstValue = modalInteraction.fields.getTextInputValue("tdAgainstInput")
                const winner = this.determineWinner(interaction.user.username, opponent?.username!, tdForValue, tdAgainstValue);
                let resultString: string = "";
                if(winner === "unenteschieden"){
                 resultString = `wurde mit einem Unentschieden angegeben`
                }else if(winner === null){
                    modalInteraction.reply("Es ist ein fehler aufgetreten bitte stelle sicher, dass deine und die Gegnereischen Touchdowns in zahlen angegeben sind");
                    return
                }else{
                    resultString = `wurde als Sieg für ${winner} angegeben`
                }

                if(Number.isNaN(casAgainstValue) || Number.isNaN(casForValue)){
                    modalInteraction.reply("Es ist ein fehler aufgetreten bitte stelle sicher, dass deine und die Gegnereischen Casualties in zahlen angegeben sind");
                    return
                }

                const casString = `Außerdem wurden ${casForValue} von ${interaction.user} zugefügte Casualties und ${casAgainstValue} von ${opponent} zugefügte Casualties angegeben`;

                modalInteraction.reply({content: `Dein eingegebenes Spielergebnis für die begegnung ${interaction.user} gegen ${opponent}, ${resultString} mit einem Ergebnis von ${interaction.user}: ${tdForValue} und ${opponent}: ${tdAgainstValue}. \n${casString}. \nBitte Angaben bestätigen ${opponent}`, withResponse:true})
                    /*.then(async (messageToBeConfirmed)=> {
                        console.log(messageToBeConfirmed.resource?.message)
                        if (messageToBeConfirmed.resource?.message instanceof Message) {
                            await messageToBeConfirmed.resource?.message.react('👍');
                        }
                    })*/

            }).catch((error)=> console.error(error)) 
    }

    private determineWinner(username: string, opponent: string, tdfor: string, tdAgainst: string): string | null{
        const tdForNumber = parseInt(tdfor);
        const tdAgainstNumber = parseInt(tdAgainst);
        if(Number.isNaN(tdAgainstNumber) || Number.isNaN(tdForNumber)){
            return null
        }
        if(tdForNumber > tdAgainstNumber){
            return username;
        }else if(tdForNumber < tdAgainstNumber){
            return opponent;
        }else{
            return "unentschieden";
        }
    }
}

