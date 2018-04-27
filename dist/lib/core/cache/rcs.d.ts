/// <reference types="node" />
import { Cache } from './cache';
import { IncomingMessage } from 'http';
import { ServerResponseX } from '../server';
export declare class RCS {
    private constructor();
    private static Instance;
    static Service(): RCS;
    private CacheManager;
    private GenerateEtag();
    Cacheable(uri: string): boolean;
    GetUri(uri: string, res: ServerResponseX, req: IncomingMessage): void;
    GetCacheReport(res: ServerResponseX): void;
    WCS(cache: Cache): void;
}
