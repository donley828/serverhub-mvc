function StringToCharArray(input: string): string[] {
    if (input === void 0 || input === null || typeof input !== 'string' || input.length === 0)
        return [];
    else return input.match(/(.)/g).slice(1);
}

export { StringToCharArray };