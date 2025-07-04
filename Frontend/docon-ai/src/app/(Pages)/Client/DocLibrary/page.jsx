"use client";
import { useState } from 'react';
import DocumentSidebar from '../../../Components/DocumentComponents/DocumentSidebar';

const page = () => {
    const [width,setWidth] = useState(1/3);
    const [isOpen, setIsOpen] = useState(true);


    const onClick= () =>{
        setIsOpen(!isOpen);
        if(isOpen){
            console.log("Open"+isOpen);
        }else{
            console.log("Closed"+isOpen);  
        }
    }
    return (
        <div className="flex flex-col md:flex-row gap-6 p-1">
            
            <div className={`w-full ${isOpen ? 'md:w-1/4' : 'md:w-1/2'} bg-amber-950 transition-all duration-300 ease-in-out`}>
                <DocumentSidebar isOpen={true} onToggle={() => {}} isMobile={false} />
            </div>
            <div className={`w-full ${isOpen ? 'md:w-1/4' : 'md:w-1/2'} bg-amber-950 transition-all duration-300 ease-in-out`}>
                <h1 className="text-2xl font-bold mb-4 text-center">Document Library</h1>
            </div>

            <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                onClick={onClick}> Click to Toggle </button> 


        </div>
    )
}

export default page