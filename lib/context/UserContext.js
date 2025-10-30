import { createContext } from 'react'

const UserContext = createContext({
    header: '',
    setHeader: () => {},
    currentTab: 1,
    setCurrentTab: () => {},
    breadcumpsList: [],
    setBreadCumpsList: () => {},
    headerIcon: '',
    setHeaderIcon: () => {},
})

export default UserContext
