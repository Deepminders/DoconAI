"use client";

import { useEffect, useState } from 'react';
import '../../../CSS/staff/staff.css';
// import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const Staff = () => {
  // const router = useRouter();
  const [staffList, setStaffList] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [roles, setRoles] = useState(["Site Engineer", "Qs Engineer", "Project Manager", "Technician"]);
  const genders = ["Male","Female","Other"];
  const [showAddModal, setShowAddModal] = useState(false);
  const [validated, setValidated] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [updateValidated, setUpdateValidated] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [image, setImage] = useState(null);
  const [selectedStaffProjects, setSelectedStaffProjects] = useState([]);


  const [updateData, setUpdateData] = useState({
    id: '',
    staff_fname: '',
    staff_lname: '',
    staff_email: '',
    staff_age: '',
    staff_gender: '',
    staff_role: '',
    assigned_projects: [],
    staff_image_url: ''
});
  
    const [formData, setFormData] = useState({
      assigned_projects: []
     });
  
    const clearForm = () => {
       setFormData({

      assigned_projects: [],
    
    });
   setValidated(false);
   };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/staff/delete/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete staff');
      }

      setStaffList(prevList => prevList.filter((staff) => staff.id !== id));

      toast.success('Staff deleted successfully');
      
    } catch (err) {
      console.error('Error deleting staff:', err);
      toast.error('Failed to delete staff. Please try again.');
    }
    setShowModal(false);
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

  const openAssignModal = (staffId) => {
    const staff = staffList.find(s => s.id === staffId);
    if (staff) {
      setSelectedStaffId(staffId);
      setSelectedProject(''); // or set initial project
      setSelectedStaffProjects(staff.assigned_projects || []);
      setShowAssignModal(true);
    }
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedStaffId(null);
    setSelectedProject('');
  };
  
  const openUpdateModal = async (id) => {
    try {

      const res = await fetch(`${BASE_URL}/staff/findStaff/${id}`);
      const fetched_data = await res.json();
      setUpdateData({
        id: id,
        staff_fname: fetched_data.Staff.staff_fname,
        staff_lname: fetched_data.Staff.staff_lname,
        staff_email: fetched_data.Staff.staff_email,
        staff_age: fetched_data.Staff.staff_age,
        staff_gender: fetched_data.Staff.staff_gender,
        staff_role: fetched_data.Staff.staff_role,
        assigned_projects: fetched_data.Staff.assigned_projects,
        staff_image_url: fetched_data.Staff.staff_image_url
      });
      setShowUpdateModal(true);
    } catch (err) { console.error(err) }
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
  
    try {
      // Convert image to Base64
      const base64Image = image ? await convertToBase64(image) : null;

      // Always include assigned_projects as array
      const payload = {
        staff_fname: formData.staff_fname,
        staff_lname: formData.staff_lname,
        staff_email: formData.staff_email,
        staff_role: formData.staff_role,
        staff_age: formData.staff_age,
        staff_gender: formData.staff_gender,
        staff_image_url: base64Image,
        assigned_projects: formData.assigned_projects || [], // Ensure array
      };
      
      const res = await fetch(`${BASE_URL}/staff/addStaff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const new_staff_id = data.staff_id;
      const new_staff_image_url = data.staff_image_url;
      const newStaff = {
        id: new_staff_id,
        staff_fname: formData.staff_fname,
        staff_lname: formData.staff_lname,
        staff_email: formData.staff_email,
        staff_role: formData.staff_role,
        staff_age: formData.staff_age,
        staff_gender: formData.staff_gender,
        assigned_projects: formData.assigned_projects,
        staff_image_url: new_staff_image_url,
      };
      setStaffList(prevList => [...prevList, newStaff]);
      if (!res.ok) throw new Error('Failed to add staff');
  
      toast.success("Staff added successfully!");
      setShowAddModal(false);
      setFormData({
          staff_fname: '',
          staff_lname: '',
          staff_email: '',
          staff_role: '',
          staff_age: '',
          staff_gender: '',
          assigned_projects: [],
          staff_image_url: '',  
      });
      setImage(null);
  
    } catch (err) {
      console.error('Error adding staff:', err);
      toast.error('Failed to add staff. Please try again.');
    }
  
    setValidated(true);
    setAgreed(false);
  };
  
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setUpdateValidated(true);
      return;
    }
  
    const { id, ...body } = updateData;
  
    try {
      // Convert image to Base64 if it's a new file
      if (updateData.staff_image_url instanceof File) {
        const base64Image = await convertToBase64(updateData.staff_image_url);
        body.staff_image_url = base64Image;
      }
  
      const res = await fetch(`${BASE_URL}/staff/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
  
      if (res.ok) {
        toast.success('Staff updated!');
        setStaffList(prev =>
          prev.map(s => s.id === id ? { id, ...body } : s)
        );
        setShowUpdateModal(false);
      } else {
        toast.error('Update failed');
      }
    } catch (err) {
      console.error("Error updating staff:", err);
      toast.error("Something went wrong while updating staff.");
    }
  };
  

useEffect(() => {
  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/staff/projects`);
      setProjects(res.data);
      console.log("Fetched projects:", res.data);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    }
  };
  fetchProjects();
}, []);



  const handleAssignProject = async (e) => {
  e.preventDefault();
  if (!selectedStaffId || !selectedProject) {
    toast.error("Please select a project before assigning.");
    return;
  }

  try {
    const res = await axios.put(`${BASE_URL}/staff/assignProject/${selectedStaffId}/${selectedProject}`);
    if (res.status === 200) {
      toast.success("Project assigned successfully!");

      setStaffList(prevList =>
        prevList.map(staff =>
          staff.id === selectedStaffId
            ? {
                ...staff,
                assigned_projects: [...(staff.assigned_projects || []), selectedProject],
              }
            : staff
        )
      );
      
      setSelectedStaffProjects(prev => [...prev, selectedProject]);
      closeAssignModal();
    } else {
      toast.error("Assignment failed. Try again.");
    }
  } catch (err) {
    console.error("Error assigning project:", err);
    toast.error("Server error while assigning project.");
  }
};


useEffect(() => {
  const filterStaff = () => {
    if (staffList && staffList.length > 0) {
      const filtered = staffList.filter(staff => {
        const matchesSearch = `${staff.staff_fname} ${staff.staff_lname}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRoles = selectedRoles.length === 0 || selectedRoles.includes(staff.staff_role);
        return matchesSearch && matchesRoles;
      });
      setFilteredStaff(filtered);
    } else {
      setFilteredStaff([]);
    }
  };

  filterStaff();
}, [staffList, searchQuery, selectedRoles]);

