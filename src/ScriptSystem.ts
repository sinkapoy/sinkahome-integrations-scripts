import { commandsHolder } from "@sinkapoy/home-integrations-commands";
import { ArrayMap, HomeSystem, IProperty, uniqueArray, uuidT } from "@sinkapoy/home-core";
import { IHomeSystemScript } from "./interfaces";
import { IScriptSystemEvents } from "./events";
import { Entity } from "@ash.ts/ash";
import path, { join } from "path";

export class ScriptSystem extends HomeSystem<IScriptSystemEvents> {
    private propertiesTriggers = new Map<uuidT, ArrayMap<string, IHomeSystemScript[]>>();
    private modulesToUpdate: IHomeSystemScript[] = [];
    onInit(): void {
        this.setupEvent('addScript', this.onScriptAdd.bind(this));
        this.setupEvent('gadgetPropertyEvent', this.onPropertyNotification.bind(this));
        this.engine.emit('listDir', 'server-data/scripts');
        this.setupEvent('dirFiles', (dir: string, files: string[])=>{
            if(dir === 'server-data/scripts'){
                for(let i =0; i < files.length; i++){
                    this.engine.emit('addScript', join('server-data/scripts/', files[i]));
                }
            }
        });
    }

    onDestroy(): void {
        
    }

    onUpdate(dt: number): void {
        if(this.modulesToUpdate.length){
            const modules = uniqueArray(this.modulesToUpdate);
            this.modulesToUpdate.splice(0);
            for(let i = 0; i < modules.length; i++){
                modules[i].runner(commandsHolder);
            }
        }
        
    }

    onScriptAdd(url: string){
        try{
            console.log('added script', );
            const module = require(path.resolve(url)) as Partial<IHomeSystemScript>;
            // todo: logging
            if(!module.runner) return;
            if(!module.triggers) return;
            
            if(module.setup){
                module.setup(commandsHolder)
            }

            if(module.triggers.properties){
                for(const subscription of module.triggers.properties){
                    let map = this.propertiesTriggers.get(subscription.uuid);
                    if(!map) {
                        map = new ArrayMap<string, IHomeSystemScript[]>();
                        this.propertiesTriggers.set(subscription.uuid, map);
                    }
                    map.get(subscription.propId).push(module as IHomeSystemScript);
                }
            }
        }
        catch (e){
            console.log(e);
            // todo: logging
        }
    }

    onPropertyNotification(gadget: Entity, property: IProperty){
        const map = this.propertiesTriggers.get(gadget.name);
        if(!map) return;
        if(map.has(property.id)){
            const modules = map.get(property.id);
            for(const module of modules){
                this.modulesToUpdate.push(module);
            }
        }
    }
}
