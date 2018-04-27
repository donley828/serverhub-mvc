import { IncomingMessage } from "http";
import { DateTime } from "../util";

class BuiltInLogger {
    public static LogRequest(req: IncomingMessage, statusCode: number, byteSize: number) {
        let timezoneOffset = -DateTime.Now.getTimezoneOffset() / 60;
        let timezone = '';
        if (timezoneOffset > 0) {
            timezone = timezoneOffset < 10 ? `+0${timezoneOffset}00` : `+${timezoneOffset}00`;
        } else {
            timezoneOffset = Math.abs(timezoneOffset);
            timezone = timezoneOffset < 10 ? `-0${timezoneOffset}00` : `-${timezoneOffset}00`;
        }
        let log = `${req.connection.remoteAddress ? req.connection.remoteAddress : '-'} [${DateTime.GetDay()}/${DateTime.GetMonth()}/${DateTime.GetYear()}:${DateTime.GetHours()}:${DateTime.GetMinutes()}:${DateTime.GetSeconds()} ${timezone}] "${req.method} ${req.url} HTTP${req['secure'] ? 'S' : ''}/${req.httpVersion}" ${statusCode} ${byteSize ? byteSize : '-'}`;
        process.nextTick(() => console.log(log));
    }
}

export { BuiltInLogger };