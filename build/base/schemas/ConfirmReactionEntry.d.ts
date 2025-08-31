import IConfirmReaction from "../interfaces/IConfirmReaction.js";
interface IConfirmReactionEntry extends IConfirmReaction {
    matchResultId: string;
}
declare const _default: import("mongoose").Model<IConfirmReactionEntry, {}, {}, {}, import("mongoose").Document<unknown, {}, IConfirmReactionEntry, {}, {}> & IConfirmReactionEntry & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=ConfirmReactionEntry.d.ts.map