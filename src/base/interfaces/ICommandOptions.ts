import Category from "../enums/Category.js";

export default interface ICommandOptions{
    name: string;
    description:string;
    category: Category;
    options: object;
    default_member_permissions:bigint;
    dm_permession: boolean;
    cooldown: number;
}