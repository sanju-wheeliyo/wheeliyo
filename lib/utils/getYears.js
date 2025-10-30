export const getYears = () => {
    const currentYear = new Date().getFullYear()
    const startYear = 1988

    const years = []

    for (let i = currentYear; i >= startYear; i--) {
        years.push(i)
    }
    return years
}
