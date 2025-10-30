import commontUtils from 'lib/utils/common.utils'
import { getStates } from 'lib/utils/getStates'
import { useMemo, useState } from 'react'

const StatesModal = ({ datas, setDatas, setSelected }) => {
    const [search, setSearch] = useState('')

    const states = getStates()
    const filteredStates = useMemo(() => {
        const searchRegex = new RegExp(
            commontUtils.convertToRegex(search),
            'gi'
        )
        const filteredStates = states?.filter((state) =>
            state.key.match(searchRegex)
        )
        return filteredStates
    }, [states, search])

    const handleSearch = (e) => {
        setSearch(e.target.value)
    }

    return (
        <div className="h-[415px] mx-3 xl:w-96  bg-gray-medium  xl:bg-gray-light shadow-xl xl:absolute z-30 top-32 xl:rounded-2xl rounded-b-2xl left-[-75px] flex flex-col  gap-3 items-center modal">
            <div className="flex bg-[#F2F3F5] w-[90%] mt-6  p-3 items-center  rounded-lg justify-between">
                <input
                    className="focus:outline-none w-full bg-[#F2F3F5]"
                    type="text"
                    name=""
                    placeholder="Search Reg. state"
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
                {filteredStates &&
                    filteredStates.map((state, i) => (
                        <div
                            key={i}
                            className="h-10 flex  w-full mb-3 bg-[#F2F3F5] rounded-md cursor-pointer"
                            onClick={() => {
                                setDatas({
                                    ...datas,
                                    carState: { ...state },
                                })
                                setSelected('')
                            }}
                        >
                            <p className="m-auto">{state.label}</p>
                        </div>
                    ))}
            </div>
        </div>
    )
}

export default StatesModal
