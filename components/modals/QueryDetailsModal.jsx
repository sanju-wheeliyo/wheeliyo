import React from 'react'
import { Modal } from 'antd'
import ListItem from 'components/pages/leads/ListItem'
import Tags from 'components/admin/common/Tags'

export default function QueryDetailsModal({
    item,
    isModalOpen,
    handleModal,
}) {

    return (
        <Modal
            centered
            // title=""
            open={isModalOpen}
            footer={null}
            width={450}
            onCancel={handleModal}
            className="relative"
        >
            <div className='flex flex-col gap-2 py-4'>
                <p className='text-gradient font-bold text-base'>
                    Basic information
                </p>
                <ListItem
                    keyName="Full name"
                    extraStyles={"!text-grayNormal !font-[400]"}
                    value={item?.first_name + " " + item?.last_name}
                />
                <ListItem
                    value={item?.phone}
                    keyName="Phone number"
                    extraStyles={"!text-grayNormal !font-[400]"}
                />
                <ListItem
                    keyName="Email"
                    value={item?.email}
                    extraStyles={"!text-grayNormal !font-[400]"}
                />
                <ListItem
                    keyName="Subject"
                    value={<Tags tagcontent={item?.query_type} />}
                    extraStyles={"!text-grayNormal !font-[400]"}
                />

                <div className='pt-4'>
                    <p className='text-gradient font-bold text-base'>
                        Message
                    </p>
                    <p className="plus-jakarta-sans text-sm  mt-2 !text-grayNormal !font-[400]">
                        {item?.message || "NIL"}
                    </p>
                </div>
            </div>

        </Modal>
    )
}

