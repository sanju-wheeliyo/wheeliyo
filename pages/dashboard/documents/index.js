import { useState, useEffect, useContext } from 'react'
import Head from 'next/head'
import UserContext from 'lib/context/UserContext'
import UserLayout from 'components/layouts/UserLayout'

export default function Documents() {
    const { setHeader, setHeaderIcon } = useContext(UserContext)
    const [documents, setDocuments] = useState([])

    useEffect(() => {
        // Set header for the layout
        setHeader('Documents')
        setHeaderIcon('/assets/common/sidenav/documents-color.svg')

        // Mock data - replace with actual API call
        setDocuments([
            {
                id: 1,
                name: 'RC Book - Honda City',
                type: 'RC Book',
                status: 'Verified',
                uploadedAt: '2024-01-15',
                size: '2.5 MB',
            },
            {
                id: 2,
                name: 'Insurance Certificate',
                type: 'Insurance',
                status: 'Pending',
                uploadedAt: '2024-01-10',
                size: '1.8 MB',
            },
            {
                id: 3,
                name: 'PUC Certificate',
                type: 'PUC',
                status: 'Verified',
                uploadedAt: '2024-01-05',
                size: '0.9 MB',
            },
        ])
    }, [setHeader, setHeaderIcon])

    return (
        <>
            <Head>
                <title>Documents - Wheeliyo</title>
                <meta name="description" content="Manage your documents" />
            </Head>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Documents
                    </h1>
                    <button className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors">
                        Upload Document
                    </button>
                </div>

                {/* Documents List */}
                <div className="bg-white rounded-2xl shadow-sm">
                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-4">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <svg
                                                className="w-6 h-6 text-blue-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">
                                                {doc.name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {doc.type} • {doc.size} •{' '}
                                                {doc.uploadedAt}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span
                                            className={`px-2 py-1 text-xs rounded-full ${
                                                doc.status === 'Verified'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }`}
                                        >
                                            {doc.status}
                                        </span>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <svg
                                                className="w-5 h-5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {documents.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No documents uploaded
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Upload your car documents to get started
                        </p>
                        <button className="bg-secondary text-white px-6 py-2 rounded-md hover:bg-secondary/90 transition-colors">
                            Upload First Document
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}

Documents.layout = UserLayout
