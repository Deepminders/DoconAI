
import Head from 'next/head';
import ConstructionImage from '@/app/Components/Login/ConstructionImage';
import LoginForm from '@/app/Components/Login/LoginForm';
import '@/app/globals.css'

export default function Login() {
    return (
     <>
     <Head>
        <title>Log In | DoCon.AI</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[url('/constructionbg.jpg')] bg-cover bg-center opacity-70"> </div>
      <div className="absolute inset-0 bg-black opacity-60 z-0"></div>
        <div className="z-10 flex flex-col md:flex-row bg-[#eaf1fb] shadow-lg rounded-xl overflow-hidden max-w-5xl w-full border-2 border-[#166394] ">
          <ConstructionImage />
          <LoginForm />
          </div>

       
      </div>
     </>
      
    );
  }