'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import { useNotifications } from '../Common/NotificationSystem'; // <-- Update path accordingly

export default function LoginForm() {
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });
  const router = useRouter();

  // Initialize notification helpers
  const { success, error, warning } = useNotifications();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setLoginData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loginData.username.trim() === '' || loginData.password.trim() === '') {
      warning('Please fill in both Username and Password!');
      return;
    }

    const formData = new URLSearchParams();
    formData.append('username', loginData.username);
    formData.append('password', loginData.password);

    try {
      const response = await fetch('http://localhost:8000/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data);
        localStorage.setItem('token', data.access_token);
        success('Login successful!');
        router.push('http://localhost:3000/Client/Dashboard');
      } else {
        error(data.detail || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      error('Something went wrong');
    }
  };

  return (
    <div className="w-full md:w-1/2 p-10 sm:p-8">
      <Header />
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={loginData.username}
            onChange={handleChange}
            placeholder="Enter your username"
            className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={loginData.password}
            onChange={handleChange}
            placeholder="Password123"
            className="w-full mt-1 px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#166394] text-white py-2 rounded-md hover:bg-[#45496b] transition duration-200"
        >
          Log in
        </button>

        <div className="text-sm text-center">
          <a href="/Client/ResetRequest" className="text-[#166394] hover:underline">
            Reset password
          </a>
        </div>
        <div className="text-sm text-center">
          <span className="text-gray-600">New to docon ai? </span>
          <a href="/Client/Signup" className="text-[#166394] hover:underline">
            Register
          </a>
        </div>
      </form>
    </div>
  );
}
