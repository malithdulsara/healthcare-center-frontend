import React from 'react';

export default function Sidebar({ currentTab, setCurrentTab }) {
  const menus = [
    { id: 'specializations', name: 'Specializations', icon: '🏷️' },
    { id: 'doctors', name: 'Manage Doctors', icon: '🧑‍⚕️' },
    { id: 'staff', name: 'Manage Staff', icon: '👥' },
    { id: 'schedules', name: 'Manage Schedules', icon: '📅' },
    { id: 'book-appointment', name: 'Book Appointment', icon: '🎟️' },
    { id: 'my-appointments', name: 'My Appointments', icon: '🎟️' },
    { id: 'manage-appointments', name: 'Manage Appointments', icon: '🗂️' }
  ];

  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col shadow-xl">
      <div className="mb-8 p-2 text-center border-b border-slate-700">
        <h1 className="text-xl font-bold text-blue-400">Healthcare Center</h1>
        <p className="text-xs text-slate-400 mt-1">Admin Dashboard</p>
      </div>
      
      <nav className="flex-1 space-y-2">
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => setCurrentTab(menu.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition font-medium text-left ${
              currentTab === menu.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-lg">{menu.icon}</span>
            <span>{menu.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}