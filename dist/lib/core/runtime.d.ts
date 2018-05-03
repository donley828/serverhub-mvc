/// <reference types="node" />
import * as stream from "stream";
declare class StreamManager {
    private _openedReadStreams;
    private _openedWriteStreams;
    private static _instance;
    static GetInstance(): StreamManager;
    private constructor();
    PushStream(stream: stream.Stream): boolean;
    Remove(stream?: stream.Stream, signature?: string): boolean;
    Close(stream?: stream.Stream, signature?: string): boolean;
    CloseReadStreams(): void;
    CloseWriteStreams(): void;
    CloseAll(): void;
}
export { StreamManager };
