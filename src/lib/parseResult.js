function parseResult(input) {
    if (!input.match(/^[0-7]{1}\*{0,2}$/)) return null;
    if (input.length === 1) return +input; // Return the number;
    let firstNum = Number(input.substring(0, 1));
    if (firstNum !== 5) return null; // Does not allow * appearing in grades other than 5.
    return firstNum + input.length - 1;
}

export default parseResult;