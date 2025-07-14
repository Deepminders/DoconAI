"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

export default function StaffModalWithTrigger() {
  const [showModal, setShowModal] = useState(false);
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    const fetchStaff = async () => {
      const res = await axios.get("http://localhost:8000/staff/getstaff");
      setStaffList(res.data.Staff); 
    };
    fetchStaff();
  }, []);

  const handleAdd = (staff) => {
    console.log("Add clicked for:", staff);
    try {
    const staffId = staff.id || staff._id; 
    const response =  axios.put(
      `http://localhost:8000/staff/assignProject/${staffId}/${projectid}`
    );
  } catch (error) {
    console.error("Error assigning project:", error);}

  return (
    <div className="p-4">
      <button
        onClick={() => setShowModal(true)}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Open Staff Modal
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Select Staff Member</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {staffList && staffList.length > 0 ? (
                staffList.map((staff) => (
                  <div
                    key={staff.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <span className="font-medium">
                      {staff.first_name} {staff.last_name}
                    </span>
                    <button
                      onClick={() => handleAdd(staff)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Add
                    </button>
                  </div>
                ))
              ) : (
                <p>No staff members found.</p>
              )}
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
  };
