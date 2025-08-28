import SubCommand from "../base/classes/SubCommand.js";
export default class TestTwo extends SubCommand {
    constructor(client) {
        super(client, {
            name: "test.two",
        });
    }
    execute(interaction) {
        interaction.reply({ content: "test 2 war erfolgreich" });
    }
}
//# sourceMappingURL=Test.Two.js.map