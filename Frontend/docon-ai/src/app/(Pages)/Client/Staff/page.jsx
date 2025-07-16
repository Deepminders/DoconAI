"use client";

import { useEffect, useState } from 'react';
import '../../../CSS/staff/staff.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const Staff = () => {
  const [staffList, setStaffList] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [roles] = useState(["Site Engineer", "Qs Engineer", "Project Manager", "Technician"]);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedStaffProjects, setSelectedStaffProjects] = useState([]);

  const toggleRoleSelection = (role) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const openDeleteModal = (id) => {
    setDeleteId(id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}/staff/delete/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete staff');

      setStaffList(prevList => prevList.filter((staff) => staff.id !== id));
      toast.success('Staff deleted successfully');
    } catch (err) {
      console.error('Error deleting staff:', err);
      toast.error('Failed to delete staff. Please try again.');
    }
    setShowModal(false);
  };

  const openAssignModal = (staffId) => {
    const staff = staffList.find(s => s.id === staffId);
    if (staff) {
      setSelectedStaffId(staffId);
      setSelectedProject('');
      setSelectedStaffProjects(staff.assigned_projects || []);
      setShowAssignModal(true);
    }
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedStaffId(null);
    setSelectedProject('');
  };

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
    const getAllStaff = async () => {
      try {
        const res = await fetch(`${BASE_URL}/staff/getStaff`);
        if (!res.ok) throw new Error('Failed to fetch staff data');
        const data = await res.json();
        setStaffList(data);
      } catch (error) {
        console.error('Error fetching staff data:', error);
      }
    };
    getAllStaff();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/staff/projects`);
        setProjects(res.data);
      } catch (error) {
        console.error("Failed to fetch projects", error);
      }
    };
    fetchProjects();
  }, []);

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
          <Button variant="danger" onClick={() => handleDelete(deleteId)}>Delete</Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
        </Modal.Footer>
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
    </div>
  );
};

export default Staff;
