import React from 'react'

export default function BreadCumps({ items, currentTab = 1 }) {
    return (
        <div className={'w-full flex flex-wrap '}>
            {items?.map((item, i) => {
                const SiNo = i + 1
                const isCompleted = SiNo < currentTab
                const isLastItem = SiNo === items?.length
                const isPonter = item.onClick ? true : false

                return (
                    <div
                        key={i}
                        onClick={() => {
                            item?.onClick && item?.onClick()
                        }}
                    >
                        <p
                            className={` text-[14px] text-[#565973] ${
                                isPonter && 'cursor-pointer'
                            } ${isCompleted ? 'font-medium' : 'font-bold'} ${
                                i > 0 && 'pl-2'
                            }`}
                        >
                            {item?.title} {!isLastItem && '/ '}
                        </p>
                    </div>
                )
            })}
        </div>
    )
}
