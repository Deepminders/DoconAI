// components/SignupForm.jsx
'use client';
import Image from 'next/image';

import { useState } from 'react';


export default function SignupForm() {
  const [formData, setFormData] = useState({
    company: '',
    firstname: '',
    lastname: '',
    username: '',
    userRole: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: '',
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const key in formData) {
      if (formData[key].trim() === "") {
        alert("Please fill in all fields!");
        return;
      }
    }
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    alert("Please enter a valid email address!");
    return;
  }

  // Phone number format validation (simple version - only digits, optional + at start)
  const phoneRegex = /^\+?\d{10,15}$/;
  if (!phoneRegex.test(formData.phone)) {
    alert("Please enter a valid phone number (10 to 15 digits)!");
    return;
  }


  const userData = {
    company_name: formData.company,
    first_name: formData.firstname,
    last_name: formData.lastname,
    username: formData.username,
    user_role: formData.userRole,
    gender: formData.gender,
    email: formData.email,
    phone_number: formData.phone,
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
      alert("Signup successful!");
      console.log("User created:", result);
    } else {
      alert(result?.Error || "Signup failed.");
    }
  } catch (error) {
    console.error("Error during signup:", error);
    alert("An error occurred while signing up.");
  }

    // TODO: Send data to backend API
    // await fetch('/api/signup', { method: 'POST', body: JSON.stringify(formData) });
  };


    return (
        <div className="w-1/2 bg-[#ECF6FF] p-8 overflow-y-auto h-full">
        <form className="space-y-4 pr-2" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium">Company name</label>
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
          <div>
          <label className="block text-sm font-medium">Username</label>
          <input
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded shadow"
            placeholder="user123"
          />
        </div>
        <div ></div>
        <div className="flex gap-4">
        <div className="w-1/2">
          <label className="block text-sm font-medium">User Role</label>
          <input
            name="userRole"
            type="text"
            value={formData.userRole}
            onChange={handleChange}
            className="mt-1 w-full p-2 border rounded shadow"
            placeholder="e.g., Project Owner"
          />
         </div>
         <div className="w-1/2">
  <label className="block text-sm font-medium mb-1">Gender</label>
  <div className="flex items-center gap-4 mt-3">
    <label className="flex items-center mr-4">
      <input
        type="radio"
        name="gender"
        value="Male"
        checked={formData.gender === "Male"}
        onChange={handleChange}
        className="mr-1"
      />
      Male
    </label>
    <label className="flex items-center mr-4">
      <input
        type="radio"
        name="gender"
        value="Female"
        checked={formData.gender === "Female"}
        onChange={handleChange}
        className="mr-1"
      />
      Female
    </label>
   </div>
    </div></div>
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
            <label className="block text-sm font-medium">Phone Number</label>
            <input
              name="phone"
              type="text"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded shadow"
              placeholder="+94775458724"
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
        </form>
      </div>
  )};
  