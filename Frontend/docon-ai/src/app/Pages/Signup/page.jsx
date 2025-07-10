import Description from '../../Components/SignUp/Description';
import SignupForm from '../../Components/SignUp/SignupForm';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col">
         <div className="absolute inset-0 bg-[url('/constructionbg.jpg')] bg-cover bg-center opacity-70"> </div>
         <div className="absolute inset-0 bg-black opacity-60 z-0"></div>
      <div className="flex flex-1 items-center justify-center px-4 py-8">
     
        <div className="bg-[#ECF6FF] z-10 rounded-xl shadow-lg flex w-full max-w-5xl overflow-hidden h-150">
          <Description />
          <SignupForm />
        </div>
      </div>
    </div>
  );
}