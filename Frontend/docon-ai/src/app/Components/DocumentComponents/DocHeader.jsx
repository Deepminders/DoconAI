import { Search, Send, User2Icon } from 'lucide-react'
import React from 'react'

const DocHeader = () => {
    return (
        <>
            <div className='flex flex-row items-start mt-3'>
                <div className="col md:w-1/5">
                    <h3 className='text-sky-900 text-[20px] font-bold'>My Documents</h3>
                </div>
                <div className="col md:w-3/5 mr-0 align-middle justify-around">
                    <div className="searchbar bg-sky-100 border-0 border-sky-100 rounded-lg flex items-center justify-between p-1 h-[40px]">
                        <Search className='text-sky-900 ml-5 mr-5' width={25} height={25} /> 
                        <div className="bg-sky-950 h-6 w-[2px]" ></div>
                        <input type="text" placeholder='Search Documents' className='w-full bg-sky-100 outline-none text-sky-900 text-[15px] p-1' width={100} />
                        <button className='text-white rounded-lg cursor-pointer px-3 py-1transition-all duration-200' width={100}>
                            <Send className='text-sky-900' width={25} height={25} />
                        </button>
                    </div>
                </div>
                <div className="col md:w-1/5 ml-[30px]">
                    <div className="user flex items-center -mt-2">
                        <h4 className="text-[14px]">Sehara Fernando </h4>
                        <User2Icon height={50} width={50} className='border-sky-400 rounded-lg' />
                    </div>
                </div>
            </div>
        </>
    )
}

export default DocHeader