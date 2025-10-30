import DualRingLoader from 'components/loaders/DualRingLoader'
import { useListModels } from 'lib/hooks/useCarService'
import commontUtils from 'lib/utils/common.utils'
import { useMemo, useState } from 'react'

const ModelsModal = ({ datas, setDatas, setSelected }) => {
    const { data, isLoading, isFetching } = useListModels({
        make_id: datas?.carBrand?._id,
    })

    const models = data?.data?.models

    const [search, setSearch] = useState('')

    const filteredModels = useMemo(() => {
        const searchRegex = new RegExp(
            commontUtils.convertToRegex(search),
            'gi'
        )
        const filteredModels = models?.filter((model) =>
            model.name.match(searchRegex)
        )
        return filteredModels
    }, [models, search])

    const handleSearch = (e) => {
        setSearch(e.target.value)
    }

    return (
        <div className="h-[415px] mx-3 xl:w-96  bg-gray-medium  xl:bg-gray-light shadow-xl xl:absolute z-30 top-32 xl:rounded-2xl rounded-b-2xl left-0 flex flex-col  gap-3 items-center modal">
            <div className="flex bg-[#F2F3F5] w-[90%] mt-6  p-3 items-center  rounded-lg justify-between">
                <input
                    className="focus:outline-none w-full bg-[#F2F3F5]"
                    type="text"
                    name=""
                    placeholder="Search car model"
                    onChange={handleSearch}
                    id=""
                />
                <img
                    src="/assets/search_icon.png"
                    alt="search"
                    width={16}
                    height={16}
                />
            </div>
            {(isLoading || isFetching) && <DualRingLoader />}
            <div className="w-full h-full mt-5 px-4 overflow-y-scroll">
                {filteredModels &&
                    filteredModels.map((model, i) => (
                        <div
                            key={i}
                            className="h-10 flex  w-full mb-3 bg-[#F2F3F5] rounded-md cursor-pointer"
                            onClick={() => {
                                setDatas({
                                    ...datas,
                                    carModel: { ...model },
                                    carYear: '',
                                    carVariant: '',
                                    carState: '',
                                    carKmDriven: '',
                                })
                                setSelected('carYear')
                            }}
                        >
                            <p className="m-auto">{model.name}</p>
                        </div>
                    ))}
            </div>
        </div>
    )
}

export default ModelsModal
