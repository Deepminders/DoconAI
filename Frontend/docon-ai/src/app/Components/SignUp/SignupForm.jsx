// components/SignupForm.jsx
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '../Common/NotificationSystem';

export default function SignupForm() {
  const [formData, setFormData] = useState({
    company: '',
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const notify = useNotifications();
  const router = useRouter();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const key in formData) {
      if (formData[key].trim() === "") {
        notify.warning("Please fill in all fields!");
        return;
      }
    }
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      notify.error("Passwords do not match!");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    notify.warning("Please enter a valid email address!");
    return;
  }

  // Phone number format validation (simple version - only digits, optional + at start)
  


  const userData = {
    company: formData.company,
    firstname: formData.firstname,
    lastname: formData.lastname,
    user_role: "Project Owner",
    email: formData.email,
    password: formData.password,
  };
  try {
    const response = await fetch("http://localhost:8000/user/adduser", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();
    if (response.ok) {
      notify.success("Signup successful!");
      console.log("User created:", result);
      router.push('/Client/Login');
    } else {
      notify.error(result?.Error || "Signup failed.");
    }
  } catch (error) {
    console.error("Error during signup:", error);
    notify.error("An error occurred while signing up.");
  }

    // TODO: Send data to backend API
    // await fetch('/api/signup', { method: 'POST', body: JSON.stringify(formData) });
  };


    return (
        <div className="w-1/2 bg-[#ECF6FF] p-8  h-full text-black scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-blue-100">
        <form className="space-y-4 pr-2" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium ">Company name</label>
            <input
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded shadow"
              placeholder="Company123"
            />
          </div>
  
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium">First name</label>
              <input
                name="firstname"
                type="text"
                value={formData.firstname}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded shadow"
                placeholder="Owner123"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium">Last name</label>
              <input
                name="lastname"
                type="text"
                value={formData.lastname}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded shadow"
                placeholder="Owner123"
              />
            </div>
          </div>
          
        <div ></div>
        

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded shadow"
              placeholder="User123@gmail.com"
            />
          </div>
  
          
  
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded shadow"
              placeholder="***********"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium">Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded shadow"
              placeholder="***********"
            />
          </div>
  
          <button
            type="submit"
            className="w-full bg-[#166394] text-white py-2 rounded shadow hover:bg-[#45496b] transition"
          >
            Sign Up
          </button>
          <div className="text-sm text-center pt-4">
  <span>Already have an account? </span>
  <Link href="/Client/Login" className="text-[#3fa1bc] underline hover:text-[#2f3e59] transition">
    Log in
  </Link>
</div>
        </form>
      </div>
  )};
  