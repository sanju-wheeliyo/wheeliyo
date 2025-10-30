import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import useApp from './useApp'
import useApi from './useApi'
import { sendOtp } from 'lib/services/auth.service'
import { errorSetter } from 'lib/utils/helper'

function useOtpTimer(initialSeconds, interval = 1000) {
    const [seconds, setSeconds] = useState(initialSeconds)

    // const API_sendOtp = useApi(sendOtp)

    // const { user } = useApp()
    const { setError } = useForm({})
    const intervalRef = useRef(null)

    // const hanldeSentOtp = async (payload, setError) => {
    //     const { isError, errors, data } = await API_sendOtp.request(payload)
    //     if (isError) {
    //         errorSetter(errors, setError)
    //         return false
    //     } else if (!isError) {
    //         localStorage.setItem('SignUpToOtp', true)
    //         localStorage.setItem('name', payload?.value)
    //         router.push('/admin/auth/verify-otp')
    //     }
    // }

    const startTimer = () => {
        intervalRef.current = setInterval(() => {
            setSeconds((prevSeconds) => {
                if (prevSeconds <= 1) {
                    clearInterval(intervalRef.current)
                    return null
                }
                return prevSeconds - 1
            })
        }, interval)
    }

    const resetTimer = async () => {
        setSeconds(initialSeconds)
        clearInterval(intervalRef.current)
        startTimer()
        const payload = {
            value: '',
            // user?.value ||
            // user?.email ||
            // `+${user?.country_code}${user?.phone}`,
        }
        // hanldeSentOtp(payload, setError)
    }

    useEffect(() => {
        startTimer()

        return () => {
            clearInterval(intervalRef.current)
        }
    }, [])

    return { seconds, resetTimer }
}

export default useOtpTimer
