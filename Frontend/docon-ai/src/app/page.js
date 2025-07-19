import Image from "next/image";
import { redirect } from "next/navigation";

export default function Home() {
  return (
    redirect('/Client/Home') // Redirect to the home page
  );
}
