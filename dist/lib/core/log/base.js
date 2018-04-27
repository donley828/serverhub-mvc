"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("../server");
const Methods = ['GET', 'PUT', 'DELETE', 'PATCH', 'UPDATE', 'POST'];
class LogFilter {
    set StatusCode(sc) {
        if (typeof sc === 'number') {
            if (server_1.StatusCode.includes(sc)) {
                this._StatusCode = sc;
                return;
            }
        }
        else if (sc instanceof Array && sc.length !== 0) {
            let res = [];
            sc.forEach(code => {
                if (server_1.StatusCode.includes(code))
                    res.push(code);
            });
            if (res.length > 0) {
                this._StatusCode = res;
                return;
            }
            else if (res.length === 1) {
                this._StatusCode = res[0];
                return;
            }
        }
        this._StatusCode = false;
    }
    get StatusCode() {
        if (typeof this._StatusCode === 'number' || this._StatusCode === false)
            return this._StatusCode;
        else
            return this._StatusCode.slice(0);
    }
    set Method(m) {
        if (typeof m === 'string') {
            let M = m.toUpperCase();
            if (Methods.includes(m)) {
                this._Method = m;
                return;
            }
        }
        else if (m instanceof Array && m.length !== 0) {
            let res = [];
            m.forEach(metho => {
                let M = metho.toUpperCase();
                if (Methods.includes(metho))
                    res.push(metho);
            });
            if (res.length > 0) {
                this._Method = res;
                return;
            }
            else if (res.length === 1) {
                this._Method = res[0];
                return;
            }
        }
        this._Method = false;
    }
    get Method() {
        if (typeof this._Method === 'number' || this._Method === false)
            return this._Method;
        else
            return this._Method.slice(0);
    }
}
exports.LogFilter = LogFilter;
