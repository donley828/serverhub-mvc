import { Headers, IsValidHeaders, IsValidHeader, GetReasonMessage, TransformHeader, FormatDate, StatusCode } from "./head";
import { ServerResponseExtension, ServerResponseX } from "./response";
declare const Head: {
    IsValidHeaders: typeof IsValidHeaders;
    IsValidHeader: typeof IsValidHeader;
    GetReasonMessage: typeof GetReasonMessage;
    TransformHeader: typeof TransformHeader;
    FormatDate: typeof FormatDate;
};
export { Head, Headers, ServerResponseExtension, ServerResponseX, StatusCode };
