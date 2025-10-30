import AOS from 'aos'
import 'aos/dist/aos.css'
import Head from 'next/head'
import '../styles/globals.css'
import '../styles/animation.css'
import { useEffect, useRef } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ReactQueryDevtools } from 'react-query/devtools'
import DefaultLayout from 'components/layouts/DefaultLayout'
import { QueryClient, QueryClientProvider } from 'react-query'
import { AppContextProvider } from 'lib/context/AppContext'
import ConfirmModal from 'components/display/ConfirmModal'

function MyApp({ Component, pageProps }) {
    const Layout = Component.layout || DefaultLayout
    const queryClient = useRef(new QueryClient())

    useEffect(() => {
        AOS.init({
            duration: 500,
            once: false,
        })
    }, [])

    return (
        <>
            <QueryClientProvider client={queryClient.current}>
                <AppContextProvider>
                    <Layout>
                        <Head>
                            <title>Wheeliyo</title>
                        </Head>

                        <ToastContainer
                            position="top-center"
                            autoClose={3000}
                        />
                        <Component {...pageProps} />
                        <ReactQueryDevtools initialIsOpen={false} />
                        <ConfirmModal />
                    </Layout>
                </AppContextProvider>
            </QueryClientProvider>
        </>
    )
}

export default MyApp
