import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function ManageSpecializations() {
  const [name, setName] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });

  const API_URL = 'http://localhost:8080/api/admin';

  useEffect(() => {
    fetchSpecializations();
  }, []);

  const fetchSpecializations = async () => {
    try {
      const response = await axios.get(`${API_URL}/specializations`);
      setSpecializations(response.data);
    } catch (error) {
      console.error("Failed to fetch specializations:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage({ text: 'Please enter a name!', type: 'error' });
      return;
    }

    try {
      await axios.post(`${API_URL}/specialization`, { name });
      setMessage({ text: 'Specialization added successfully! ✅', type: 'success' });
      setName('');
      fetchSpecializations();
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.message || 'Failed to add specialization.', 
        type: 'error' 
      });
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Specialization Management</h2>
        <p className="text-sm text-gray-500 mt-1">Add and manage specializations in the system.</p>
      </div>

      {/* Alerts */}
      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-medium border transition-all max-w-4xl ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl">
        
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">Add New Specialization</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization Name *</label>
              <input
                type="text"
                placeholder="e.g., Cardiologist, Dentist"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/10 transition text-sm cursor-pointer"
            >
              Save Specialization
            </button>
          </form>
        </div>
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="p-5 border-b border-gray-50 text-center">
            <h3 className="text-lg font-semibold text-slate-700">List of Available Specializations</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <th className="px-6 py-3 border-b border-gray-100 text-center w-24">ID</th>
                  <th className="px-6 py-3 border-b border-gray-100 text-center">Specialization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                {specializations.length === 0 ? (
                  <tr>
                    <td colSpan="2" className="px-6 py-12 text-center text-gray-400 italic">
                      There are currently no records in the system.
                    </td>
                  </tr>
                ) : (
                  specializations.map((spec) => (
                    <tr key={spec.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 font-medium text-slate-400 text-center">#{spec.id}</td>
                      <td className="px-6 py-4 font-semibold text-slate-800 text-center">{spec.name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}