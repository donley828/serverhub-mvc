"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
const base_1 = require("./base");
const fs = require("fs");
const path = require("path");
const helper_1 = require("../helper");
class RequestLogger {
    constructor() {
        let variables = global['EnvironmentVariables'];
        this._buffer = Buffer.alloc(1048576, '');
        this._logDir = path.resolve(variables.ServerBaseDir, variables.LogDir);
        if (!fs.existsSync(this._logDir)) {
            fs.mkdirSync(this._logDir);
        }
        let files = fs.readdir(this._logDir, (err, files) => {
            if (!err && files !== null && files.length > 0) {
                let lastLog = files.reduce((p, c) => {
                    return p > c ? p : c;
                });
                this._logFile = path.resolve(this._logDir, lastLog);
            }
        });
        if (this._logFile === void 0 || this._logFile === null)
            this._logFile = path.resolve(this._logDir, this.generateLogFilename());
        this._writeStream = fs.createWriteStream(this._logFile, { autoClose: false, start: 0 });
    }
    write(chunk, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = this._writeStream.write(chunk);
            if (callback)
                callback(res);
        });
    }
    writeHead(head) {
        let targetPath = this._logFile;
        let headString = '';
        let tempHead = {};
        Object.keys(head).forEach(key => {
            if (!(head[key] instanceof Function)) {
                tempHead[key] = head[key];
            }
        });
        headString = helper_1.JSONX(tempHead, { indent_char: '', indent_size: 0 });
        this._writeStream.on('close', () => {
            process.nextTick((tpath) => {
                if (fs.existsSync(tpath)) {
                    let reads = fs.createReadStream(tpath);
                    let temps = fs.createWriteStream(tpath + '.bak');
                    temps.write(headString + '\n===ServerHub Built-in Request Logger===\n');
                    temps.on('close', () => {
                        fs.unlinkSync(tpath);
                        fs.renameSync(tpath + '.bak', tpath);
                    });
                    reads.pipe(temps);
                }
            }, targetPath);
        });
    }
    writeSync(chunk) {
        return this._writeStream.write(chunk);
    }
    remove(filter) {
        let count = 0;
        if (this._logDir && fs.existsSync(this._logDir)) {
            fs.readdirSync(this._logDir).forEach(file => {
                let filepath = path.resolve(this._logDir, file);
                if (filter(filepath, file) === true) {
                    count++;
                    fs.unlinkSync(filepath);
                }
            });
        }
        return count;
    }
    removeAll() {
        let count = 0;
        if (this._logDir && fs.existsSync(this._logDir)) {
            fs.readdirSync(this._logDir).forEach(file => {
                count++;
                fs.unlinkSync(path.resolve(this._logDir, file));
            });
        }
        return count;
    }
    read(tpath, offset, callback) {
        if (fs.existsSync(tpath)) {
            callback(fs.createReadStream(tpath, { start: offset }));
        }
    }
    readSync(tpath, offset) {
        if (fs.existsSync(tpath)) {
            let r = fs.readFileSync(tpath);
            return r.toString(void 0, offset);
        }
    }
    parseHead(input) {
        if (!input.includes('===ServerHub Built-in Request Logger==='))
            return {};
        let segs = input.split('===ServerHub Built-in Request Logger===');
        let headString = segs[0];
        return JSON.parse(headString);
    }
    parseLines(input) {
        let body = '';
        if (!input.includes('===ServerHub Built-in Request Logger==='))
            body = input;
        let segs = input.split('===ServerHub Built-in Request Logger===');
        body = segs[1];
        return body.split('\n');
    }
    generateLogFilename() {
        return `serverhub_log_${util_1.DateTime.GetYear()}_${util_1.DateTime.GetMonth()}_${util_1.DateTime.GetDay()}_${util_1.DateTime.GetHours()}${util_1.DateTime.GetMinutes()}${util_1.DateTime.GetSeconds()}${util_1.DateTime.GetMilliseconds()}.shlog`;
    }
}
exports.RequestLogger = RequestLogger;
class BuiltInLogger {
    static SetStatusCodeFilter(statucCode) {
        BuiltInLogger.Filter.StatusCode = statucCode;
    }
    static GetStatusCodeFilter() {
        return BuiltInLogger.Filter.StatusCode;
    }
    static SetMethodFilter(method) {
        BuiltInLogger.Filter.Method = method;
    }
    static GetMethodFilter() {
        return BuiltInLogger.Filter.Method;
    }
    static LogRequest(req, statusCode, byteSize) {
        let timezoneOffset = -util_1.DateTime.Now.getTimezoneOffset() / 60;
        let timezone = '';
        if (timezoneOffset > 0) {
            timezone = timezoneOffset < 10 ? `+0${timezoneOffset}00` : `+${timezoneOffset}00`;
        }
        else {
            timezoneOffset = Math.abs(timezoneOffset);
            timezone = timezoneOffset < 10 ? `-0${timezoneOffset}00` : `-${timezoneOffset}00`;
        }
        let log = `${req.connection.remoteAddress ? req.connection.remoteAddress : '-'} [${util_1.DateTime.GetDay()}/${util_1.DateTime.GetMonth()}/${util_1.DateTime.GetYear()}:${util_1.DateTime.GetHours()}:${util_1.DateTime.GetMinutes()}:${util_1.DateTime.GetSeconds()} ${timezone}] "${req.method} ${req.url} HTTP${req['secure'] ? 'S' : ''}/${req.httpVersion}" ${statusCode} ${byteSize ? byteSize : '-'}`;
        if (!BuiltInLogger.Logger)
            BuiltInLogger.Logger = new RequestLogger();
        process.nextTick(() => BuiltInLogger.Logger.write(log));
    }
}
BuiltInLogger.Filter = new base_1.LogFilter();
exports.BuiltInLogger = BuiltInLogger;
