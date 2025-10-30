import fs from 'fs'
// import readXlsxFile from 'read-excel-file/node'
import xlsx from 'node-xlsx'
const readExcelData = async (path) => {
    console.log('[*] Parsing excel...')
    const sheetArray = xlsx.parse(path)

    console.log('[*] Parsing completed')
    console.log('[*] Making proper object array of excel...')
    const titleArr = sheetArray[0].data[2]
    const resultArr = []
    sheetArray[0].data.forEach((items, index) => {
        if (index < 16) return
        let body = {}
        items?.forEach((value, index) => {
            if (!titleArr[index]) return
            body = {
                ...body,
                [titleArr[index]]: value,
            }
        })
        resultArr.push(body)
    })
    console.log('[*] Object Array of excel creation completed')
    return resultArr
    // return sheetArray
}
const returnModelOnly = (word) => {
    if (!word.match) return word.toString()
    return (
        word
            .match(/(.*)([^\\[\d{4}-\d{4}\]])/g)
            ?.join('')
            ?.trim() || word
    )
}

const excelUtils = {
    readExcelData,
    returnModelOnly,
}
export default excelUtils
