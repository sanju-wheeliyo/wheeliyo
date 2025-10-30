import seedersConstants from 'core/constants/seeders.constants'
import resUtils from 'core/utils/res.utils'
import DbSeeders from 'core/models/db_seeders'

export const dbSeedController = async (req, res, next) => {
    try {
        for (let key of seedersConstants) {
            const { name, func, description } = key
            const isExists = await DbSeeders.exists({ seeder_name: name }) // checking seeder exists on the db

            if (isExists) continue

            await func() // executing seeder

            await DbSeeders.create({
                seeder_name: name,
                description,
            }) // inserting seeder on db
        }

        resUtils.sendSuccess(res, 200, 'All seeders executed successfully')
    } catch (error) {
        console.log(error)
        next(error)
    }
}
