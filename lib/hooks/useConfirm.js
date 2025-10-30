import useApp from './useApp'

export const useConfirm = () => {
    const { confirm, setConfirm } = useApp()

    function isConfirmed({
        title,
        width,
        description,
        customContent,
        cancelButtonLabel,
        confirmButtonLabel,
    }) {
        const promise = new Promise((resolve, reject) => {
            setConfirm({
                title,
                width,
                isOpen: true,
                description,
                customContent,
                cancel: reject,
                proceed: resolve,
                cancelButtonLabel,
                confirmButtonLabel,
            })
        })
        return promise.then(
            () => {
                setConfirm({ ...confirm, action: '', isOpen: false })
                return true
            },
            () => {
                setConfirm({ ...confirm, action: '', isOpen: false })
                return false
            }
        )
    }

    return { ...confirm, isConfirmed }
}
