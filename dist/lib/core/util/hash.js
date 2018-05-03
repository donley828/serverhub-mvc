"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const number_1 = require("./number");
const array_1 = require("./array");
function RandomHashTag(length = 16) {
    let v = [];
    while (length > 0) {
        v.push(RandomChar(hex));
        length -= 1;
    }
    return v.join('');
}
exports.RandomHashTag = RandomHashTag;
const alphanumeric = array_1.StringToCharArray('abcdefghijklmnopqrstuvwxyz0123456789');
const hex = array_1.StringToCharArray('abcdef0123456789');
const symbols = array_1.StringToCharArray(`\\\`~!@#$%^&*()-_=+[{]}\|;:'",<.>/?`);
function RandomChar(set) {
    if (set && set.length > 0) {
        let length = set.length;
        let digits = number_1.HowManyDigits(length) + 1;
        let char = set[Math.floor(Math.random() * Math.pow(10, digits)) % length];
        if (char.length === 1)
            return char;
        return char[0];
    }
}
exports.RandomChar = RandomChar;
