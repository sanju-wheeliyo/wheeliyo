import contact from 'core/models/contact'

const getAllQueriesFilterBy = async (search, page, limit) => {
    const searchRegex = new RegExp(search, 'i')

    const pipeline = [
        {
            $match: {
                $or: [{ first_name: searchRegex }],
            },
        },
    ]
    const res = await contact.aggregate([
        ...pipeline,
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
    const count = await contact.aggregate([
        ...pipeline,
        {
            $count: 'total',
        },
    ])

    return {
        data: res,
        count: count[0]?.total,
    }
}

const postAQuery = async (data) => {
    return await contact.create(data)
}

const deleteAQuery = async (id) => {
    return await contact.deleteOne({ _id: id })
}

export default {
    postAQuery,
    deleteAQuery,
    getAllQueriesFilterBy,
}
