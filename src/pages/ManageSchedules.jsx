import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageSchedules() {
  const [doctorId, setDoctorId] = useState('');
  const [availableDate, setAvailableDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [schedules, setSchedules] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [message, setMessage] = useState({ text: '', type: '' });

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const ADMIN_API_URL = 'http://localhost:8080/api/admin';
  const SCHEDULE_API_URL = 'http://localhost:8080/api/schedules';

  useEffect(() => {
    fetchDoctors();
    fetchSchedules();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${ADMIN_API_URL}/doctors`);
      setDoctors(response.data);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(SCHEDULE_API_URL);
      setSchedules(response.data);
    } catch (error) {
      console.error("Failed to fetch schedules:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!doctorId || !availableDate || !startTime || !endTime) {
      setMessage({ text: 'Please fill all fields!', type: 'error' });
      return;
    }

    if (startTime >= endTime) {
      setMessage({ text: 'Start time must be before end time! ⏱️', type: 'error' });
      return;
    }

    const scheduleData = {
      doctorId: parseInt(doctorId),
      availableDate, 
      startTime: startTime + ":00",
      endTime: endTime + ":00"
    };

    try {
      await axios.post(SCHEDULE_API_URL, scheduleData);
      setMessage({ text: 'Schedule created successfully!', type: 'success' });
      
      resetForm();
      fetchSchedules(); 
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || 'Failed to create schedule. Please try again!', 
        type: 'error' 
      });
    }
  };

  const handleRemoveSchedule = async (id) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      try {
        await axios.delete(`${SCHEDULE_API_URL}/${id}`);
        setMessage({ text: 'Schedule removed successfully!', type: 'success' });
        fetchSchedules();
      } catch (error) {
        setMessage({ text: 'Failed to remove schedule.', type: 'error' });
      }
    }
  };

  const resetForm = () => {
    setDoctorId('');
    setAvailableDate('');
    setStartTime('');
    setEndTime('');
    setCurrentPage(1);
  };
  
  const filteredSchedules = schedules.filter((sch) => {
    const docName = sch.doctor?.user?.name?.toLowerCase() || '';
    const docEmail = sch.doctor?.user?.email?.toLowerCase() || '';
    const dateStr = sch.availableDate || '';
    const query = searchQuery.toLowerCase();

    return docName.includes(query) || docEmail.includes(query) || dateStr.includes(query);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSchedules.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStaff => filteredSchedules.length / itemsPerPage);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Schedules Management</h2>
        <p className="text-sm text-gray-500 mt-1">Create and manage availability sessions for registered doctors.</p>
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
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Add Doctor Session</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor *</label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm bg-white"
              >
                <option value="">Choose Doctor</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.user?.name} ({doc.specialization?.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available Date *</label>
              <input
                type="date"
                value={availableDate}
                min={new Date().toISOString().split('T')[0]} 
                onChange={(e) => setAvailableDate(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/10 transition text-sm cursor-pointer"
            >
              Save Session Schedule
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit flex flex-col">
          <div className="p-6 border-b border-gray-50">
            <h3 className="text-lg font-semibold text-slate-700">Active Sessions List</h3>
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
                placeholder="Search by doctor name or date (YYYY-MM-DD)..."
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
                  <th className="px-6 py-3 border-b border-gray-100">Doctor Info</th>
                  <th className="px-6 py-3 border-b border-gray-100">Available Session</th>
                  <th className="px-6 py-3 border-b border-gray-100 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-gray-400 italic">
                      No active schedules found.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((sch) => (
                    <tr key={sch.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{sch.doctor?.user?.name}</div>
                        <div className="text-xs text-gray-400">{sch.doctor?.specialization?.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">📅 {sch.availableDate}</div>
                        <div className="text-xs text-blue-600 font-semibold mt-0.5">
                          ⏱️ {sch.startTime?.substring(0, 5)} - {sch.endTime?.substring(0, 5)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleRemoveSchedule(sch.id)}
                          className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-xs transition cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredSchedules.length > itemsPerPage && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-slate-50/50 mt-auto">
              <span className="text-xs text-gray-500 font-medium">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredSchedules.length)} of {filteredSchedules.length} Sessions
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