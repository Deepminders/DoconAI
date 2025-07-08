"use client";

const UpdateDocument = () => {
  return (
    <div className="update-document-container"> 
        <h2 className="text-2xl font-bold mb-4">Update Document</h2>
        <form className="space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-700">Document Name</label>
            <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter document name"
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700">File Upload</label>
            <input
                type="file"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            </div>
            <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
            >
            Update Document
            </button>
        </form>
    </div>
  )
}

export default UpdateDocument