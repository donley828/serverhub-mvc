"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const head_1 = require("./head");
const response_1 = require("./response");
exports.ServerResponseExtension = response_1.ServerResponseExtension;
exports.ServerResponseX = response_1.ServerResponseX;
const Head = {
    IsValidHeaders: head_1.IsValidHeaders,
    IsValidHeader: head_1.IsValidHeader,
    GetReasonMessage: head_1.GetReasonMessage,
    TransformHeader: head_1.TransformHeader,
    FormatDate: head_1.FormatDate
};
exports.Head = Head;
