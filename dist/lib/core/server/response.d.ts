/// <reference types="node" />
import { ServerResponse } from "http";
declare function ServerResponseExtension(res: ServerResponse): ServerResponseX;
declare class ServerResponseX extends ServerResponse {
    contentLength: number;
    writeRecord: (chunk: any, callback?) => boolean;
}
export { ServerResponseExtension, ServerResponseX };
