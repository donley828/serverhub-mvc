import { HowManyDigits } from "./number";
import { StringToCharArray } from "./array";

function RandomHashTag(length = 16): string {
    let v = [];
    while (length > 0) {
        v.push(RandomChar(alphanumeric));
        length -= 1;
    }
    return v.join('');
}
const alphanumeric = StringToCharArray('abcdefghijklmnopqrstuvwxyz0123456789');
const symbols = StringToCharArray(`\\\`~!@#$%^&*()-_=+[{]}\|;:'",<.>/?`);
function RandomChar(set: string[]): string {
    if (set && set.length > 0) {
        let length = set.length;
        let digits = HowManyDigits(length) + 1;
        let char = set[Math.floor(Math.random() * Math.pow(10, digits)) % length];
        if (char.length === 1) return char;
        return char[0];
    }
}

export { RandomHashTag, RandomChar };