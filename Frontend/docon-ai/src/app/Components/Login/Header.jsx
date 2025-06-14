import Image from 'next/image';

export default function Header(){
    return (
        <div className="mb-6 text-center">
            <Image 
            src="/Docon.aiLogo.png"
            alt="DoCon.AI Logo"
            width={200}
            height={100}
            className="mx-auto"
            />
            <h1 className="text-2xl font-bold mt-4">Log In</h1>
        </div>
    );
}