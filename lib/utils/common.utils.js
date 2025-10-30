const convertToRegex = (word) => {
    const outOfBondChar =
        '\\\\|\\.|\\[|\\]|\\{|\\}|\\(|\\)|\\<|\\>|\\*|\\+|\\-|\\=|\\!|\\?|\\^|\\$'
    const outOfBondRegex = new RegExp(outOfBondChar, 'ig')
    return word
        .split('')
        .map((w) => w.replace(outOfBondRegex, `\\${w}`))
        .join('')
}
const commontUtils = {
    convertToRegex,
}
export default commontUtils
