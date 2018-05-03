import { IncomingMessage } from "http";
import { DateTime, RandomHashTag } from "../util";
import { LogFilter, ILogger } from './base';
import * as fs from "fs";
import * as path from 'path';
import { GlobalEnvironmentVariables } from "../global";
import { JSONX } from "../helper";
import { StreamManager } from "../runtime";
import * as colors from "colors";

class RequestLogger implements ILogger {
    private _writeStream: fs.WriteStream;
    private _logDir: string;
    private _logFile: string;
    private _currentHead: Object;
    private _headSent: boolean;
    private _paused: boolean;

    constructor() {
        let variables = global['EnvironmentVariables'] as GlobalEnvironmentVariables;
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
            this._logFile = path.resolve(this._logDir, this.GenerateLogFilename());

        this._writeStream = fs.createWriteStream(this._logFile, { autoClose: false, start: 0 });
        this._writeStream['__serverhub_signature__'] = RandomHashTag(16);
        this._writeStream.on('close', () => {
            StreamManager.GetInstance().Remove(this._writeStream['__serverhub_signature__']);
        })
        StreamManager.GetInstance().PushStream(this._writeStream);
        this._headSent = false;
        this._paused = false;
    }

    public SwitchStream(): void {
        this._paused = true;
        this._writeStream.close();
        this._logFile = path.resolve(this._logDir, this.GenerateLogFilename());
        this._writeStream = fs.createWriteStream(this._logFile, { autoClose: false, start: 0 });
        let oldsig = this._writeStream['__serverhub_signature__'];
        this._writeStream['__serverhub_signature__'] = RandomHashTag(16);
        this._writeStream.on('close', () => {
            StreamManager.GetInstance().Remove(oldsig);
        })
        StreamManager.GetInstance().PushStream(this._writeStream);
        this._headSent = false;
        this._paused = false;
    }

    public async Write(chunk: any, callback?: (result: boolean) => void) {
        if (!this._writeStream.writable)
            return;

        // check is log file length reached limit.
        let variables = global['EnvironmentVariables'] as GlobalEnvironmentVariables;
        let newlength = chunk instanceof Buffer ? chunk.byteLength : (chunk.toString() as string).length;
        if (this._writeStream.bytesWritten + newlength >= variables.LogOptions.LogLimit)
            this.SwitchStream();
        const continusWriteOp = () => {
            let bytesWritten = 0;
            let previouslyWrittenLength = this._writeStream.bytesWritten;
            if (!this._writeStream.write((chunk instanceof Buffer) ? chunk.toString('utf8', bytesWritten) : (typeof chunk === 'string') ? chunk : chunk.toString() as string)) {
                bytesWritten = this._writeStream.bytesWritten - previouslyWrittenLength;
                this._writeStream.on('drain', () => {
                    this._writeStream.write((chunk instanceof Buffer) ? chunk.toString('utf8', bytesWritten) : (typeof chunk === 'string') ? chunk : chunk.toString() as string) ? () => { !!callback ? callback(true) : ''; } : continusWriteOp();
                })
            } else return true;
        }
        if (continusWriteOp())
            if (callback)
                callback(true);

    }
    public Remove(filter: (path: string, filename: string) => boolean): number {
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
    public RemoveAll(): number {
        let count = 0;
        if (this._logDir && fs.existsSync(this._logDir)) {
            fs.readdirSync(this._logDir).forEach(file => {
                count++;
                fs.unlinkSync(path.resolve(this._logDir, file));
            })
        }
        return count;
    }

    public Read(tpath: string, offset: number, callback: (stream: fs.ReadStream) => void): void {
        if (fs.existsSync(tpath)) {
            callback(fs.createReadStream(tpath, { start: offset }));
        }
    }

    public GenerateLogFilename(): string {
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
        let log = `${req.connection.remoteAddress ? req.connection.remoteAddress : '-'} [${DateTime.GetDay()}/${DateTime.GetMonth()}/${DateTime.GetYear()}:${DateTime.GetHours()}:${DateTime.GetMinutes()}:${DateTime.GetSeconds()} ${timezone}] "${req.method} ${req.url} HTTP${req['secure'] ? 'S' : ''}/${req.httpVersion}" ${statusCode} ${byteSize ? byteSize : '-'}\n`;
        if (!BuiltInLogger.Logger)
            BuiltInLogger.Logger = new RequestLogger();
        global.setTimeout(() => console.log(log), 0);
        // process.nextTick(() => BuiltInLogger.Logger.Write(log));
    }
    public static Logger: RequestLogger;
}

export { BuiltInLogger, RequestLogger };