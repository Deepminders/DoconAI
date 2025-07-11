'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Check if token exists, if not redirect to login
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login first!');
      router.push('/Pages/Login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-4 text-[#166394]">Dashboard</h1>
      <p className="text-lg text-gray-700">Welcome to your dashboard! 🎉</p>
    </div>
  );
}
