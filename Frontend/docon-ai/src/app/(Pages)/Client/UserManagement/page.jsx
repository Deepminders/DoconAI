'use client';
import { useState, useEffect } from 'react';
import { useNotifications } from '../../../Components/Common/NotificationSystem';
import DocumentSidebar from '../../../Components/DocumentComponents/DocumentSidebar';

export default function UserManagementPage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Site Engineer');
  const [users, setUsers] = useState([]);
  const [tempUserInfo, setTempUserInfo] = useState(null);
  const notify = useNotifications();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Helper: get token from localStorage or wherever you keep it
  const getToken = () => localStorage.getItem('token');

  const fetchUsers = async () => {
    try {
      const token = getToken();
      const res = await fetch('http://localhost:8000/user/list-users', {
        headers: {

          'Authorization': `Bearer ${token}`,
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error("Invalid data format:", data);
        setUsers([]);
      }
    } catch (e) {
      notify.error('Failed to load users');
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!email) {
      notify.warning('Enter an email');
      return;
    }
    try {
      const token = getToken();
      const res = await fetch('http://localhost:8000/user/add-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // send token so backend knows who added the staff
        },
        body: JSON.stringify({ email, user_role: role }),
      });
      const result = await res.json();
      if (res.ok) {
        notify.success(`Staff added. Temp password: ${result.temporary_password}`, { duration: 8000 });
        setEmail('');
        setTempUserInfo({ email: result.email, tempPassword: result.temporary_password });
        fetchUsers();
        setTimeout(() => setTempUserInfo(null), 10000);
      } else {
        notify.error(result.detail || 'Add failed');
      }
    } catch {
      notify.error('Network error');
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-black">
      <DocumentSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
      />

      <main className="flex-1 p-6">
        <h1 className="text-3xl mb-6 text-gray-900">User Management</h1>

        <div className="border border-gray-300 bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto mb-8">
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Staff Email</label>
              <input
                type="email"
                placeholder="Enter staff email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-2 rounded border border-gray-300 text-black placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">User Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 rounded border border-gray-300 text-black"
              >
                <option value="Site Engineer">Site Engineer</option>
                <option value="Quantity Surveyor">Quantity Surveyor</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Subcontractor">Subcontractor</option>
                <option value="Project Manager">Project Manager</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-[#16941a] text-white py-2 px-4 rounded hover:bg-[#0d4c6b] transition"
            >
              Add Staff Member
            </button>
          </form>

          {tempUserInfo && (
            <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded relative mt-4 transition space-y-1">
              <p className="font-semibold">Temporary Account Created</p>
              <p>Email: <span className="font-mono">{tempUserInfo.email}</span></p>
              <div className="flex items-center gap-2">
                <p>Temp Password: <span className="font-mono">{tempUserInfo.tempPassword}</span></p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(tempUserInfo.tempPassword);
                    notify.success('Password copied to clipboard');
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-sm px-2 py-1 rounded"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1">* This info will disappear in 10 seconds.</p>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full text-left border border-gray-300 bg-white rounded-md overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Email</th>
                <th className="py-2 px-4">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? users.map((u) => (
                <tr key={u.id || u._id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="py-2 px-4">{u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim()}</td>
                  <td className="py-2 px-4">{u.email}</td>
                  <td className="py-2 px-4">{u.role || u.user_role}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
