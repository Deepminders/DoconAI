import Image from 'next/image';
import Link from 'next/link';
export default function Header(){
    return (
        <div className="mb-6 text-center">
             <Link href="/Client/Home">
        <Image 
          src="/Docon.aiLogo.png"
          alt="DoCon.AI Logo"
          width={200}
          height={100}
          className="mx-auto cursor-pointer transition-transform hover:scale-105"
        />
      </Link>
            <h1 className="text-2xl font-bold mt-4 text-black">Log In</h1>
        </div>
    );
}