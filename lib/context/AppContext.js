import React, { useEffect, useState } from 'react'

const AppContext = React.createContext()

export const AppContextProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [authenticated, setAuthenticated] = useState(null)
    const [confirm, setConfirm] = useState({
        title: '',
        action: '',
        width: 340,
        cancel: null,
        isOpen: false,
        proceed: null,
        description: '',
        customContent: null,
        cancelButtonLabel: null,
        confirmButtonLabel: null,
    })

    return (
        <AppContext.Provider
            value={{
                user,
                setUser,
                confirm,
                loading,
                setConfirm,
                setLoading,
                authenticated,
                setAuthenticated,
            }}
        >
            {children}
        </AppContext.Provider>
    )
}

export default AppContext
