import commontUtils from 'lib/utils/common.utils'
import { getKms } from 'lib/utils/getKms'
import { useMemo, useState } from 'react'

const KmsModal = ({ datas, setDatas, setSelected }) => {
    const kms = getKms()

    const [search, setSearch] = useState('')

    const filteredKms = useMemo(() => {
        const searchRegex = new RegExp(
            commontUtils.convertToRegex(search),
            'gi'
        )
        const filteredKms = kms?.filter((state) => state.key.match(searchRegex))
        return filteredKms
    }, [kms, search])

    const handleSearch = (e) => {
        setSearch(e.target.value)
    }

    const parseKey = (key) => {
        const [min, max] = key.split('-').map(Number)
        return { minKilometers: min, maxKilometers: max }
    }
    return (
        <div className="h-[415px] mx-3 xl:w-96  bg-gray-medium  xl:bg-gray-light shadow-xl xl:absolute z-30 top-32 xl:rounded-2xl rounded-b-2xl left-0 flex flex-col  gap-3 items-center modal">
            <div className="flex bg-[#F2F3F5] w-[90%] mt-6  p-3 items-center  rounded-lg justify-between">
                <input
                    className="focus:outline-none w-full bg-[#F2F3F5]"
                    type="text"
                    name=""
                    placeholder="Search KMs driven"
                    id=""
                    onChange={handleSearch}
                />
                <img
                    src="/assets/search_icon.png"
                    alt="search"
                    width={16}
                    height={16}
                />
            </div>
            <div className="w-full h-full mt-5 px-4 overflow-y-scroll">
                {filteredKms &&
                    filteredKms.map((km, i) => (
                        <div
                            key={i}
                            className="h-10 flex  w-full mb-3 bg-[#F2F3F5] rounded-md cursor-pointer"
                            onClick={() => {
                                const { minKilometers, maxKilometers } =
                                    parseKey(km.key)
                                setDatas({
                                    ...datas,
                                    minKilometers,
                                    maxKilometers,
                                    carState: '',
                                })
                                setSelected('carState')
                            }}
                        >
                            <p className="m-auto">{km.label}</p>
                        </div>
                    ))}
            </div>
        </div>
    )
}

export default KmsModal