const [filteredStaff, setFilteredStaff] = useState([]);


  return (
    <div className='staff-container'>
      <div className='staff-header'>
        <h2 className='staff-title'>Staff Management</h2>
      </div>

      <div className='staff-filters'>
          <input
            className='staff-search'
            type="text"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}/>
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
      <tr key={staff.id} className='staff-row'>
        <td>
          <div className="staff-info">
            <img
              src={`${BASE_URL}${staff.staff_image_url}` || '/images/default-avatar.png'}
              alt={`${staff.staff_fname}`}
              className="staff-avatar"
            />
            <span className="staff-name">{`${staff.staff_fname} ${staff.staff_lname}`}</span>
          </div>
        </td>
        <td><a href={`mailto:${staff.staff_email}`}>{staff.staff_email}</a></td>
        <td>{staff.staff_role}</td>
        <td>{staff.staff_age}</td>
        <td>
          <button className="update-button" onClick={() => openUpdateModal(staff.id)}>Update</button>
          <button className="delete-button" onClick={() => openDeleteModal(staff.id)}>Delete</button>
          <button className="assign-button" onClick={() => openAssignModal(staff.id)}>Assign Project</button>
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
      </div>
        
      
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className='delete-staff-title'>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this staff member?</Modal.Body>
        <Modal.Footer>
          <Button variant="danger"  onClick={() => handleDelete(deleteId)}>
            Delete
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

    
     <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
  <Modal.Header closeButton>
    
    <Modal.Title className="add-staff-title">Add Staff</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
    <Form.Group as={Col} md="12" controlId="validationImage" className="mt-3">
  <Form.Label>Upload Image</Form.Label>
  <Form.Control
    required
    type="file"
    accept="image/*"
    onChange={handleImageChange}
  />
  <Form.Control.Feedback type="invalid">
    Please upload an image.
  </Form.Control.Feedback>
</Form.Group>
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
            <option value="Qs Engineer">Qs Engineer</option>
            <option value="Project Manager">Project Manager</option>
            <option value="Site Engineer">Site Engineer</option>
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
          <Form.Control.Feedback type="invalid">Please enter a valid age (18–100).</Form.Control.Feedback>
        </Form.Group>
      </Row>

      <Form.Group className="my-3">
        <Form.Check
          required
          label="Agree to terms and conditions"
          feedback="You must agree before submitting."
          feedbackType="invalid"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
      </Form.Group>

      <div className="d-flex justify-content-end gap-3">
        <Button type="submit" variant="primary" className="submit-button">Submit</Button>
        <Button variant="secondary" className="clearbutton" onClick={clearForm}>Clear</Button>
      </div>
    </Form>
  </Modal.Body>
