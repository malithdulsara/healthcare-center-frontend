import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const APPOINTMENT_API_URL = 'http://localhost:8080/api/appointments';

  useEffect(() => {
    fetchAllAppointments();
  }, []);

  const fetchAllAppointments = async () => {
    try {
      const response = await axios.get(APPOINTMENT_API_URL);
      setAppointments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch all appointments:", error);
      setAppointments([]);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const confirmMsg = `Are you sure you want to change this appointment status to ${newStatus}?`;
    if (window.confirm(confirmMsg)) {
      try {
        await axios.put(`${APPOINTMENT_API_URL}/${id}/status`, null, {
          params: { status: newStatus }
        });

        setMessage({ 
          text: `Appointment #APT-${id.toString().padStart(4, '0')} has been ${newStatus.toLowerCase()}ed successfully! 🚀`, 
          type: 'success' 
        });

        fetchAllAppointments();
      } catch (error) {
        setMessage({ text: 'Failed to update appointment status.', type: 'error' });
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CONFIRMED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'CANCELLED':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    if (!app) return false;
    const docName = app.schedule?.doctor?.user?.name?.toLowerCase() || '';
    const specName = app.schedule?.doctor?.specialization?.name?.toLowerCase() || '';
    const patientIdStr = app.patientId?.toString() || '';
    const query = searchQuery.toLowerCase();

    return docName.includes(query) || specName.includes(query) || patientIdStr.includes(query);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage) || 1;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Receptionist Desk: Manage Appointments</h2>
        <p className="text-sm text-gray-500 mt-1">Review, approve, or cancel incoming patient medical channelling requests.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-semibold border transition-all ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-fit">
        <div className="p-6 border-b border-gray-50">
          <h3 className="text-lg font-semibold text-slate-700">All Live Bookings</h3>
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
              placeholder="Search by doctor name, specialization, or Patient ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-xs bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <th className="px-6 py-3.5 border-b border-gray-100">Ticket ID</th>
                <th className="px-6 py-3.5 border-b border-gray-100">Patient Details</th>
                <th className="px-6 py-3.5 border-b border-gray-100">Doctor Info</th>
                <th className="px-6 py-3.5 border-b border-gray-100">Date & Session Time</th>
                <th className="px-6 py-3.5 border-b border-gray-100 text-center">Status</th>
                <th className="px-6 py-3.5 border-b border-gray-100 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400 italic">
                    No active appointments found in the system.
                  </td>
                </tr>
              ) : (
                currentItems.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-bold text-slate-400">
                      #APT-{app.id.toString().padStart(4, '0')}
                    </td>
                    
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      👤 Patient ID: {app.patientId || '1'}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{app.schedule?.doctor?.user?.name}</div>
                      <div className="text-xs text-blue-600 font-medium mt-0.5">
                        {app.schedule?.doctor?.specialization?.name}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-700">📅 {app.schedule?.availableDate}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        ⏱️ {app.schedule?.startTime?.substring(0, 5)} - {app.schedule?.endTime?.substring(0, 5)}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">📍 Room: {app.schedule?.roomNumber || 'Main Room'}</div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(app.status)}`}>
                        {app.status || 'PENDING'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-center">
                      {app.status === 'PENDING' || !app.status ? (
                        <div className="flex justify-center space-x-1.5">
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')}
                            className="px-2.5 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-xs transition shadow-sm cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'CANCELLED')}
                            className="px-2.5 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium text-xs transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic font-medium">Session Handled</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredAppointments.length > itemsPerPage && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-slate-50/50 mt-auto">
            <span className="text-xs text-gray-500 font-medium">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredAppointments.length)} of {filteredAppointments.length} Bookings
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
                    currentPage === index + 1 ? 'bg-blue-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
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
  );
}