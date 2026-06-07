import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageStaff() {
 
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState(''); 
  
  const [staffList, setStaffList] = useState([]);
 
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(null);

 
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  const API_URL = 'http://localhost:8080/api/admin';

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await axios.get(`${API_URL}/staff-members`);
      setStaffList(response.data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || (!password && !isEditMode) || !phoneNumber || !role) {
      setMessage({ text: 'Please fill all required fields! ⚠️', type: 'error' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ text: 'Please enter a valid email address! 📧', type: 'error' });
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setMessage({ text: 'Phone number must be exactly 10 digits! 📱', type: 'error' });
      return;
    }

    const staffData = {
      name,
      email,
      password: password || null,
      phoneNumber,
      role
    };

    try {
      if (isEditMode) {
        await axios.put(`${API_URL}/staff/${selectedStaffId}`, staffData);
        setMessage({ text: 'Staff profile updated successfully! 🔄', type: 'success' });
      } else {
        await axios.post(`${API_URL}/staff`, staffData);
        setMessage({ text: 'Staff member registered successfully! ✅', type: 'success' });
      }
      
      resetForm();
      fetchStaff();
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || 'Something went wrong. Please try again!', 
        type: 'error' 
      });
    }
  };

  const handleEditClick = (staff) => {
    setIsEditMode(true);
    setSelectedStaffId(staff.id);
    setName(staff.name || '');
    setEmail(staff.email || '');
    setPhoneNumber(staff.phoneNumber || '');
    setRole(staff.role || '');
    setPassword(''); 
    setShowPassword(false);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  const handleRemoveStaff = async (id) => {
    if (window.confirm("Are you sure you want to remove this staff member?")) {
      try {
        await axios.delete(`${API_URL}/staff/${id}`);
        setMessage({ text: 'Staff member removed successfully! 🗑️', type: 'success' });
        if (selectedStaffId === id) resetForm();
        fetchStaff();
      } catch (error) {
        setMessage({ text: 'Failed to remove staff member.', type: 'error' });
      }
    }
  };

  const resetForm = () => {
    setIsEditMode(false);
    setSelectedStaffId(null);
    setName('');
    setEmail('');
    setPassword('');
    setPhoneNumber('');
    setRole('');
    setShowPassword(false);
    setCurrentPage(1);
  };

  
  const filteredStaff = staffList.filter((staff) => {
    const staffName = staff.name?.toLowerCase() || '';
    const staffEmail = staff.email?.toLowerCase() || '';
    const staffRole = staff.role?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();

    return staffName.includes(query) || staffEmail.includes(query) || staffRole.includes(query);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStaff.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Staff Management</h2>
        <p className="text-sm text-gray-500 mt-1">Register, validate, search, paginate and update hospital staff profiles.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-medium border transition-all max-w-7xl ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-700">
              {isEditMode ? 'Edit Staff Profile' : 'Register New Staff'}
            </h3>
            {isEditMode && (
              <button onClick={resetForm} className="text-xs text-red-500 hover:underline cursor-pointer">
                Cancel Edit
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
              <input
                type="text"
                placeholder="johndoe@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {isEditMode ? '(Leave blank to keep current)' : '*'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number * (10 Digits)</label>
              <input
                type="text"
                placeholder="0771234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff Role *</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm bg-white"
              >
                <option value="">Select Role</option>
                <option value="RECEPTIONIST">Receptionist</option>
                <option value="LAB_ASSISTANT">Lab Assistant</option>
              </select>
            </div>

            <button
              type="submit"
              className={`w-full py-2.5 text-white font-semibold rounded-xl shadow-md transition text-sm cursor-pointer ${
                isEditMode ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/10' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/10'
              }`}
            >
              {isEditMode ? 'Update Staff Profile' : 'Register Staff'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit flex flex-col">
          <div className="p-6 border-b border-gray-50">
            <h3 className="text-lg font-semibold text-slate-700">Hospital Staff Members</h3>
          </div>

          <div className="p-4 bg-slate-50/50 border-b border-gray-100">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.603 10.601Z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by name, email, or role..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-xs bg-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <th className="px-6 py-3 border-b border-gray-100">Staff Info</th>
                  <th className="px-6 py-3 border-b border-gray-100">Role</th>
                  <th className="px-6 py-3 border-b border-gray-100 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-gray-400 italic">
                      No matching staff members found.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{staff.name}</div>
                        <div className="text-xs text-gray-400">{staff.email}</div>
                        <div className="text-xs text-gray-400">📱 {staff.phoneNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          staff.role === 'RECEPTIONIST' ? 'bg-purple-50 text-purple-600' : 'bg-teal-50 text-teal-600'
                        }`}>
                          {staff.role === 'RECEPTIONIST' ? 'Receptionist' : 'Lab Assistant'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEditClick(staff)}
                            className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 font-medium text-xs transition cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleRemoveStaff(staff.id)}
                            className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-xs transition cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredStaff.length > itemsPerPage && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-slate-50/50 mt-auto">
              <span className="text-xs text-gray-500 font-medium">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredStaff.length)} of {filteredStaff.length} Staff
              </span>
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    type="button"
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      currentPage === index + 1
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}