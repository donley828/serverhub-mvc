"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../util");
class BuiltInLogger {
    static LogRequest(req, statusCode, byteSize) {
        let timezoneOffset = -util_1.DateTime.Now.getTimezoneOffset() / 60;
        let timezone = '';
        if (timezoneOffset > 0) {
            timezone = timezoneOffset < 10 ? `+0${timezoneOffset}00` : `+${timezoneOffset}00`;
        }
        else {
            timezoneOffset = Math.abs(timezoneOffset);
            timezone = timezoneOffset < 10 ? `-0${timezoneOffset}00` : `-${timezoneOffset}00`;
        }
        let log = `${req.connection.remoteAddress ? req.connection.remoteAddress : '-'} [${util_1.DateTime.GetDay()}/${util_1.DateTime.GetMonth()}/${util_1.DateTime.GetYear()}:${util_1.DateTime.GetHours()}:${util_1.DateTime.GetMinutes()}:${util_1.DateTime.GetSeconds()} ${timezone}] "${req.method} ${req.url} HTTP${req['secure'] ? 'S' : ''}/${req.httpVersion}" ${statusCode} ${byteSize ? byteSize : '-'}`;
        process.nextTick(() => console.log(log));
    }
}
exports.BuiltInLogger = BuiltInLogger;
