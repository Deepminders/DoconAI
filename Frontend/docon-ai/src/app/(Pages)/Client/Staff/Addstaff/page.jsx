"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import '../../../../CSS/Staff/style.css'; 

const BASE_URL = 'http://localhost:8000';


const AddStaff = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    staff_fname:'',
    staff_lname:'',
    staff_email:'',
    staff_age:'',
    staff_gender:'',
    staff_role:''
  });

  const clearForm = () => {
    setFormData({
      staff_fname: '',
      staff_lname: '',
      staff_email: '',
      staff_role: '',
      staff_age: '',
      staff_gender:''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} to ${value}`); // Debugging
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/staff/addStaff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        throw new Error('Failed to add staff');
      }
      router.push(`/Client/Staff`);
    } catch (err) {
      console.error('Error adding staff:', err);
      alert('Failed to add staff. Please try again.');
    }
  };

  return (
    <div className="add-staff">
      <h2>Add Staff</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fname">First Name</label>
          <input
            type="text"
            id="fname"
            name="staff_fname"
            value={formData.staff_fname}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lname">Last Name</label>
          <input
            type="text"
            id="lname"
            name="staff_lname"
            value={formData.staff_lname}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="staff_email"
            value={formData.staff_email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <input
            type="text"
            id="role"
            name="staff_role"
            value={formData.staff_role}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="staff_age"
            value={formData.staff_age}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <input
            type="text"
            id="gender"
            name="staff_gender"
            value={formData.staff_gender}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          Add Staff
        </button>
        <button type="button" className="clear-button" onClick={clearForm}>
          Clear
        </button>
      </form>
    </div>
  );
};

export default AddStaff;