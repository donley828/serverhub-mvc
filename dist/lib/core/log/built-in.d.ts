/// <reference types="node" />
import { IncomingMessage } from "http";
import { ILogger } from './base';
import * as fs from "fs";
declare class RequestLogger implements ILogger {
    private _buffer;
    private _writeStream;
    private _logDir;
    private _logFile;
    constructor();
    write(chunk: any, callback?: (result: boolean) => void): Promise<void>;
    writeHead(head: Object): void;
    writeSync(chunk: any): boolean;
    remove(filter: (path: string, filename: string) => boolean): number;
    removeAll(): number;
    read(tpath: string, offset: number, callback: (stream: fs.ReadStream) => void): void;
    readSync(tpath: string, offset: number): string;
    parseHead(input: string): Object;
    parseLines(input: string): string[];
    generateLogFilename(): string;
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
