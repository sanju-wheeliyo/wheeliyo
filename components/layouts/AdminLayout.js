'use client'

import Header from 'components/admin/common/Header'
import SideDrawer from 'components/admin/common/SideDrawer'
import Loader from 'components/display/Loader'
import AdminContext from 'lib/context/AdminContext'
import { useProtectedRoute } from 'lib/hooks/useProtectedAuth'
import React, { useState, useEffect } from 'react'
import { Button, Drawer } from 'antd'
import { useRouter } from 'next/router'

export default function AdminLayout({ children }) {
    const [header, setHeader] = useState('')
    const [currentTab, setCurremtTab] = useState(1)
    const [breadcumpsList, setBreadCumpsList] = useState([])
    const [open, setOpen] = useState(false)
    const [placement, setPlacement] = useState('left')
    const [headerIcon, setHeaderIcon] = useState('')
    const [redirecting, setRedirecting] = useState(false)
    const router = useRouter()
    const onChange = (e) => {
        setPlacement(e.target.value)
    }

    const { authenticated, loading } = useProtectedRoute({
        adminAuthRequired: true,
    })

    const showDrawer = () => {
        setOpen(true)
    }
    const onClose = () => {
        setOpen(false)
    }
    const screenOptions = { headerShown: false }
    useEffect(() => {
        if (!loading) {
            if (!authenticated) {
                setRedirecting(true)
                router.push('/admin/auth/login')
            } else {
                setRedirecting(false)
            }
        }
    }, [authenticated, loading, router])
    if (redirecting) return <Loader />
    return (
        <AdminContext.Provider
            value={{
                header,
                setHeader,
                currentTab,
                setCurremtTab,
                breadcumpsList,
                setBreadCumpsList,
                headerIcon,
                setHeaderIcon,
            }}
        >
            <div className="w-full py-[14px] h-full lg:h-screen flex flex-col lg:flex-row flex-wrap px-4">
                <div className="w-full cursor-pointer pr-3 pb-4 pl-10 lg:pl-4 pt-2 lg:pt-0 flex lg:hidden items-center justify-between relative">
                    <img
                        className="w-full max-w-[120px] lg:max-w-[150px]"
                        src="/assets/logo.svg"
                        alt="Logo"
                    />
                    <span
                        onClick={showDrawer}
                        className="w-6 h-6 block cursor-pointer absolute left-3 top-3"
                    >
                        <img className="w-full" src="/assets/common/menu.svg" />
                    </span>
                </div>
                <div className="w-full lg:w-[228px] hidden lg:flex pr-0 lg:py-[19px] lg:pr-[15px]">
                    {/* Sider Nav Drawer */}
                    {/* <div className="max-h-[90vh] w-full border border-solid border-gradient p-[30px] side-drawer-img rounded-2xl">
                        <SideDrawer placement={placement} screenOptions />
                    </div> */}

                    <div className="h-[92vh] w-full p-[2px] bg-gradient  rounded-2xl fixed max-w-[228px]">
                        <div className="bg-white h-[calc(92vh-4px)] w-full  rounded-2xl">
                            <div className="h-full bg-white p-[15px] rounded-2xl side-drawer-img">
                                <SideDrawer
                                    placement={placement}
                                    screenOptions
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {/* {isToggled && (
                    
                )} */}

                <Drawer
                    title="Basic Drawer"
                    onClose={onClose}
                    open={open}
                    placement={placement}
                >
                    <SideDrawer closable={false} onClose={onClose} />
                </Drawer>

                {/* Right Hand Side */}
                <div className="w-full lg:w-[calc(100%-228px)] pl-0 lg:px-[15px]">
                    <div className="w-full">
                        {/* Header */}
                        <Header />
                        {/* Filter */}
                        {/* Listing */}
                        <div className="w-full">
                            {/* <Radio.Group
              onChange={({ target: { value } }) => setSelectionType(value)}
              value={selectionType}
            >
              <Radio value="checkbox">Checkbox</Radio>
              <Radio value="radio">Radio</Radio>
            </Radio.Group> */}

                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </AdminContext.Provider>
    )
}
