"use client";

import { useEffect, useState } from 'react';
import '../../../CSS/Staff/style.css';
import { useRouter } from 'next/navigation';

const BASE_URL = 'http://localhost:8000';

const Staff = () => {
  const router = useRouter();
  const [staffList, setStaffList] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Function to handle delete
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this staff member?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${BASE_URL}/staff/delete/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete staff');
      }

      setStaffList(prevList => prevList.filter((staff) => staff.staff_id !== id));
    } catch (err) {
      console.error('Error deleting staff:', err);
      alert('Failed to delete staff. Please try again.');
    }
  };

  // Function to handle update (navigate to update page)
  const handleUpdate = (id) => {
    router.push(`/Client/Staff/Updatestaff/${id}`);
  };


  useEffect(() => {
  
    const getAllStaff = async () => {
      try {
        const res = await fetch(`${BASE_URL}/staff/getStaff`);
        if (!res.ok) {
          throw new Error('Failed to fetch staff data');
        }
        const data = await res.json();
        console.log('API Response:', data); // Debugging
        setStaffList(data);
      } catch (error) {
        console.error('Error fetching staff data:', error);
        throw error;
      }
    };
  
    getAllStaff();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className='staff-list'>
      <h2>Staff List</h2>
      <div className='search-bar'>
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="Add-staff" onClick={() => router.push('/Client/Staff/Addstaff')}>+ Add Staff</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email address</th>
            <th>Role</th>
            <th>Age</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(staffList) && staffList.length > 0 ? (
            staffList.map(staff => (
              <tr key={staff.staff_id}>
                <td>
                  <div className="avatar"></div>
                  <span className="name">{`${staff.staff_fname} ${staff.staff_lname}`}</span>
                </td>
                <td className="email"><a href={`mailto:${staff.staff_email}`}>{staff.staff_email}</a></td>
                <td className="role">{staff.staff_role}</td>
                <td className="age">{staff.staff_age}</td>
                <td className="actions">
                  <button
                    className="update-button"
                    onClick={() => handleUpdate(staff.staff_id)}
                  >
                    Update
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(staff.staff_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>No staff members found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Staff;