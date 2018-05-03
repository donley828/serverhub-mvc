/**
 * Core Entry
 * 
 * ServerHub MVC, MIT License
 * March 13, 2018
 * Yang Zhongdong (yangzd1996@outlook.com)
 */

import * as controller from './controller/index';
import { GlobalEnvironmentVariables, TLSConfiguration } from './global';
import { IncomingMessage, ServerResponse } from 'http';
import { ServerResponseExtension, ServerResponseX } from './server';
import { ErrorManager, RuntimeError } from './error/error';
import * as nodepath from 'path';
import * as fs from 'fs';
import { ContentType } from './content-type';
import { Route } from '../route/route';
import { RCS } from './cache/rcs';
import { CacheHelper } from "./helper/index";
import { BeforeRoute, AfterRoute } from './plugin';
import { DefaultLogger } from './log';
import * as net from 'net';
import * as tls from 'tls';
import { EventEmitter } from 'events';
import { createHash } from 'crypto';
import { RandomHashTag } from './util';
import * as colors from "colors";

const node_version = process.version;

// Export initial values to global object of Node.
global['EnvironmentVariables'] = global['EnvironmentVariables'] ? global['EnvironmentVariables'] : {
    ServerBaseDir: __dirname,
    ControllerDir: 'controller/',
    ViewDir: 'view/',
    ModelDir: 'model/',
    PageNotFound: '', // relative to ServerBaseDir.
    WebDir: 'www/',
    LogDir: 'log/',
    MaxCacheSize: 350, // MB
    DBProvider: 'mysql',
    DBConnectionString: null,
    DefaultPages: ['index.html', 'default.html', 'page.html'],
    AsyncOperationTimeout: 10000, // default 10s
    PluginDir: 'plugin/',
    Verbose: true,
    TLSOptions: void 0,
    LogOptions: {
        BufferSize: 1048576,
        LogLimit: 1048576
    }
} as GlobalEnvironmentVariables;

/**
 * Environment variables for ServerHub.
 */
const core_env = {
    platform: process.platform,
    node_version: node_version
}

/**
 * Expose to developer using ServerHub. Developers can use this function to register custom controllers.
 * @param controllerJs Controller file name
 */
export function RegisterController(controllerJs: string) {
    return controller.Controller.Register(controllerJs);
}

export function RegisterControllerM(controllerJs: string) {
    return controller.Controller.RegisterM(controllerJs);
}

/**
 * Update global variable with new value.
 * @param variable Which global variable to update
 * @param value New value of the global variable.
 */
export function UpdateGlobalVariable(variable: string, value: Object): boolean {
    if (global['EnvironmentVariables'].hasOwnProperty(variable)) { global['EnvironmentVariables'][variable] = value; return true; }
    return false;
}

/**
 * Can both update and add new global variable.
 * @param variable What global variable to set
 * @param value Value of the variable
 */
export function SetGlobalVariable(variable: string, value: Object): void {
    global['EnvironmentVariables'][variable] = value;
}
let closedSockets = new Array<string>(0);
let closedTLSSockets = new Array<string>(0);
function CleanListener(sign): void {

}

/**
 * Route a specific path.
 * @param path Path to be routed.
 * @param req Incomming message (request)
 * @param res Server response (response)
 */
export function RoutePath(path: string, request: IncomingMessage, response: ServerResponse): void {
    let responseX = ServerResponseExtension(response);
    responseX.setHeader('server', `ServerHub/${(global['EnvironmentVariables'] as GlobalEnvironmentVariables).PackageData['version']} (${core_env.platform}) Node.js ${core_env.node_version}`);
    
    let ee = responseX.connection as EventEmitter;
    ee.setMaxListeners(64);
    let endListener = () => {
        DefaultLogger.LogRequest(request, responseX.statusCode, responseX.contentLength);
        responseX.connection.removeListener('end', endListener);
    };
    endListener['signature'] = RandomHashTag();
    endListener['socketType'] = responseX.connection instanceof tls.TLSSocket ? "TLSSocket" : "Socket";
    responseX.connection.on("end", endListener);

    let bPromise = BeforeRoute(request, responseX);
    let routeResult = ROUTE.RunRoute(path);
    let doneAfterRoutePluginExecution = (errCount: number) => {
        if (!routeResult)
            return NoRoute(path, request, responseX);
        let method = request.method.toLowerCase();
        if (routeResult.Controller && routeResult.Action && controller.Controller.Dispatchable(routeResult.Controller, routeResult.Action)) {
            try {
                return (() => { controller.Controller.Dispatch(method, routeResult, request, responseX); })();
            } catch (error) {
                console.error(error);
                if (!response.headersSent)
                    response.setHeader('content-type', 'text/html');
                if (!response.writable)
                    response.write(ErrorManager.RenderErrorAsHTML(error));
                response.end();
            }
        } else
            return NoRoute(path, request, responseX);
    }
    let doneBeforeRoutePluginExecution = (errCount: number) => {
        let aPromise = AfterRoute(request, responseX, routeResult);
        aPromise.then(doneAfterRoutePluginExecution);
    }
    bPromise.then(doneBeforeRoutePluginExecution);
}

function NoRoute(path: string, req: IncomingMessage, res: ServerResponseX): void {
    let variables = global['EnvironmentVariables'] as GlobalEnvironmentVariables;

    if (path === '/') {
        let hasmatch = false;
        variables.DefaultPages.forEach(ele => {
            if (hasmatch)
                return;
            let temppath = '';
            if (ele.indexOf('/') === 0)
                temppath = ele.slice(1);
            else temppath = ele;
            let checkPath = nodepath.resolve(variables.ServerBaseDir, variables.WebDir, temppath);
            if (fs.existsSync(checkPath)) {
                path = '/' + temppath;
                hasmatch = true;
            }
        })
    }

    // if cacheable, let cache system decide whether load as cache or stream.
    if (RCS.Service().Cacheable(path))
        return RCS.Service().GetUri(path, res, req);

    let filepath = nodepath.resolve(variables.ServerBaseDir, variables.WebDir, path.substr(1));
    if (!path.endsWith('/') && fs.existsSync(filepath)) {
        res.setHeader('content-type', ContentType.GetContentType(filepath.match(/\.[a-z\d]*$/i)[0]));
        res.writeRecord(fs.readFileSync(filepath));
        res.end();
    } else {
        res.setHeader('content-type', 'text/html');
        res.writeHead(404);
        let pageNotFound = '';
        if (variables.PageNotFound !== null && variables.PageNotFound.length === 0)
            pageNotFound = CacheHelper.Cache(nodepath.resolve(__dirname, '404.html')).Content;
        else pageNotFound = CacheHelper.Cache(nodepath.resolve(variables.ServerBaseDir, variables.PageNotFound)).Content;
        res.writeRecord(pageNotFound);
        res.end();
    }
}
var ROUTE: Route;
export function RegisterRouter(route: Route): void {
    ROUTE = route;
}
