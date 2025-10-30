import carServices from 'lib/services/car.services'
import { useQuery } from 'react-query'

export const useListBrands = (params) => {
    return useQuery(
        ['list-brands', params],
        () => carServices.listBrands(params),
        {
            select: (data) => data.data,
        }
    )
}

export const useListModels = (params, queryOptions, cacheKey) => {
    return useQuery(
        ['list-models', params?.make_id, cacheKey],
        () => carServices.listModels(params),
        {
            select: (data) => data.data,
            enabled: Boolean(params?.make_id),
            ...queryOptions,
        }
    )
}

export const useListVariants = (params, queryOptions, cacheKey) => {
    return useQuery(
        ["list-variants", params?.model_id],
        () => carServices.listVariants(params),
        {
            select: (data) => data.data,
            enabled: Boolean(params?.model_id),
            ...queryOptions,
        }
    )
}

export const useListFuelTypes = () => {
    return useQuery(['list-fuel-types'], () => carServices.listFuelType(), {
        select: (data) => data.data,
    })
}

export const useListTransmissionTypes = () => {
    return useQuery(
        ['list-transmission-types'],
        () => carServices.listTransmissionType(),
        {
            select: (data) => data.data,
        }
    )
}
