/// <reference types="node" />
import { IncomingMessage } from "http";
import { RouteValue } from "../../route";
import { ServerResponseX } from "../server";
declare function BeforeRoute(request: IncomingMessage, response: ServerResponseX, final: (request: IncomingMessage, response: ServerResponseX) => void): void;
declare function AfterRoute(request: IncomingMessage, response: ServerResponseX, route: RouteValue, final: (request: IncomingMessage, response: ServerResponseX) => void): void;
declare function AutoRegister(): Object;
declare function RegisterPlugin(plugin_name: string): boolean;
declare function GetRegisteredPlugins(): Array<string>;
export { AutoRegister, BeforeRoute, AfterRoute, RegisterPlugin, GetRegisteredPlugins };
