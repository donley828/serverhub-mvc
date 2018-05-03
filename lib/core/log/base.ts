import { StatusCode } from "../server";
import { ReadStream } from "fs";
const Methods = ['GET', 'PUT', 'DELETE', 'PATCH', 'UPDATE', 'POST'];
class LogFilter {
    private _StatusCode: number | boolean | Array<number>;
    private _Method: string | boolean | Array<string>;
    public set StatusCode(sc: number | boolean | Array<number>) {
        if (typeof sc === 'number') {
            if (StatusCode.includes(sc)) {
                this._StatusCode = sc;
                return;
            }
        } else if (sc instanceof Array && sc.length !== 0) {
            let res = [];
            sc.forEach(code => {
                if (StatusCode.includes(code))
                    res.push(code);
            })
            if (res.length > 0) {
                this._StatusCode = res;
                return;
            } else if (res.length === 1) {
                this._StatusCode = res[0];
                return;
            }
        }
        this._StatusCode = false;
    }
    public get StatusCode() {
        if (typeof this._StatusCode === 'number' || this._StatusCode === false)
            return this._StatusCode;
        else return (this._StatusCode as Array<number>).slice(0);
    }
    public set Method(m: string | boolean | Array<string>) {
        if (typeof m === 'string') {
            let M = m.toUpperCase();
            if (Methods.includes(m)) {
                this._Method = m;
                return;
            }
        } else if (m instanceof Array && m.length !== 0) {
            let res = [];
            m.forEach(metho => {
                let M = metho.toUpperCase();
                if (Methods.includes(metho))
                    res.push(metho);
            })
            if (res.length > 0) {
                this._Method = res;
                return;
            } else if (res.length === 1) {
                this._Method = res[0];
                return;
            }
        }
        this._Method = false;
    }
    public get Method() {
        if (typeof this._Method === 'number' || this._Method === false)
            return this._Method;
        else return (this._Method as Array<string>).slice(0);
    }
}

interface ILogger {
    /**
     * Write log to buffer.
     * @param chunk A chunk of data to log
     */
    Write(chunk: any, callback?: (result: boolean) => void): void;

    /**
     * Remove with certain filter and return files count of logs been removed.
     * @param filter Filter function, must return boolean.
     */
    Remove(filter: (path: string, filename: string) => boolean): number;
    /**
     * Remove all logs and return files count of logs been removed.
     */
    RemoveAll(): number;
    /**
     * Generate a log filename with a unique type.
     */
    GenerateLogFilename(): string;

    Read(path: string, offset: number, callback: (stream: ReadStream) => void): void;
}

export { LogFilter, ILogger };
