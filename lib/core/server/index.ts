/**
 * Server Library
 * 
 * ServerHub MVC, MIT License
 * April 25, 2018
 * Yang Zhongdong (yangzd1996@outlook.com)
 */

import { Headers, IsValidHeaders, IsValidHeader, GetReasonMessage, TransformHeader, FormatDate, StatusCode } from "./head";
import { ServerResponseExtension, ServerResponseX } from "./response";
const Head = {
    IsValidHeaders: IsValidHeaders,
    IsValidHeader: IsValidHeader,
    GetReasonMessage: GetReasonMessage,
    TransformHeader: TransformHeader,
    FormatDate: FormatDate
};
export { Head, Headers, ServerResponseExtension, ServerResponseX, StatusCode };