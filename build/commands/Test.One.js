import SubCommand from "../base/classes/SubCommand.js";
export default class TestOne extends SubCommand {
    constructor(client) {
        super(client, {
            name: "test.one",
        });
    }
    execute(interaction) {
        interaction.reply({ content: "test 1 war erfolgreich" });
    }
}
//# sourceMappingURL=Test.One.js.map