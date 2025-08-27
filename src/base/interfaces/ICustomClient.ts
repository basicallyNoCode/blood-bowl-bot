import IConfig from "./IConfig.js"

export default interface ICustomClient{
    config: IConfig;

    init(): void;
    LoadHandlers(): void;
}