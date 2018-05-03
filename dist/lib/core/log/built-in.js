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
const runtime_1 = require("../runtime");
class RequestLogger {
    constructor() {
        let variables = global['EnvironmentVariables'];
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
            this._logFile = path.resolve(this._logDir, this.GenerateLogFilename());
        this._writeStream = fs.createWriteStream(this._logFile, { autoClose: false, start: 0 });
        this._writeStream['__serverhub_signature__'] = util_1.RandomHashTag(16);
        this._writeStream.on('close', () => {
            runtime_1.StreamManager.GetInstance().Remove(this._writeStream['__serverhub_signature__']);
        });
        runtime_1.StreamManager.GetInstance().PushStream(this._writeStream);
        this._headSent = false;
        this._paused = false;
    }
    SwitchStream() {
        this._paused = true;
        this._writeStream.close();
        this._logFile = path.resolve(this._logDir, this.GenerateLogFilename());
        this._writeStream = fs.createWriteStream(this._logFile, { autoClose: false, start: 0 });
        let oldsig = this._writeStream['__serverhub_signature__'];
        this._writeStream['__serverhub_signature__'] = util_1.RandomHashTag(16);
        this._writeStream.on('close', () => {
            runtime_1.StreamManager.GetInstance().Remove(oldsig);
        });
        runtime_1.StreamManager.GetInstance().PushStream(this._writeStream);
        this._headSent = false;
        this._paused = false;
    }
    Write(chunk, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._writeStream.writable)
                return;
            let variables = global['EnvironmentVariables'];
            let newlength = chunk instanceof Buffer ? chunk.byteLength : chunk.toString().length;
            if (this._writeStream.bytesWritten + newlength >= variables.LogOptions.LogLimit)
                this.SwitchStream();
            const continusWriteOp = () => {
                let bytesWritten = 0;
                let previouslyWrittenLength = this._writeStream.bytesWritten;
                if (!this._writeStream.write((chunk instanceof Buffer) ? chunk.toString('utf8', bytesWritten) : (typeof chunk === 'string') ? chunk : chunk.toString())) {
                    bytesWritten = this._writeStream.bytesWritten - previouslyWrittenLength;
                    this._writeStream.on('drain', () => {
                        this._writeStream.write((chunk instanceof Buffer) ? chunk.toString('utf8', bytesWritten) : (typeof chunk === 'string') ? chunk : chunk.toString()) ? () => { !!callback ? callback(true) : ''; } : continusWriteOp();
                    });
                }
                else
                    return true;
            };
            if (continusWriteOp())
                if (callback)
                    callback(true);
        });
    }
    Remove(filter) {
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
    RemoveAll() {
        let count = 0;
        if (this._logDir && fs.existsSync(this._logDir)) {
            fs.readdirSync(this._logDir).forEach(file => {
                count++;
                fs.unlinkSync(path.resolve(this._logDir, file));
            });
        }
        return count;
    }
    Read(tpath, offset, callback) {
        if (fs.existsSync(tpath)) {
            callback(fs.createReadStream(tpath, { start: offset }));
        }
    }
    GenerateLogFilename() {
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
        let log = `${req.connection.remoteAddress ? req.connection.remoteAddress : '-'} [${util_1.DateTime.GetDay()}/${util_1.DateTime.GetMonth()}/${util_1.DateTime.GetYear()}:${util_1.DateTime.GetHours()}:${util_1.DateTime.GetMinutes()}:${util_1.DateTime.GetSeconds()} ${timezone}] "${req.method} ${req.url} HTTP${req['secure'] ? 'S' : ''}/${req.httpVersion}" ${statusCode} ${byteSize ? byteSize : '-'}\n`;
        if (!BuiltInLogger.Logger)
            BuiltInLogger.Logger = new RequestLogger();
        global.setTimeout(() => console.log(log), 0);
    }
}
BuiltInLogger.Filter = new base_1.LogFilter();
exports.BuiltInLogger = BuiltInLogger;