</Modal> 


    <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)} centered>
      <Form noValidate validated={updateValidated} onSubmit={handleUpdateSubmit}>
      <Modal.Header closeButton>
        <Modal.Title className='update-staff-title'>Update Staff</Modal.Title>
      </Modal.Header>

      <Modal.Body>
      <Row className="mb-3">
      <Col md={12}>
     <Form.Group controlId="updImage">
    <Form.Label className='staff-image-title' >Staff Image</Form.Label>

  {/* Show existing or newly uploaded image */}
  {(updateData.staff_image_url && (
    <div style={{ marginBottom: '10px' }}>
      {console.log("staff_image_url:", updateData.staff_image_url)}
      <img className='staff-image'
        src={
          typeof updateData.staff_image_url === "string"
            ? `${BASE_URL}/uploaded_images${updateData.staff_image_url}` 
            : URL.createObjectURL(updateData.staff_image_url)
        }
        
        alt="Profile"
      />
      <br />
      <Button
        variant="danger"
        size="sm"
        className="remove-image-button"
        onClick={() => setUpdateData({ ...updateData, staff_image_url: null })}
      >
        Remove Image
      </Button>
    </div>
  ))}

  <Form.Control
    type="file"
    accept="image/*"
    onChange={(e) =>
      setUpdateData({ ...updateData, staff_image_url: e.target.files[0] })
    }
  />
</Form.Group>

        </Col>
        </Row>
        <Row className="mb-3">
          <Col md={6}>
          <Form.Group controlId="updFirstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              required
              type="text"
              name="staff_fname"
              value={updateData.staff_fname}
              onChange={e => setUpdateData({ ...updateData, staff_fname: e.target.value })}/>
            <Form.Control.Feedback type="invalid">Required.</Form.Control.Feedback>
          </Form.Group>
          </Col>
          <Col md={6}>
          <Form.Group controlId="updLastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              required
              type="text"
              name="staff_lname"
              value={updateData.staff_lname}
              onChange={e => setUpdateData({ ...updateData, staff_lname: e.target.value })}/>
            <Form.Control.Feedback type="invalid">Required.</Form.Control.Feedback>
          </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
        <Col md={6}>
          <Form.Group controlId="updEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              required
              type="email"
              name="staff_email"
              value={updateData.staff_email}
              onChange={e => setUpdateData({ ...updateData, staff_email: e.target.value })}/>
            <Form.Control.Feedback type="invalid">Valid email required.</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="updRole">
            <Form.Label>Role</Form.Label>
            <Form.Select
              required
              name="staff_role"
              value={updateData.staff_role}
              onChange={e => setUpdateData({ ...updateData, staff_role: e.target.value })}>
              <option value="">Select Role</option>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </Form.Select>
            <Form.Control.Feedback type="invalid">Select a role.</Form.Control.Feedback>
          </Form.Group>
        </Col>
        </Row>
        <Row className="mb-3">
        <Col md={6}>
        <Form.Group controlId="updGender">
          <Form.Label>Gender</Form.Label>
          <Form.Select
            required
            name="staff_gender"
            value={updateData.staff_gender}
            onChange={e => setUpdateData({ ...updateData, staff_gender: e.target.value })}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">Select a gender.</Form.Control.Feedback>
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group controlId="updAge">
          <Form.Label>Age</Form.Label>
          <Form.Control
            required
            type="number"
            min="18"
            max="100"
            name="staff_age"
            value={updateData.staff_age}
            onChange={e => setUpdateData({ ...updateData, staff_age: e.target.value })}
          />
          <Form.Control.Feedback type="invalid">Valid age required (18-100).</Form.Control.Feedback>
        </Form.Group>
      </Col>
    </Row>
  </Modal.Body>

  <Modal.Footer>
      <Button type="submit" className='Update-button'>Update</Button>
      <Button className='cancelbutton' onClick={() => setShowUpdateModal(false)}>Cancel</Button>
  </Modal.Footer>
</Form>
</Modal>

<Modal show={showAssignModal} onHide={closeAssignModal} centered>
  <Modal.Header closeButton>
    <Modal.Title className="assign-project-title fw-bold text-primary">
      Assign Project
    </Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <div className="mb-4">
      <p className="fw-semibold mb-1">Assigned Projects:</p>
      {selectedStaffProjects.length > 0 ? (
        <ul className="ps-0 mb-2">
          {selectedStaffProjects.map((projectId, index) => {
            const foundProject = projects.find(
              (p) => String(p.projectid) === String(projectId)
            );
            return (
              <li key={index}>
                {foundProject ? foundProject.projectName : ''}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-muted ps-0">No projects assigned yet.</p>
      )}
    </div>
    <Form onSubmit={handleAssignProject}>
      <Form.Group controlId="projectSelect" className="mb-3">
        <Form.Label className="fw-semibold">Select a Project</Form.Label>
        <Form.Select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          required
        >
  <option value="">-- Select Project --</option>
  {projects.map((project) => (
    <option key={project.projectid} value={project.projectid}>
      {project.projectName}
    </option>
  ))}

        </Form.Select>
      </Form.Group>
      <div className="d-flex justify-content-end gap-2 mt-3">
        <Button variant="primary" type="submit">
          Assign
        </Button>
        <Button variant="secondary" onClick={closeAssignModal}>
          Cancel
        </Button>
      </div>
    </Form>
  </Modal.Body>
</Modal>


<ToastContainer position="top-right" autoClose={1500} />
</div>)};

export default Staff;
