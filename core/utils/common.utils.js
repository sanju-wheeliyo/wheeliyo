const splitReturnFirst = (value) => {
    if (!value) return 0
    let num = value.split(' ')[0];
    return isNaN(num) ? 0 : parseInt(num);
}
const excelPriceToNumber = (value) => {
    const splitValue = value.split(' ')
    const num = splitValue[1]
    const priceType = splitValue[2]
    let price = num
    if(isNaN(price)) return null;
    switch (priceType) {
        case 'Lakh':
            price = num * 100000
            break
        case 'Crore':
            price = num * 10000000
            break
    }
    return price
}
const convertToRegex = (word) => {
    const outOfBondChar = "\\\\|\\.|\\[|\\]|\\{|\\}|\\(|\\)|\\<|\\>|\\*|\\+|\\-|\\=|\\!|\\?|\\^|\\$";
    const outOfBondRegex = new RegExp(outOfBondChar, "ig");
    return word.split("").map(w => w.replace(outOfBondRegex, `\\${w}`)).join("");
}

const commonUtils = {
    splitReturnFirst,
    excelPriceToNumber,
    convertToRegex,
}
export default commonUtils
