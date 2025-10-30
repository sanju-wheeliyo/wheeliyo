import { useListBrands } from 'lib/hooks/useCarService'
import { useMemo, useState } from 'react'
import commontUtils from 'lib/utils/common.utils'
import DualRingLoader from 'components/loaders/DualRingLoader'

const POPULAR_CAR_LOGOS = {
    BMW: {
        img: '/assets/car_logos/bmw-logo.svg',
    },
    Chevrolet: {
        img: '/assets/car_logos/chevrolet-logo.svg',
    },
    Tata: {
        img: '/assets/car_logos/tata-logo.svg',
    },
    'Maruti Suzuki': {
        img: '/assets/car_logos/maruti-logo.svg',
    },
    'Hyundai': {
        img: '/assets/car_logos/hyundai-logo.svg',
    },
    Ford: {
        img: '/assets/car_logos/ford-logo.svg',
    },
    Mahindra: {
        img: '/assets/car_logos/mahindra-logo.svg',
    },
    Honda: {
        img: '/assets/car_logos/honda-logo.svg',
    },
    'Toyota': {
        img: '/assets/car_logos/toyota-logo.svg',
    },
    'Ashok Leyland': {
        img: '/assets/car_logos/ashok-leyland-logo.svg',
    },
    'Aston Martin': {
        img: '/assets/car_logos/aston-martin-logo.svg',
    },
    Audi: {
        img: '/assets/car_logos/audi-logo.svg',
    },
    Austin: {
        img: '/assets/car_logos/austin-logo.svg',
    },
    'Bentley': {
        img: '/assets/car_logos/bentley-logo.svg',
    },
    'Bugatti': {
        img: '/assets/car_logos/bugatti-logo.svg',
    },
    BYD: {
        img: '/assets/car_logos/byd-logo.svg',
    },
    Cadillac: {
        img: '/assets/car_logos/cadillac-logo.svg',
    },
}

const BrandModal = ({ datas, setDatas, setSelected }) => {
    const [selectedTab, setSelectedTab] = useState('popular')

    const { data, isLoading, isFetching } = useListBrands({
        type: selectedTab,
        limit: 9,
    })
    const brands = data?.data

    const [search, setSearch] = useState('')

    const filteredBrands = useMemo(() => {
        const searchRegex = new RegExp(
            commontUtils.convertToRegex(search),
            'gi'
        )
        const filteredBrands = brands?.filter((brand) =>
            brand.name.match(searchRegex)
        )
        return filteredBrands
    }, [brands, search])

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
                    placeholder="Search car brand"
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

            <div className="flex justify-between w-full ">
                <div
                    className={`${selectedTab === 'popular'
                        ? 'border-b-4 border-secondary text-secondary'
                        : 'border-[#ADADAD] text-[#ADADAD]'
                        } w-1/2 border-b-4  p-2 cursor-pointer`}
                    onClick={() => setSelectedTab('popular')}
                >
                    Popular Brands
                </div>
                <div
                    className={`${selectedTab === 'all'
                        ? 'border-b-4 border-secondary text-secondary'
                        : 'border-[#ADADAD] text-[#ADADAD]'
                        } w-1/2 border-b-4  p-2 cursor-pointer`}
                    onClick={() => setSelectedTab('all')}
                >
                    More Brands
                </div>
            </div>
            {(isLoading || isFetching) && <DualRingLoader />}
            {selectedTab === 'popular' && (
                <div className="w-full grid grid-cols-3 mt-5 gap-3 px-3 max-w-[500px]">
                    {filteredBrands &&
                        filteredBrands.map((brand) => {
                            console.log('Brand name:', brand.name);
                            return (
                                <div
                                    key={brand._id}
                                    className={`h-16 col-span-1 bg-[#F2F3F5] rounded-md flex justify-center items-center cursor-pointer`}
                                    onClick={() => {
                                        setDatas({
                                            ...datas,
                                            carBrand: { ...brand },
                                            carYear: '',
                                            carModel: '',
                                            carVariant: '',
                                            carState: '',
                                            carKmDriven: '',
                                        })
                                        setSelected('carModel')
                                    }}
                                >
                                    <img
                                        src={POPULAR_CAR_LOGOS[brand.name]?.img || '/assets/car_logos/default.svg'}
                                        alt="logos"
                                        className="w-12 h-12 object-contain"
                                    />
                                </div>
                            );
                        })}
                </div>
            )}
            {selectedTab === 'all' && (
                <div className="w-full h-full mt-5 px-4 overflow-y-scroll">
                    {filteredBrands &&
                        filteredBrands.map((brand) => (
                            <div
                                key={brand._id}
                                className="h-10 flex  w-full mb-3 bg-[#F2F3F5] rounded-md cursor-pointer"
                                onClick={() => {
                                    setDatas({
                                        ...datas,
                                        carBrand: { ...brand },
                                        carYear: '',
                                        carModel: '',
                                        carVariant: '',
                                        carState: '',
                                        carKmDriven: '',
                                    })
                                    setSelected('carModel')
                                }}
                            >
                                <p className="m-auto">{brand.name}</p>
                            </div>
                        ))}
                </div>
            )}
        </div>
    )
}

export default BrandModal
