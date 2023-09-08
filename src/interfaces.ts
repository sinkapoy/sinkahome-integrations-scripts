import { uuidT } from "@sinkapoy/home-core";

export interface IHomeSystemScript {
    triggers: {
        properties?: {uuid: uuidT, propId: string}[];
    }
    setup(commands: object): void;
    runner(commands: object): void | Promise<void>;
}