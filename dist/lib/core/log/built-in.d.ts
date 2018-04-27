/// <reference types="node" />
import { IncomingMessage } from "http";
declare class BuiltInLogger {
    static LogRequest(req: IncomingMessage, statusCode: number, byteSize: number): void;
}
export { BuiltInLogger };
