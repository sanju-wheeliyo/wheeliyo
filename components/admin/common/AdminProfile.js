'use client'

import useApp from 'lib/hooks/useApp'

export default function AdminProfile(item, data) {
    const { user } = useApp()
    return (
        <>
            <div className="flex items-center">
                <img
                    className="w-[30px] lg:w-[43px] h-[30px] lg:h-[43px] rounded-full overflow-hidden"
                    src="/assets/common/profile-avatar.svg"
                />
                <span className="hidden pl-2 md:flex flex-col leading-[12px]">
                    <span className="text-xs text-[#64748B] leading-[12px] pb-1">
                        {user?.role?.role}
                    </span>
                    <span className="text-[14px] lg:text-lg text-[#000000] font-[600] leading-[12px]">
                        {user?.name}
                    </span>
                    {/* <h3>{user?.name}</h3> */}
                </span>
            </div>
        </>
    )
}
