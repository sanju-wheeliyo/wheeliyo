import React from 'react'

export default function Loader() {
    return (
        <div className="w-[100vw] h-[100vh] flex flex-col gap-2 justify-center items-center">
            <div className="p-2 bg-gradient-to-tr animate-spin from-[#D01768] to-[#CF1669] via-[#F55C33] rounded-full">
                <div className="bg-white rounded-full">
                    <div className="w-5 h-5 rounded-full"></div>
                </div>
            </div>
            <p>One moment, please…</p>
        </div>
    )
}
