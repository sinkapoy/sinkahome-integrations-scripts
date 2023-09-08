import { homeEngine } from "@sinkapoy/home-core";
import { ScriptSystem } from "./ScriptSystem";

homeEngine.addSystem(new ScriptSystem(), Number.MAX_SAFE_INTEGER);