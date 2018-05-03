"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const controller = require("./controller/index");
const server_1 = require("./server");
const error_1 = require("./error/error");
const nodepath = require("path");
const fs = require("fs");
const content_type_1 = require("./content-type");
const rcs_1 = require("./cache/rcs");
const index_1 = require("./helper/index");
const plugin_1 = require("./plugin");
const log_1 = require("./log");
const tls = require("tls");
const util_1 = require("./util");
const node_version = process.version;
global['EnvironmentVariables'] = global['EnvironmentVariables'] ? global['EnvironmentVariables'] : {
    ServerBaseDir: __dirname,
    ControllerDir: 'controller/',
    ViewDir: 'view/',
    ModelDir: 'model/',
    PageNotFound: '',
    WebDir: 'www/',
    LogDir: 'log/',
    MaxCacheSize: 350,
    DBProvider: 'mysql',
    DBConnectionString: null,
    DefaultPages: ['index.html', 'default.html', 'page.html'],
    AsyncOperationTimeout: 10000,
    PluginDir: 'plugin/',
    Verbose: true,
    TLSOptions: void 0,
    LogOptions: {
        BufferSize: 1048576,
        LogLimit: 1048576
    }
};
const core_env = {
    platform: process.platform,
    node_version: node_version
};
function RegisterController(controllerJs) {
    return controller.Controller.Register(controllerJs);
}
exports.RegisterController = RegisterController;
function RegisterControllerM(controllerJs) {
    return controller.Controller.RegisterM(controllerJs);
}
exports.RegisterControllerM = RegisterControllerM;
function UpdateGlobalVariable(variable, value) {
    if (global['EnvironmentVariables'].hasOwnProperty(variable)) {
        global['EnvironmentVariables'][variable] = value;
        return true;
    }
    return false;
}
exports.UpdateGlobalVariable = UpdateGlobalVariable;
function SetGlobalVariable(variable, value) {
    global['EnvironmentVariables'][variable] = value;
}
exports.SetGlobalVariable = SetGlobalVariable;
let closedSockets = new Array(0);
let closedTLSSockets = new Array(0);
function CleanListener(sign) {
}
function RoutePath(path, request, response) {
    let responseX = server_1.ServerResponseExtension(response);
    responseX.setHeader('server', `ServerHub/${global['EnvironmentVariables'].PackageData['version']} (${core_env.platform}) Node.js ${core_env.node_version}`);
    let ee = responseX.connection;
    ee.setMaxListeners(64);
    let endListener = () => {
        log_1.DefaultLogger.LogRequest(request, responseX.statusCode, responseX.contentLength);
        responseX.connection.removeListener('end', endListener);
    };
    endListener['signature'] = util_1.RandomHashTag();
    endListener['socketType'] = responseX.connection instanceof tls.TLSSocket ? "TLSSocket" : "Socket";
    responseX.connection.on("end", endListener);
    response.setHeader('server', `ServerHub/${global['EnvironmentVariables'].PackageData['version']} (${core_env.platform}) Node.js ${core_env.node_version}`);
    let bPromise = plugin_1.BeforeRoute(request, responseX);
    let routeResult = ROUTE.RunRoute(path);
    let doneAfterRoutePluginExecution = (errCount) => {
        if (!routeResult)
            return NoRoute(path, request, responseX);
        let method = request.method.toLowerCase();
        if (routeResult.Controller && routeResult.Action && controller.Controller.Dispatchable(routeResult.Controller, routeResult.Action)) {
            try {
                return (() => { controller.Controller.Dispatch(method, routeResult, request, responseX); })();
            }
            catch (error) {
                console.error(error);
                if (!response.headersSent)
                    response.setHeader('content-type', 'text/html');
                if (!response.writable)
                    response.write(error_1.ErrorManager.RenderErrorAsHTML(error));
                response.end();
            }
        }
        else
            return NoRoute(path, request, responseX);
    };
    let doneBeforeRoutePluginExecution = (errCount) => {
        let aPromise = plugin_1.AfterRoute(request, responseX, routeResult);
        aPromise.then(doneAfterRoutePluginExecution);
    };
    bPromise.then(doneBeforeRoutePluginExecution);
}
exports.RoutePath = RoutePath;
function NoRoute(path, req, res) {
    let variables = global['EnvironmentVariables'];
    if (path === '/') {
        let hasmatch = false;
        variables.DefaultPages.forEach(ele => {
            if (hasmatch)
                return;
            let temppath = '';
            if (ele.indexOf('/') === 0)
                temppath = ele.slice(1);
            else
                temppath = ele;
            let checkPath = nodepath.resolve(variables.ServerBaseDir, variables.WebDir, temppath);
            if (fs.existsSync(checkPath)) {
                path = '/' + temppath;
                hasmatch = true;
            }
        });
    }
    if (rcs_1.RCS.Service().Cacheable(path))
        return rcs_1.RCS.Service().GetUri(path, res, req);
    let filepath = nodepath.resolve(variables.ServerBaseDir, variables.WebDir, path.substr(1));
    if (!path.endsWith('/') && fs.existsSync(filepath)) {
        res.setHeader('content-type', content_type_1.ContentType.GetContentType(filepath.match(/\.[a-z\d]*$/i)[0]));
        res.writeRecord(fs.readFileSync(filepath));
        res.end();
    }
    else {
        res.setHeader('content-type', 'text/html');
        res.writeHead(404);
        let pageNotFound = '';
        if (variables.PageNotFound !== null && variables.PageNotFound.length === 0)
            pageNotFound = index_1.CacheHelper.Cache(nodepath.resolve(__dirname, '404.html')).Content;
        else
            pageNotFound = index_1.CacheHelper.Cache(nodepath.resolve(variables.ServerBaseDir, variables.PageNotFound)).Content;
        res.writeRecord(pageNotFound);
        res.end();
    }
}
var ROUTE;
function RegisterRouter(route) {
    ROUTE = route;
}
exports.RegisterRouter = RegisterRouter;
