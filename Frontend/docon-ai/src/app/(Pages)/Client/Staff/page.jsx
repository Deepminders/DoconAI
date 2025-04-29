"use client";

import { useEffect, useState } from 'react';
import '../../../CSS/staff/staff.css';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const BASE_URL = 'http://localhost:8000';

const Staff = () => {
  const router = useRouter();
  const [staffList, setStaffList] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [roles, setRoles] = useState(["dev", "site engineer", "qs", "manager", "accountant", "hr"]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [validated, setValidated] = useState(false)
  
  const [formData, setFormData] = useState({
    staff_fname: '',
    staff_lname: '',
    staff_email: '',
    staff_age: '',
    staff_gender: '',
    staff_role: ''
  });
  

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/staff/delete/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete staff');
      }

      setStaffList(prevList => prevList.filter((staff) => staff.staff_id !== id));
      toast.success('Staff deleted successfully');
    } catch (err) {
      console.error('Error deleting staff:', err);
      toast.error('Failed to delete staff. Please try again.');
    }
    setShowModal(false);
  };

  const handleUpdate = (id) => {
    router.push(`/Client/Staff/Updatestaff/${id}`);
  };

  const toggleRoleSelection = (role) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const openAddModal = () => {
    setShowAddModal(true);
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/staff/addStaff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to add staff');

      toast.success("Staff added successfully!");
      setTimeout(() => {
        setShowModal(false);
        setFormData({
          staff_fname: '',
          staff_lname: '',
          staff_email: '',
          staff_role: '',
          staff_age: '',
          staff_gender: '',
        });
      }, 1500);
    } catch (err) {
      console.error('Error adding staff:', err);
      toast.error('Failed to add staff. Please try again.');
    }
    setValidated(true);
  };

  useEffect(() => {
    const getAllStaff = async () => {
      try {
        const res = await fetch(`${BASE_URL}/staff/getStaff`);
        if (!res.ok) {
          throw new Error('Failed to fetch staff data');
        }
        const data = await res.json();
        setStaffList(data);
      } catch (error) {
        console.error('Error fetching staff data:', error);
        setError('Failed to fetch staff data');
      }
    };

    getAllStaff();
  }, []);

  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = `${staff.staff_fname} ${staff.staff_lname}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRoles = selectedRoles.length === 0 || selectedRoles.includes(staff.staff_role);
    return matchesSearch && matchesRoles;
  });

  return (
    <div className='staff-container'>
      <div className='staff-header'>
        <h2 className='staff-title'>Staff Management</h2>
        <button className="add-staff-button" onClick={openAddModal}>+ Add Staff</button>
      </div>

      <div className='staff-content'>
        <div className='staff-table-container'>
          <table className='staff-table'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Age</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length > 0 ? (
                filteredStaff.map(staff => (
                  <tr key={staff.staff_id} className='staff-row'>
                    <td><span className="staff-name">{`${staff.staff_fname} ${staff.staff_lname}`}</span></td>
                    <td><a href={`mailto:${staff.staff_email}`}>{staff.staff_email}</a></td>
                    <td>{staff.staff_role}</td>
                    <td>{staff.staff_age}</td>
                    <td>
                      <button className="update-button" onClick={() => handleUpdate(staff.staff_id)}>Update</button>
                      <button className="delete-button" onClick={() => openDeleteModal(staff.staff_id)}>Delete</button>
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

        <div className='staff-filters'>
          <input
            className='staff-search'
            type="text"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className='checkbox-group'>
            {roles.map(role => (
              <label key={role} className='checkbox-label'>
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role)}
                  onChange={() => toggleRoleSelection(role)}
                />
                {role}
              </label>
            ))}
          </div>
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this staff member?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => handleDelete(deleteId)}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
      <Modal.Header closeButton>
          <Modal.Title>Add Staff</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="validationFirstName">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Enter first name"
                  name="staff_fname"
                  value={formData.staff_fname}
                  onChange={handleFormChange}
                />
                <Form.Control.Feedback type="invalid">Please enter first name.</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" controlId="validationLastName">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Enter last name"
                  name="staff_lname"
                  value={formData.staff_lname}
                  onChange={handleFormChange}
                />
                <Form.Control.Feedback type="invalid">Please enter last name.</Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="6" controlId="validationEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  required
                  type="email"
                  placeholder="Enter email"
                  name="staff_email"
                  value={formData.staff_email}
                  onChange={handleFormChange}
                />
                <Form.Control.Feedback type="invalid">Please enter a valid email.</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" controlId="validationRole">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  required
                  name="staff_role"
                  value={formData.staff_role}
                  onChange={handleFormChange}
                >
                  <option value="">Select Role</option>
                  <option value="Engineer">Engineer</option>
                  <option value="Manager">Manager</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Technician">Technician</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">Please select a role.</Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row>
              <Form.Group as={Col} md="6" controlId="validationGender">
                <Form.Label>Gender</Form.Label>
                <Form.Select
                  required
                  name="staff_gender"
                  value={formData.staff_gender}
                  onChange={handleFormChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">Please select gender.</Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Col} md="6" controlId="validationAge">
                <Form.Label>Age</Form.Label>
                <Form.Control
                  required
                  type="number"
                  min="18"
                  max="100"
                  placeholder="Enter age"
                  name="staff_age"
                  value={formData.staff_age}
                  onChange={handleFormChange}
                />
                <Form.Control.Feedback type="invalid">Please enter a valid age (18-100).</Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                required
                label="Agree to terms and conditions"
                feedback="You must agree before submitting."
                feedbackType="invalid"
              />
            </Form.Group>

            <Button type="submit" variant="primary">Submit</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <ToastContainer position="top-right" autoClose={1500} />
    </div>
  );
};
export default Staff;
