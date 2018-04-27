/// <reference types="node" />
import { ReadStream } from "fs";
declare class LogFilter {
    private _StatusCode;
    private _Method;
    StatusCode: number | boolean | Array<number>;
    Method: string | boolean | Array<string>;
}
interface ILogger {
    write(chunk: any, callback?: (result: boolean) => void): void;
    writeSync(chunk: any): boolean;
    remove(filter: (path: string, filename: string) => boolean): number;
    removeAll(): number;
    generateLogFilename(): string;
    writeHead(head: Object): void;
    read(path: string, offset: number, callback: (stream: ReadStream) => void): void;
    readSync(path: string, offset: number): string;
    parseHead(input: string): Object;
    parseLines(input: string): string[];
}
export { LogFilter, ILogger };
