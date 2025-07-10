import React from 'react'

const SectionTitle = ({title}) => {
    return (
        <div className="flex line-with-topic items-center">
            <div className="md:w-1/5 h-[1px] bg-sky-900 rounded-l-2xl"></div>
            <div className="md:w-1/5 text-[22px] text-sky-950 text-center font-bold">{title}</div>
            <div className="md:w-3/5 bg-sky-900 rounded-r-2xl ml-3"></div>
        </div>
    )
}

export default SectionTitle