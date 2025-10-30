import { Modal } from 'antd'
import { useConfirm } from 'lib/hooks/useConfirm'

function ConfirmModal() {
    const confirm = useConfirm()
    return (
        <Modal
            centered
            style={{
                borderRadius: '18px',
            }}
            width={confirm.width}
            open={confirm.isOpen}
            onCancel={confirm.cancel}
            footer={null}
        >
            <ConfirmModalRenderer confirm={confirm} />
        </Modal>
    )
}

export default ConfirmModal

function ConfirmModalRenderer({ confirm }) {
    return (
        <div className="w-full flex flex-col justify-center items-center">
            <div className="w-full pt-3">
                <p classaName="text-lg font-normal mb-6">{confirm?.title}</p>
                {confirm.customContent && (
                    <div className="my-4">{confirm.customContent}</div>
                )}
                <p className=" text-[13px] font-normal text-[#334155]">
                    {confirm?.description}
                </p>

                <div className="flex mt-5 justify-end items-center w-full">
                    <span className="pr-2">
                        <p
                            onClick={confirm.cancel}
                            className="cursor-pointer text-[17px]"
                        >
                            {confirm.cancelButtonLabel || 'Cancel'}
                        </p>
                    </span>
                    <span className="pl-2">
                        <p
                            onClick={confirm.proceed}
                            className="cursor-pointer text-[17px] text-gradient"
                        >
                            {confirm.confirmButtonLabel || 'Confirm'}
                        </p>
                    </span>
                </div>
            </div>
        </div>
    )
}
