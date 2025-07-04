/*'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import '../../../../../CSS/staff/style.css';

const UpdateStaff = () => {
  const router = useRouter();
  const { staff_id } = useParams();
  const [staff_fname,setstaff_fname] = useState("");
  const [staff_lname,setstaff_lname] = useState("");
  const [staff_email,setstaff_email] = useState("");
  const [staff_age,setstaff_age] = useState(0);
  const [staff_gender,setstaff_gender] = useState("");
  const [staff_role,setstaff_role] = useState("");

  //Fetch current staff details
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        console.log(staff_id);
        const res = await fetch(`http://localhost:8000/staff/findStaff/${staff_id}`
        );
        const data = await res.json();
        setstaff_fname(data.Staff.staff_fname);
        setstaff_lname(data.Staff.staff_lname);
        setstaff_email(data.Staff.staff_email);
        setstaff_age(data.Staff.staff_age);
        setstaff_gender(data.Staff.staff_gender);
        setstaff_role(data.Staff.staff_role);
        
      } catch (err) {
        console.error('Error fetching staff:', err);
      }
    };

    fetchStaff();
  }, [staff_id]);

  //Handle update on button click
  const handleupdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8000/staff/update/${staff_id}`, {

        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          staff_fname,
          staff_lname,
          staff_email,
          staff_age,
          staff_gender,
          staff_role
        })
      });

      if (!res.ok) throw new Error('Failed to update staff');

      alert('Staff updated successfully!');
      router.push('/Client/Staff');
    } catch (err) {
      console.error('Error updating staff:', err);
      alert('Update failed!');
    }
  };

  return (
    <div className="update-staff">
      <h2>Update Staff</h2>
    <form onSubmit={handleupdate}>
        <div className="form-group">
          <label htmlFor="fname">First Name</label>
          <input
            type="text"
            id="fname"
            name="staff_fname"
            value={staff_fname}
            onChange={(e) => setstaff_fname(e.target.value)}
        
          />
        </div>
        <div className="form-group">
          <label htmlFor="lname">Last Name</label>
          <input
            type="text"
            id="lname"
            name="staff_lname"
            value={staff_lname}
            onChange={(e) => setstaff_lname(e.target.value)}
        
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="staff_email"
            value={staff_email}
            onChange={(e) => setstaff_email(e.target.value)}
    
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <input
            type="text"
            id="role"
            name="staff_role"
            value={staff_role}
            onChange={(e) => setstaff_role(e.target.value)}
            
          />
        </div>
        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="staff_age"
            value={staff_age}
            onChange={(e) => setstaff_age(Number(e.target.value))}
        
          />
        </div>
        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <input
            type="text"
            id="gender"
            name="staff_gender"
            value={staff_gender}
            onChange={(e) => setstaff_gender(e.target.value)}
            
          />
        </div>
      <button type="submit" className='update_button'>Update</button>
    </form>
    </div>
  );
};

export default UpdateStaff;*/
