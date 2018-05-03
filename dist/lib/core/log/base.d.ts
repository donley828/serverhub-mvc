/// <reference types="node" />
import { ReadStream } from "fs";
declare class LogFilter {
    private _StatusCode;
    private _Method;
    StatusCode: number | boolean | Array<number>;
    Method: string | boolean | Array<string>;
}
interface ILogger {
    Write(chunk: any, callback?: (result: boolean) => void): void;
    Remove(filter: (path: string, filename: string) => boolean): number;
    RemoveAll(): number;
    GenerateLogFilename(): string;
    Read(path: string, offset: number, callback: (stream: ReadStream) => void): void;
}
export { LogFilter, ILogger };
