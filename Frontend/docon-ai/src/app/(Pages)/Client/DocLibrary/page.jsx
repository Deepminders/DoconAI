"use client";
import { useState } from 'react';
import DocumentSidebar from '../../../Components/DocumentComponents/DocumentSidebar';
import DocHeader from '../../../Components/DocumentComponents/DocHeader';
import SectionTitle from '../../../Components/DocumentComponents/SectionTitle';
import AllDocuments from '../../../Components/DocumentComponents/AllDocuments';
import UploadDocument from '../../../Components/DocumentComponents/UploadDocument';
import "../../../CSS/Docs/style.css";
import { Section } from 'lucide-react';
const page = () => {
    const [width, setWidth] = useState(1 / 3);
    const [isOpen, setIsOpen] = useState(true);


    const onClick = () => {
        setIsOpen(!isOpen);
        if (isOpen) {
            console.log("Open" + isOpen);
        } else {
            console.log("Closed" + isOpen);
        }
    }
    return (
        <>
            <div className="flex md:flex-row gap-6 p-1">

                <div className={`md:w-1/7 transition-all duration-300 ease-in-out`}>
                    <DocumentSidebar isOpen={true} onToggle={() => { }} isMobile={false} />
                </div>

                <div className="md:w-4/5 transition-all duration-300 ease-in-out ml-5">
                    <DocHeader />
                    <SectionTitle title={"New Document"} />
                    <UploadDocument />
                    <SectionTitle title={"Recent Documents"} />
                    <AllDocuments />
                    <SectionTitle title={"Upload Summary"} />
                </div>
            </div>
        </>
    )
}

export default page