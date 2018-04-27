import { Route } from "./dist/lib/route/route";
import { TLSConfiguration } from "./dist/lib/core/global";
import { LogOption } from "./lib/core/global";

export declare function Run(config: ServerHubConfig, appstart: (route: Route) => void): void;

export declare interface ServerHubConfig {
    Port: number;
    BaseDir: string;
    WebDir: string;
    PageNotFound: string;
    ControllerDir: string;
    ViewDir: string;
    ModelDir: string;
    Controllers: Array<string>;
    MaxCacheSize: number;
    DBProvider: string;
    DBConnectionString: string;
    DefaultPages: Array<string>;
    AsyncOperationTimeout: number;
    TLSOptions: TLSConfiguration;
    SSLOptions: TLSConfiguration;
    LogOptions: LogOption;
}

export declare function Module(name: string): any;
export declare function module(name: string): any;
export declare function Load(name: string): any;
export declare function load(name: string): any;
export declare function ModuleFrom(name: string, relativePath: string): any;
export declare function moduleFrom(name: string, relativePath: string): any;
export declare function LoadFrom(name: string, relativePath: string): any;
export declare function loadFrom(name: string, relativePath: string): any;