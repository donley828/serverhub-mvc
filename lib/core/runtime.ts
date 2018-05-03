import * as fs from "fs";
import * as stream from "stream";
import * as colors from 'colors';

class StreamManager {
    private _openedReadStreams: Array<fs.ReadStream>
    private _openedWriteStreams: Array<fs.WriteStream>;
    private static _instance = new StreamManager();
    public static GetInstance(): StreamManager {
        return StreamManager._instance;
    }

    private constructor() {
        this._openedReadStreams = new Array<fs.ReadStream>(0);
        this._openedWriteStreams = new Array<fs.WriteStream>(0);
        process.on('beforeExit', this.CloseAll);
        process.on('exit', this.CloseAll);
    }

    public PushStream(stream: stream.Stream): boolean {
        if (!stream.hasOwnProperty('__serverhub_signature__'))
            return false;
        if (stream instanceof fs.ReadStream) {
            this._openedReadStreams.push(stream);
        } else if (stream instanceof fs.WriteStream) {
            this._openedWriteStreams.push(stream);
        } else return false;
        return true;
    }

    public Remove(stream?: stream.Stream, signature?: string): boolean {
        if (!!stream || !!signature)
            return false;
        if (!!stream) {
            if (stream instanceof fs.ReadStream) {
                let index = -1;
                this._openedReadStreams.forEach((s, i) => {
                    if (index === -1 && s['__serverhub_signature__'] === stream['__serverhub_signature__']) {
                        index = i;
                    }
                })
                if (index !== -1) {
                    this._openedReadStreams = this._openedReadStreams.splice(index, 1);
                }
                return true;
            } else if (stream instanceof fs.WriteStream) {
                let index = -1;
                this._openedWriteStreams.forEach((s, i) => {
                    if (index === -1 && s['__serverhub_signature__'] === stream['__serverhub_signature__']) {
                        index = i;
                    }
                })
                if (index !== -1) {
                    this._openedWriteStreams = this._openedWriteStreams.splice(index, 1);
                }
                return true;
            } return false;
        } else {
            if (stream instanceof fs.ReadStream) {
                let index = -1;
                this._openedReadStreams.forEach((s, i) => {
                    if (index === -1 && s['__serverhub_signature__'] === signature) {
                        index = i;
                    }
                })
                if (index !== -1) {
                    this._openedReadStreams = this._openedReadStreams.splice(index, 1);
                }
                return true;
            } else if (stream instanceof fs.WriteStream) {
                let index = -1;
                this._openedWriteStreams.forEach((s, i) => {
                    if (index === -1 && s['__serverhub_signature__'] === signature) {
                        index = i;
                    }
                })
                if (index !== -1) {
                    this._openedWriteStreams = this._openedWriteStreams.splice(index, 1);
                }
                return true;
            }
            return false;
        }

    }

    public Close(stream?: stream.Stream, signature?: string): boolean {
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
                })
                if (index !== -1) {
                    this._openedReadStreams = this._openedReadStreams.splice(index, 1);
                }
                return true;
            } else if (stream instanceof fs.WriteStream) {
                let index = -1;
                this._openedWriteStreams.forEach((s, i) => {
                    if (index === -1 && s['__serverhub_signature__'] === stream['__serverhub_signature__']) {
                        index = i;
                        s.close();
                    }
                })
                if (index !== -1) {
                    this._openedWriteStreams = this._openedWriteStreams.splice(index, 1);
                }
                return true;
            } return false;
        } else {
            if (stream instanceof fs.ReadStream) {
                let index = -1;
                this._openedReadStreams.forEach((s, i) => {
                    if (index === -1 && s['__serverhub_signature__'] === signature) {
                        index = i;
                        s.close();
                    }
                })
                if (index !== -1) {
                    this._openedReadStreams = this._openedReadStreams.splice(index, 1);
                }
                return true;
            } else if (stream instanceof fs.WriteStream) {
                let index = -1;
                this._openedWriteStreams.forEach((s, i) => {
                    if (index === -1 && s['__serverhub_signature__'] === signature) {
                        index = i;
                        s.close();
                    }
                })
                if (index !== -1) {
                    this._openedWriteStreams = this._openedWriteStreams.splice(index, 1);
                }
                return true;
            }
            return false;
        }

    }

    public CloseReadStreams(): void {
        this._openedReadStreams.forEach(str => {
            str.close();
        });
        this._openedReadStreams = new Array<fs.ReadStream>(0);
    }

    public CloseWriteStreams(): void {
        this._openedWriteStreams.forEach(str => {
            str.close();
        });
        this._openedWriteStreams = new Array<fs.WriteStream>(0);
    }

    public CloseAll(): void {
        this.CloseReadStreams();
        this.CloseWriteStreams();
        console.log(colors.gray('>> all read/write streams are closed.'));
    }
}

class RuntimeDC {
    private static _instance = new RuntimeDC();
    private constructor() {

    }
}
export { StreamManager };