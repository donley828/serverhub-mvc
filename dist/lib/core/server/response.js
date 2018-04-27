"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
function ServerResponseExtension(res) {
    res['contentLength'] = 0;
    res['writeRecord'] = function (chunk, callback) {
        if (chunk instanceof Buffer) {
            this.contentLength += chunk.byteLength;
        }
        else if (typeof chunk === 'string') {
            this.contentLength += chunk.length;
        }
        else
            this.contentLength += chunk.toString().length;
        return res.write(chunk, callback);
    };
    return res;
}
exports.ServerResponseExtension = ServerResponseExtension;
class ServerResponseX extends http_1.ServerResponse {
    constructor() {
        super(...arguments);
        this.contentLength = 0;
    }
}
exports.ServerResponseX = ServerResponseX;
