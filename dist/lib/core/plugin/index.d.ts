/// <reference types="node" />
import { IncomingMessage } from "http";
import { RouteValue } from "../../route";
import { ServerResponseX } from "../server";
declare function BeforeRoute(request: IncomingMessage, response: ServerResponseX): Promise<number>;
declare function AfterRoute(request: IncomingMessage, response: ServerResponseX, route: RouteValue): Promise<number>;
declare function AutoRegister(): Object;
declare function RegisterPlugin(plugin_name: string): boolean;
declare function GetRegisteredPlugins(): Array<string>;
declare function GetRegisteredPluginsCount(): [number, number];
export { AutoRegister, BeforeRoute, AfterRoute, RegisterPlugin, GetRegisteredPlugins, GetRegisteredPluginsCount };
