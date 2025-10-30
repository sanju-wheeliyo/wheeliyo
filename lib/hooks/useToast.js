'use client'

import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const useToast = () => {
    // Function to display success toast
    const success = (message, options = {}) => {
        toast.success(message, options)
    }

    // Function to display error toast
    const error = (message, options = {}) => {
        toast.error(message, options)
    }

    // Function to display warning toast
    const warning = (message, options = {}) => {
        toast.warning(message, options)
    }

    // Function to display info toast
    const info = (message, options = {}) => {
        toast.info(message, options)
    }

    // Function to dismiss all toasts
    const dismissAll = () => {
        toast.dismiss()
    }

    // Return the functions to be used outside the hook
    return { success, error, warning, info, dismissAll }
}

export default useToast
