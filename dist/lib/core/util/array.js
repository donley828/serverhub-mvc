"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function StringToCharArray(input) {
    if (input === void 0 || input === null || typeof input !== 'string' || input.length === 0)
        return [];
    else
        return input.match(/(.)/g).slice(1);
}
exports.StringToCharArray = StringToCharArray;
