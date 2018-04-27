import { ServerResponse } from "http";

/**
 * This is a mutated ServerResponse class.
 */

function ServerResponseExtension(res: ServerResponse): ServerResponseX {
    res['contentLength'] = 0;
    res['writeRecord'] = function (chunk: any, callback?: Function): boolean {
        if (chunk instanceof Buffer) {
            this.contentLength += chunk.byteLength;
        } else if (typeof chunk === 'string') {
            this.contentLength += chunk.length;
        } else this.contentLength += chunk.toString().length;
        return res.write(chunk, callback);
    }
    return res as ServerResponseX;
}
class ServerResponseX extends ServerResponse {
    public contentLength = 0;
    public writeRecord: (chunk: any, callback?) => boolean;
}
export { ServerResponseExtension, ServerResponseX };