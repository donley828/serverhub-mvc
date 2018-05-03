/// <reference types="node" />
import { IncomingMessage } from "http";
import { ILogger } from './base';
import * as fs from "fs";
declare class RequestLogger implements ILogger {
    private _writeStream;
    private _logDir;
    private _logFile;
    private _currentHead;
    private _headSent;
    private _paused;
    constructor();
    SwitchStream(): void;
    Write(chunk: any, callback?: (result: boolean) => void): Promise<void>;
    Remove(filter: (path: string, filename: string) => boolean): number;
    RemoveAll(): number;
    Read(tpath: string, offset: number, callback: (stream: fs.ReadStream) => void): void;
    GenerateLogFilename(): string;
}
declare class BuiltInLogger {
    private static Filter;
    static SetStatusCodeFilter(statucCode: number | boolean | Array<number>): void;
    static GetStatusCodeFilter(): number | boolean | Array<number>;
    static SetMethodFilter(method: string | boolean | Array<string>): void;
    static GetMethodFilter(): string | boolean | Array<string>;
    static LogRequest(req: IncomingMessage, statusCode: number, byteSize: number): void;
    static Logger: RequestLogger;
}
export { BuiltInLogger, RequestLogger };
