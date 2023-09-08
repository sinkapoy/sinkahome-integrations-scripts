import { IHomeCoreEvents } from "@sinkapoy/home-core";

export interface IScriptSystemEvents extends IHomeCoreEvents {
    "addScript": [path: string],
}