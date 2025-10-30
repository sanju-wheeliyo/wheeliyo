import country from 'core/models/country'

const bulkInsert = async (data) => {
    const res = await country.insertMany(data)
    return res
}

const getAllCountries = async () => {
    const res = await country.find()
    return res
}

const getAllCountriesFilterBy = async (page, limit) => {
    const res = await country.aggregate([
        {
            $skip: (page - 1) * limit,
        },
        {
            $limit: limit,
        },
        {
            $sort: { createdAt: -1 },
        },
    ])
    const count = await country.aggregate([
        {
            $count: 'total',
        },
    ])

    return {
        data: res,
        count: count[0]?.total,
    }
}

export default { bulkInsert, getAllCountriesFilterBy, getAllCountries }
