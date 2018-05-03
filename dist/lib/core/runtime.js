"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const colors = require("colors");
class StreamManager {
    constructor() {
        this._openedReadStreams = new Array(0);
        this._openedWriteStreams = new Array(0);
        process.on('beforeExit', this.CloseAll);
        process.on('exit', this.CloseAll);
    }
    static GetInstance() {
        return StreamManager._instance;
    }
    PushStream(stream) {
        if (!stream.hasOwnProperty('__serverhub_signature__'))
            return false;
        if (stream instanceof fs.ReadStream) {
            this._openedReadStreams.push(stream);
        }
        else if (stream instanceof fs.WriteStream) {
            this._openedWriteStreams.push(stream);
        }
        else
            return false;
        return true;
    }
    Remove(stream, signature) {
        if (!!stream || !!signature)
            return false;
        if (!!stream) {
            if (stream instanceof fs.ReadStream) {
                let index = -1;
                this._openedReadStreams.forEach((s, i) => {
                    if (index === -1 && s['__serverhub_signature__'] === stream['__serverhub_signature__']) {
                        index = i;
                    }
                });
                if (index !== -1) {
                    this._openedReadStreams = this._openedReadStreams.splice(index, 1);
                }
                return true;
            }
            else if (stream instanceof fs.WriteStream) {
                let index = -1;
                this._openedWriteStreams.forEach((s, i) => {
                    if (index === -1 && s['__serverhub_signature__'] === stream['__serverhub_signature__']) {
                        index = i;
                    }
                });
                if (index !== -1) {
                    this._openedWriteStreams = this._openedWriteStreams.splice(index, 1);
                }
                return true;
            }
            return false;
        }
        else {
            if (stream instanceof fs.ReadStream) {
                let index = -1;
                this._openedReadStreams.forEach((s, i) => {
                    if (index === -1 && s['__serverhub_signature__'] === signature) {
                        index = i;
                    }
                });
                if (index !== -1) {
                    this._openedReadStreams = this._openedReadStreams.splice(index, 1);
                }
                return true;
            }
            else if (stream instanceof fs.WriteStream) {
                let index = -1;
                this._openedWriteStreams.forEach((s, i) => {
                    if (index === -1 && s['__serverhub_signature__'] === signature) {
                        index = i;
                    }
                });
                if (index !== -1) {
                    this._openedWriteStreams = this._openedWriteStreams.splice(index, 1);
                }
                return true;
            }
            return false;
        }
    }
    Close(stream, signature) {
        if (!!stream || !!signature)
            return false;
        if (!!stream) {
            if (stream instanceof fs.ReadStream) {
                let index = -1;
                this._openedReadStreams.forEach((s, i) => {
                    if (index === -1 && s['__serverhub_signature__'] === stream['__serverhub_signature__']) {
                        index = i;
                        s.close();
                    }
                });
                if (index !== -1) {
                    this._openedReadStreams = this._openedReadStreams.splice(index, 1);
                }
                return true;
            }
            else if (stream instanceof fs.WriteStream) {
                let index = -1;
                this._openedWriteStreams.forEach((s, i) => {
                    if (index === -1 && s['__serverhub_signature__'] === stream['__serverhub_signature__']) {
                        index = i;
                        s.close();
                    }
                });
                if (index !== -1) {
                    this._openedWriteStreams = this._openedWriteStreams.splice(index, 1);
                }
                return true;
            }
            return false;
        }
        else {
            if (stream instanceof fs.ReadStream) {
                let index = -1;
                this._openedReadStreams.forEach((s, i) => {
                    if (index === -1 && s['__serverhub_signature__'] === signature) {
                        index = i;
                        s.close();
                    }
                });
                if (index !== -1) {
                    this._openedReadStreams = this._openedReadStreams.splice(index, 1);
                }
                return true;
            }
            else if (stream instanceof fs.WriteStream) {
                let index = -1;
                this._openedWriteStreams.forEach((s, i) => {
                    if (index === -1 && s['__serverhub_signature__'] === signature) {
                        index = i;
                        s.close();
                    }
                });
                if (index !== -1) {
                    this._openedWriteStreams = this._openedWriteStreams.splice(index, 1);
                }
                return true;
            }
            return false;
        }
    }
    CloseReadStreams() {
        this._openedReadStreams.forEach(str => {
            str.close();
        });
        this._openedReadStreams = new Array(0);
    }
    CloseWriteStreams() {
        this._openedWriteStreams.forEach(str => {
            str.close();
        });
        this._openedWriteStreams = new Array(0);
    }
    CloseAll() {
        this.CloseReadStreams();
        this.CloseWriteStreams();
        console.log(colors.gray('>> all read/write streams are closed.'));
    }
}
StreamManager._instance = new StreamManager();
exports.StreamManager = StreamManager;
class RuntimeDC {
    constructor() {
    }
}
RuntimeDC._instance = new RuntimeDC();
