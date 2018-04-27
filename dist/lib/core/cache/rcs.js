"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("./cache");
const error_1 = require("../error/error");
const storage_1 = require("../storage/storage");
const content_type_1 = require("../content-type");
const helper_1 = require("../helper");
const npath = require("path");
const nfs = require("fs");
const server_1 = require("../server");
class RCS {
    constructor() {
        this.CacheManager = new cache_1.CacheStorage();
    }
    static Service() {
        return RCS.Instance;
    }
    GenerateEtag() {
        let n = 16;
        let tag = '';
        while (n > 0) {
            tag += ['a', 'b', 'c', 'd', 'e', 'f', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'][Math.floor(Math.random() * 10)];
            n--;
        }
        return tag;
    }
    Cacheable(uri) {
        let reg = new RegExp(/^((?:\/[^/?.]*)+)(\/[^/?><#!\\|"'`]*)(\?(?:&?(?:[a-z\d]+=[a-z\d]+)?)+)?$/i);
        let shorreg = new RegExp(/^(\/[^/?><#!\\|"'`]*)(\?(?:&?(?:[a-z\d]+=[a-z\d]+)?)+)?$/i);
        let match = uri.match(reg);
        let shortmatch = uri.match(shorreg);
        if (match || shortmatch) {
            let basedir = match ? match[1] : void 0;
            let file = match ? match[2] : shortmatch[1];
            let search = match ? match[3] : shortmatch[2];
            if (file && file !== '/' && (search === void 0 || search === '?'))
                return true;
            else
                return false;
        }
        else {
            return void 0;
        }
    }
    GetUri(uri, res, req) {
        let variables = global['EnvironmentVariables'];
        if (this.Cacheable(uri)) {
            if (uri.endsWith('?'))
                uri = uri.substr(0, uri.length - 1);
            let cache;
            if (this.CacheManager.HasCache(uri)) {
                cache = this.CacheManager.HitCache(uri);
                if (req.headers['cache-control'] && req.headers['cache-control'] === 'no-cache') {
                    res.setHeader('content-type', cache.content_type);
                    res.setHeader('date', server_1.Head.FormatDate());
                }
                else {
                    res.setHeader('content-type', cache.content_type);
                    res.setHeader('etags', cache.etags);
                    res.setHeader('date', server_1.Head.FormatDate());
                    res.setHeader('last-modified', server_1.Head.FormatDate(cache.modify_time));
                    res.setHeader('cache-control', 'max-age=604800');
                }
                res.writeRecord(cache.cache);
                res.end();
            }
            else {
                let info;
                try {
                    info = storage_1.StorageService.Service(global['EnvironmentVariables'].WebDir).FileInfo(uri.substr(1));
                }
                catch (error) {
                    res.writeHead(404, 'content-type: text/html');
                    if (variables.PageNotFound && variables.PageNotFound.length !== 0)
                        res.writeRecord(helper_1.CacheHelper.Cache(npath.resolve(variables.ServerBaseDir, variables.PageNotFound)).Content);
                    else
                        res.writeRecord(error_1.ErrorManager.RenderErrorAsHTML(error));
                    res.end();
                    return;
                }
                let ext = info.Extension ? info.Extension : '___';
                if (info.Size <= 10 * 1024 * 1024) {
                    try {
                        let file = storage_1.StorageService.Service(variables.WebDir).GetFile(uri.substr(1));
                        cache = new cache_1.Cache(uri, content_type_1.ContentType.GetContentType(ext));
                        cache.etags = this.GenerateEtag();
                        cache.cache = file;
                        cache.date_time = new Date().getTime();
                        cache.modify_time = info.ModifiedTime;
                        cache.size = info.Size;
                        cache.expires = 604800;
                        try {
                            let maxsize = variables.MaxCacheSize * 1024 * 1024;
                            if (cache.size + this.CacheManager.CacheSize() <= maxsize)
                                this.CacheManager.AddCache(cache);
                            else if (cache.size <= maxsize)
                                this.WCS(cache);
                        }
                        catch (err) {
                            this.CacheManager.HitCache(uri);
                        }
                    }
                    catch (error) {
                        res.writeHead(404, 'content-type: text/html');
                        if (variables.PageNotFound && variables.PageNotFound.length !== 0)
                            res.writeRecord(helper_1.CacheHelper.Cache(npath.resolve(variables.ServerBaseDir, variables.PageNotFound)).Content);
                        else
                            res.writeRecord(error_1.ErrorManager.RenderErrorAsHTML(new Error(error_1.ErrorManager.RenderError(error_1.RuntimeError.SH020706, uri))));
                        res.end();
                        return;
                    }
                    if (!res.headersSent) {
                        if (req.headers['cache-control'] && req.headers['cache-control'] === 'no-cache') {
                            res.setHeader('content-type', cache.content_type);
                            res.setHeader('date', server_1.Head.FormatDate());
                        }
                        else {
                            res.setHeader('content-type', cache.content_type);
                            res.setHeader('etags', cache.etags);
                            res.setHeader('date', server_1.Head.FormatDate());
                            res.setHeader('last-modified', server_1.Head.FormatDate(cache.modify_time));
                            res.setHeader('cache-control', 'max-age=604800');
                            res.writeRecord(cache.cache);
                            res.end();
                        }
                    }
                }
                else {
                    try {
                        if (req.headers.hasOwnProperty('range')) {
                            let parsedRanges = helper_1.RangeParser(req.headers['range'], info.Size);
                            if (!parsedRanges)
                                throw new Error();
                            res.statusCode = 206;
                            res.setHeader('accept-ranges', 'bytes');
                            let contentType = content_type_1.ContentType.GetContentType(info.Extension);
                            if (parsedRanges.length === 1) {
                                if (parsedRanges[0].start === 0 && parsedRanges[0].end === info.Size - 1)
                                    res.statusCode = 200;
                                res.setHeader('content-type', contentType);
                                res.setHeader('date', server_1.Head.FormatDate());
                                res.setHeader('content-range', 'bytes ' + parsedRanges.map(r => r.start + '-' + r.end).join(', ')) + '/' + info.Size;
                                let stream = nfs.createReadStream(info.Path, parsedRanges[0]);
                                stream.pipe(res);
                                stream.on('close', () => {
                                    res.end();
                                });
                            }
                            else {
                                res.setHeader('content-type', 'multipart/byteranges; boundary=$serverhubservice');
                                let count = parsedRanges.length;
                                let totalLength = 0;
                                const streamloop = (index) => {
                                    let stream = nfs.createReadStream(info.Path, parsedRanges[index]);
                                    res.writeRecord(`${index !== 0 ? '\n' : ''}--$serverhubservice\nContent-Type: ${contentType}\nContent-Range: bytes ${parsedRanges[index].start}-${parsedRanges[index].end}/${info.Size}\n`);
                                    stream.pipe(res);
                                    stream.on('close', () => {
                                        if (index === count - 1) {
                                            res.end();
                                        }
                                        else {
                                            streamloop(index + 1);
                                        }
                                    });
                                };
                                streamloop(0);
                            }
                        }
                        else {
                            res.setHeader('accept-ranges', 'bytes');
                            res.setHeader('date', server_1.Head.FormatDate());
                            res.setHeader('content-disposition', `attachment; filename="${info.FileName}"`);
                            res.setHeader('content-length', info.Size);
                            res.statusCode = 200;
                            let rstream = nfs.createReadStream(info.Path, { start: 0, end: info.Size });
                            rstream.pipe(res);
                            rstream.on('close', () => {
                                res.end();
                            });
                        }
                    }
                    catch (e) {
                        console.error(e);
                    }
                }
            }
        }
        else
            throw new Error(error_1.ErrorManager.RenderError(error_1.RuntimeError.SH020707, uri));
    }
    GetCacheReport(res) {
        res.setHeader('content-type', "text/html");
        let ret = '';
        let entries = this.CacheManager.CacheReport().entries();
        let total = this.CacheManager.CacheSize();
        for (let item of entries) {
            let cache = item[1];
            ret += `<tr><td class='uri'>${item[0]}</td><td class='id'>${cache.id}</td><td class='weight'>${cache.weight}</td><td class='size'>${cache.size} byte</td></tr>`;
        }
        let displaytotal = '';
        if (total > 1024 * 1024 * 1024) {
            displaytotal = total / 1024 / 1024 / 1024 + ' GB';
        }
        else if (total > 1024 * 1024) {
            displaytotal = total / 1024 / 1024 + ' MB';
        }
        else if (total > 1024) {
            displaytotal = total / 1024 + ' KB';
        }
        else
            displaytotal = total + ' Byte';
        let value = `<html><head>
            <title>ServerHub | Cache Report</title>
            <style>
                body{
                    font-family: 'Segoe UI', sans-serif;
                    color: #424242;
                }
                ul{
                    list-style:none;
                }
                table thead {
                    font-weight: bold;
                }
                table tbody td{
                    font-family: monospace;
                }
                td.uri{
                    color: #2196f3;
                }

                td.id{
                    color: #757575;
                }

                td.weight{
                    color: #424242;
                    font-weight: bold;
                }
                
                td.weight{
                    color: #757575;
                    font-weight: bold;
                }
                
                p.footer span.framework{
                    font-size: 12px;
                    font-family: "Segoe UI", sans-serif;
                    color: #424242;
                    font-weight: bold;
                }
                p.footer span.text{
                    font-size: 12px;
                    font-family: "Segoe UI", sans-serif;
                    color: #757575
                }
            </style>
        </head><body>
        <h2>Cache Usage Report</h2><table border=0><thead><tr><td>URI</td><td>ID</td><td>Weight</td><td>Resource Size</td></tr></thead><tbody>`;
        value += ret;
        value += `</tbody><tr><td colspan=4>Total cache memory usage: ${displaytotal}</td></tr></table><hr/><p class='footer'><span class='framework'>ServerHub</span>&nbsp;<span class='text'>POWERED</span></p></body></html>`;
        res.writeRecord(value);
        res.end();
    }
    WCS(cache) {
        let time_array = new Array(0);
        let weight_array = new Array(0);
        let size_array = new Array(0);
        let entries = this.CacheManager.CacheReport().entries();
        let resultObj = {};
        for (let entry of entries) {
            time_array.push(Object.create(entry[1]));
            weight_array.push(Object.create(entry[1]));
            size_array.push(Object.create(entry[1]));
            resultObj[entry[1].id] = 0;
        }
        time_array = time_array.sort((a, b) => {
            return a.time < b.time ? -1 : 1;
        });
        weight_array = weight_array.sort((a, b) => {
            return a.weight < b.weight ? -1 : 1;
        });
        size_array = size_array.sort((a, b) => {
            return a.size < b.size ? -1 : 1;
        });
        let n = 0;
        while (n < size_array.length) {
            resultObj[time_array[n].id] += (n + 1) * 0.1;
            resultObj[size_array[n].id] += (n + 1) * 0.2;
            resultObj[weight_array[n].id] += (n + 1) * 0.7;
            n++;
        }
        size_array.map(ele => {
            Object.defineProperty(ele, 'priority', {
                value: resultObj[ele.id]
            });
        });
        size_array.sort((a, b) => {
            return a['priority'] - b['priority'] < 0 ? 1 : -1;
        });
        let inc = 0;
        while (inc < cache.size) {
            let last = size_array.pop();
            inc += last.size;
            this.CacheManager.RemoveCache(last.uri);
        }
        this.CacheManager.AddCache(cache);
    }
}
RCS.Instance = new RCS();
exports.RCS = RCS;
