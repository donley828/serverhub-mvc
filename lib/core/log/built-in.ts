import { IncomingMessage } from "http";
import { DateTime } from "../util";
import { LogFilter, ILogger } from './base';
import * as fs from "fs";
import * as path from 'path';
import { GlobalEnvironmentVariables } from "../global";
import { JSONX } from "../helper";

class RequestLogger implements ILogger {
    private _buffer: Buffer;
    private _writeStream: fs.WriteStream;
    private _logDir: string;
    private _logFile: string;

    constructor() {
        let variables = global['EnvironmentVariables'] as GlobalEnvironmentVariables;
        this._buffer = Buffer.alloc(1048576, ''); // intial buffer size: 1024 KByte.
        this._logDir = path.resolve(variables.ServerBaseDir, variables.LogDir);
        if (!fs.existsSync(this._logDir)) {
            fs.mkdirSync(this._logDir);
        }
        let files = fs.readdir(this._logDir, (err: NodeJS.ErrnoException, files: string[]) => {
            if (!err && files !== null && files.length > 0) {
                let lastLog = files.reduce((p, c) => {
                    return p > c ? p : c;
                });
                this._logFile = path.resolve(this._logDir, lastLog);
            }
        })
        if (this._logFile === void 0 || this._logFile === null)
            this._logFile = path.resolve(this._logDir, this.generateLogFilename());

        this._writeStream = fs.createWriteStream(this._logFile, { autoClose: false, start: 0 });
    }

    public async write(chunk: any, callback?: (result: boolean) => void) {
        let res = this._writeStream.write(chunk);
        if (callback)
            callback(res);
    }
    public writeHead(head: Object): void {
        let targetPath = this._logFile;
        let headString = '';
        let tempHead = {};
        Object.keys(head).forEach(key => {
            if (!(head[key] instanceof Function)) {
                tempHead[key] = head[key];
            }
        })
        headString = JSONX(tempHead, { indent_char: '', indent_size: 0 });
        this._writeStream.on('close', () => {
            process.nextTick((tpath) => {
                if (fs.existsSync(tpath)) {
                    let reads = fs.createReadStream(tpath);
                    let temps = fs.createWriteStream(tpath + '.bak');
                    temps.write(headString + '\n===ServerHub Built-in Request Logger===\n');
                    temps.on('close', () => {
                        fs.unlinkSync(tpath);
                        fs.renameSync(tpath + '.bak', tpath);
                    })
                    reads.pipe(temps);
                }
            }, targetPath)
        })
    }

    public writeSync(chunk: any): boolean {
        return this._writeStream.write(chunk);
    }
    public remove(filter: (path: string, filename: string) => boolean): number {
        let count = 0;
        if (this._logDir && fs.existsSync(this._logDir)) {
            fs.readdirSync(this._logDir).forEach(file => {
                let filepath = path.resolve(this._logDir, file);
                if (filter(filepath, file) === true) {
                    count++;
                    fs.unlinkSync(filepath);
                }
            })
        }
        return count;
    }
    public removeAll(): number {
        let count = 0;
        if (this._logDir && fs.existsSync(this._logDir)) {
            fs.readdirSync(this._logDir).forEach(file => {
                count++;
                fs.unlinkSync(path.resolve(this._logDir, file));
            })
        }
        return count;
    }

    public read(tpath: string, offset: number, callback: (stream: fs.ReadStream) => void): void {
        if (fs.existsSync(tpath)) {
            callback(fs.createReadStream(tpath, { start: offset }));
        }
    }
    public readSync(tpath: string, offset: number): string {
        if (fs.existsSync(tpath)) {
            let r = fs.readFileSync(tpath);
            return r.toString(void 0, offset);
        }
    }
    public parseHead(input: string): Object {
        if (!input.includes('===ServerHub Built-in Request Logger==='))
            return {};
        let segs = input.split('===ServerHub Built-in Request Logger===');
        let headString = segs[0];
        return JSON.parse(headString);
    }
    public parseLines(input: string): string[] {
        let body = '';
        if (!input.includes('===ServerHub Built-in Request Logger==='))
            body = input;
        let segs = input.split('===ServerHub Built-in Request Logger===');
        body = segs[1];
        return body.split('\n');
    }

    public generateLogFilename(): string {
        return `serverhub_log_${DateTime.GetYear()}_${DateTime.GetMonth()}_${DateTime.GetDay()}_${DateTime.GetHours()}${DateTime.GetMinutes()}${DateTime.GetSeconds()}${DateTime.GetMilliseconds()}.shlog`;
    }
}

class BuiltInLogger {
    private static Filter = new LogFilter();
    public static SetStatusCodeFilter(statucCode: number | boolean | Array<number>) {
        BuiltInLogger.Filter.StatusCode = statucCode;
    }
    public static GetStatusCodeFilter(): number | boolean | Array<number> {
        return BuiltInLogger.Filter.StatusCode;
    }
    public static SetMethodFilter(method: string | boolean | Array<string>) {
        BuiltInLogger.Filter.Method = method;
    }
    public static GetMethodFilter(): string | boolean | Array<string> {
        return BuiltInLogger.Filter.Method;
    }
    public static LogRequest(req: IncomingMessage, statusCode: number, byteSize: number) {
        let timezoneOffset = -DateTime.Now.getTimezoneOffset() / 60;
        let timezone = '';
        if (timezoneOffset > 0) {
            timezone = timezoneOffset < 10 ? `+0${timezoneOffset}00` : `+${timezoneOffset}00`;
        } else {
            timezoneOffset = Math.abs(timezoneOffset);
            timezone = timezoneOffset < 10 ? `-0${timezoneOffset}00` : `-${timezoneOffset}00`;
        }
        let log = `${req.connection.remoteAddress ? req.connection.remoteAddress : '-'} [${DateTime.GetDay()}/${DateTime.GetMonth()}/${DateTime.GetYear()}:${DateTime.GetHours()}:${DateTime.GetMinutes()}:${DateTime.GetSeconds()} ${timezone}] "${req.method} ${req.url} HTTP${req['secure'] ? 'S' : ''}/${req.httpVersion}" ${statusCode} ${byteSize ? byteSize : '-'}`;
        if (!BuiltInLogger.Logger)
            BuiltInLogger.Logger = new RequestLogger();
        process.nextTick(() => BuiltInLogger.Logger.write(log));
    }
    public static Logger: RequestLogger;
}

export { BuiltInLogger, RequestLogger };