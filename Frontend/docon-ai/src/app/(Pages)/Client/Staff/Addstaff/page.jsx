"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../../../CSS/staff/addstaff.css';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import 'bootstrap/dist/css/bootstrap.min.css';

const BASE_URL = 'http://localhost:8000';

const AddStaff = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    staff_fname: '',
    staff_lname: '',
    staff_email: '',
    staff_age: '',
    staff_gender: '',
    staff_role: ''
  });
  const [validated, setValidated] = useState(false);

  const clearForm = () => {
    setFormData({
      staff_fname: '',
      staff_lname: '',
      staff_email: '',
      staff_role: '',
      staff_age: '',
      staff_gender: ''
    });
    setValidated(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
    }

    setValidated(true);

    if (form.checkValidity()) {
      try {
        const res = await fetch(`${BASE_URL}/staff/addStaff`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (!res.ok) throw new Error('Failed to add staff');

        toast.success("Staff added successfully!");
        setTimeout(() => router.push(`/Client/Staff`), 1500);
      } catch (err) {
        console.error('Error adding staff:', err);
        toast.error('Failed to add staff. Please try again.');
      }
    }
  };

  return (
    <div className="add-staff-container bg-dark text-white p-5 rounded">
      <ToastContainer position="top-right" />
      <h2 className="add-staff-title mb-4">Add Staff</h2>

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
              onChange={handleChange}
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
              onChange={handleChange}
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
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">Please enter a valid email.</Form.Control.Feedback>
          </Form.Group>

          <Form.Group as={Col} md="6" controlId="validationRole">
            <Form.Label>Role</Form.Label>
            <Form.Select
              required
              name="staff_role"
              value={formData.staff_role}
              onChange={handleChange}
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

        <Row className="mb-3">
          <Form.Group as={Col} md="6" controlId="validationGender">
            <Form.Label>Gender</Form.Label>
            <Form.Select
              required
              name="staff_gender"
              value={formData.staff_gender}
              onChange={handleChange}
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
              min="0"
              max="100"
              placeholder="Enter age"
              name="staff_age"
              value={formData.staff_age}
              onChange={handleChange}
            />
            <Form.Control.Feedback type="invalid">Please enter a valid age (0-100).</Form.Control.Feedback>
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
    </div>
  );
};

export default AddStaff;
