import { useState } from 'react'
import LeadsApi from 'lib/services/car.services'
import AddLeadModal from 'components/modals/AddLeadModal'
import LeadDetailsModal from 'components/modals/LeadDetailsModal'
import useApi from 'lib/hooks/useApi'

export const ActionColoumn = ({
    item,
    error,
    success,
    cacheKey,
    queryClient,
    isConfirmed,
}) => {
    const [viewModal, setViewModal] = useState(false)
    const [editModal, setEditModal] = useState(false)

    const API_deleteLead = useApi(LeadsApi.deleteALead)

    const handleDeleteLead = async (id) => {
        try {
            if (
                await isConfirmed({
                    title: 'Delete this lead',
                    description: 'Are you sure you want to delete this lead ?',
                    confirmButtonLabel: 'Yes',
                    cancelButtonLabel: 'No',
                })
            ) {
                const res = await API_deleteLead.request(id)
                if (res?.isError) {
                    error('Failed to delete this lead.')
                } else {
                    success('Lead deleted successfully')
                    queryClient.invalidateQueries([cacheKey])
                }
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleViewModal = () => {
        setViewModal(!viewModal)
    }

    const handleEditModal = () => {
        setEditModal(!editModal)
    }

    return (
        <ul className="flex items-center">
            <li className="pr-2">
                <span
                    onClick={handleViewModal}
                    className="block w-5 cursor-pointer"
                >
                    <img className="w-full" src="/assets/common/eye.svg" />
                </span>
                <LeadDetailsModal
                    cacheKey={cacheKey}
                    item={item}
                    isModalOpen={viewModal}
                    handleModal={handleViewModal}
                    handleDelete={() => handleDeleteLead(item?._id)}
                />
            </li>
            <li className="px-2">
                <span
                    onClick={handleEditModal}
                    className="block w-5 cursor-pointer"
                >
                    <img
                        className="w-full"
                        src="/assets/common/edit-gradient.svg"
                    />
                </span>
                <AddLeadModal
                    mode="edit"
                    details={item}
                    isModalOpen={editModal}
                    handleModal={handleEditModal}
                />
            </li>
            <li className="px-2">
                <span className="block w-5 cursor-pointer">
                    <img
                        className="w-full cursor-pointer"
                        onClick={() => handleDeleteLead(item?._id)}
                        src="/assets/common/delete-gradient.svg"
                    />
                </span>
            </li>
        </ul>
    )
}
