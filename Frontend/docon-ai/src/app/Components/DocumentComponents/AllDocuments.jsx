import { Book, BookIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

const AllDocuments = () => {

    const [recentDocs, setRecentDocs] = useState([]);
    const fetchRecentDocuments = async () => {
        // Simulate fetching recent documents from an API  
        const result = await fetch('http://127.0.0.1:8000/api/doc/fetchall')
            .then(response => response.json())
            .catch(error => {
                console.error('Error fetching recent documents:', error);
                return [];
            });
        setRecentDocs(result.recent_documents);
    }

    useEffect(() => {
        fetchRecentDocuments();
    }, []);
    return (
        <div>
            <div className="row flex line-1">
                {
                    (recentDocs.length > 0) ? (
                        <div className="flex ml-10 text-center h-50 justify-center items-center">
                            {recentDocs.map((doc) => (
                                <div key={doc.document_id} className="items-center border border-gray-300 rounded-lg w-40 ml-5 mr-5 h-50 content-center">
                                    <div className="ml-0">
                                        <BookIcon className="text-sky-900 mx-auto mt-2" width={100} height={100} />
                                    </div>
                                    <div className="text-center font-semibold">
                                        {doc.document_name.length>10? `${doc.document_name.slice(0, 10)}...` : doc.document_name}
                                    </div>
                                    <div className="text-center font-semibold text-[13px] -ml-1">
                                        <a href={doc.document_link} target='_blank' className="text-blue-600 hover:underline">
                                            View</a><a href={doc.download_link} target='_blank' className="text-blue-600 hover:underline">
                                            Download</a> 
                                    </div> 
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No recent documents found.</p>
                    )
                }
            </div>


        </div>
    )
}

export default AllDocuments