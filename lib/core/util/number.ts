/**
 * Decide how many digits are there in a given number.
 * @param num Number to decide
 */
function HowManyDigits(num: number): number {
    if (num === void 0 || num === null || typeof num !== 'number') return 0;
    num = Math.abs(num);
    let digit = 0;
    let base = 1;
    let done = false;
    if (num === 0)
        return 1;
    while (!done) {
        if (base <= num) {
            base *= 10;
            digit += 1;
        } else done = true;
    }
    return digit;
}


export { HowManyDigits };