import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ManageSpecializations from './pages/ManageSpecifications';
import ManageDoctors from './pages/ManageDoctors';
import ManageStaff from './pages/ManageStaff';
import ManageSchedules from './pages/ManageSchedules';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';

function App() {
  const [currentTab, setCurrentTab] = useState('specializations');

  const renderPage = () => {
    switch (currentTab) {
      case 'specializations':
        return <ManageSpecializations />;
      case 'doctors':
        return <ManageDoctors />;
      case 'staff':
        return <ManageStaff />;
      case 'schedules':
        return <ManageSchedules />;
      case 'book-appointment':
        return <BookAppointment />;
      case 'my-appointments':
        return <MyAppointments />;
      default:
        return <ManageSpecializations />;
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen font-sans antialiased">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <div className="flex-1 overflow-y-auto">
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center border-b border-gray-100">
          <span className="font-semibold text-gray-500 text-sm">Local Date: {new Date().toLocaleDateString()}</span>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">A</div>
            <span className="font-medium text-gray-700">Administrator</span>
          </div>
        </header>

        <main className="max-w-7xl mx-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;