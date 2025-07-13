// components/LeftSection.jsx
import Image from 'next/image';

export default function LeftSection() {
  return (
    <div className="w-1/2 bg-[#ECF6FF] p-8 flex flex-col justify-center items-start mt-8 ">
      <h2 className="text-4xl font-bold mb-2 text-black">Hello!</h2>
      <h3 className="text-2xl font-semibold text-blue-800">Welcome to DoCon.AI</h3>
      <p className="text-sm text-[#166394] mb-6">Please signup to continue</p>
      <Image
        src="/Conworker.jpg"
        alt="Construction Worker"
        width={500}
        height={500}
        className="hidden md:block object-contain"
      />
    </div>
  );
}
