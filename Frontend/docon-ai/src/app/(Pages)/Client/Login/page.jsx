import Head from 'next/head';
import ConstructionImage from "../../../Components/Login/ConstructionImage";
import LoginForm from '../../../Components/Login/LoginForm';
import '../../../globals.css';

export default function Login() {
  return (
    <>
      <Head>
        <title>Log In | DoCon.AI</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        
        {/* 🌄 Background Image */}
        <div className="absolute inset-0 bg-[url('/constructionbg.jpg')] bg-cover bg-center opacity-60 z-0" />

        {/* 🎈 Animated Circles Layer */}
        <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
  <div className="absolute w-72 h-72 bg-blue-200 rounded-full opacity-80 animate-pulse-slow top-10 left-10 blur-3xl" />
  <div className="absolute w-48 h-48 bg-blue-400 rounded-full opacity-40 animate-float top-1/2 right-10 blur-2xl" />
  <div className="absolute w-32 h-32 bg-[#166394] rounded-full opacity-30 animate-pulse-slow bottom-10 left-1/2 blur-2xl" />
</div>
        {/* 🧱 Login Card */}
        <div className="z-20 flex flex-col md:flex-row bg-[#e8effd] shadow-lg rounded-xl overflow-hidden max-w-5xl w-full border-2 border-[#166394] animate-smooth-slide-up">
          <ConstructionImage />
          <LoginForm />
        </div>
      </div>
    </>
  );
}
