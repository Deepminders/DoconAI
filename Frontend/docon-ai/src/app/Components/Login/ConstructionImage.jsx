import Image from 'next/image';

export default function ConstructionImage() {
    return (
        <div>
          <Image 
          src="/free.png"
          alt="Construction Illustration"
          width={500}
          height={500}
          className="hidden md:block object-contain" 
          />
        </div>
    )
}