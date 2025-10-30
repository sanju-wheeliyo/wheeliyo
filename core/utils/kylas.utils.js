import axios from 'axios'
import {
    KYLAS_END_POINT,
    KYLAS_UNIVERSAL_API_KEY,
    KYLAS_VEHICLE_BRAND_KEY,
    KYLAS_VEHICLE_KM_KEY,
    KYLAS_VEHICLE_MODEL_KEY,
    KYLAS_VEHICLE_NUMBER_KEY,
    KYLAS_VEHICLE_STATE_KEY,
    KYLAS_VEHICLE_VARIANT_KEY,
    KYLAS_VEHICLE_YEAR_KEY,
} from 'core/constants/kylas'

/**
 * @param {Object} params
 * @param {string} params.name
 * @param {string} params.email
 * @param {string} params.mobile
 * @param {string} params.carNumber
 * @param {string} params.carBrand
 * @param {string} params.carYear
 * @param {string} params.carModel
 * @param {string} params.carVariant
 * @param {string} params.carState
 * @param {string} params.carKmDriven
 */
const createLead = async (params = {}) => {
    let body = {
        firstName: params.name,
        phoneNumbers: [
            {
                type: 'MOBILE',
                code: 'IN',
                value: params.mobile,
                dialCode: '+91',
                primary: true,
            },
        ],
        ...(params.email
            ? {
                  emails: [
                      {
                          type: 'OFFICE',
                          value: params.email,
                          primary: true,
                      },
                  ],
              }
            : {}),
        customFieldValues: {
            [KYLAS_VEHICLE_BRAND_KEY]: params.carBrand,
            [KYLAS_VEHICLE_KM_KEY]: params.carKmDriven,
            [KYLAS_VEHICLE_MODEL_KEY]: params.carModel,
            [KYLAS_VEHICLE_NUMBER_KEY]: params.carNumber,
            [KYLAS_VEHICLE_STATE_KEY]: params.carState,
            [KYLAS_VEHICLE_VARIANT_KEY]: params.carVariant,
            [KYLAS_VEHICLE_YEAR_KEY]: params.carYear,
        },
    }
    // const res = await axios.post(KYLAS_END_POINT + 'leads', body, {
    //     headers: {
    //         'api-key': KYLAS_UNIVERSAL_API_KEY,
    //     },
    // })

    // return res
    return body;
}

const kylasUtils = {
    createLead,
}
export default kylasUtils
