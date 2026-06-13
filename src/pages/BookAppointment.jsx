import React, { useState, useEffect } from "react";
import axios from "axios";

export default function BookAppointment() {
  // 1. Wizard Steps සහ දත්ත සඳහා States
  const [step, setStep] = useState(1); // Step 1, 2, හෝ 3
  const [specializations, setSpecializations] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const TEMPORARY_PATIENT_ID = 1;

  const ADMIN_API_URL = "http://localhost:8080/api/admin";
  const SCHEDULE_API_URL = "http://localhost:8080/api/schedules";
  const APPOINTMENT_API_URL = "http://localhost:8080/api/appointments";

  useEffect(() => {
    fetchSpecializations();
  }, []);

  const fetchSpecializations = async () => {
    try {
      const response = await axios.get(`${ADMIN_API_URL}/specializations`);
      setSpecializations(response.data);
    } catch (error) {
      console.error("Failed to fetch specializations:", error);
    }
  };

  useEffect(() => {
    if (selectedSpecialization) {
      fetchDoctorsBySpecialization();
    } else {
      setDoctors([]);
      setSelectedDoctor(null);
    }
  }, [selectedSpecialization]);

  const fetchDoctorsBySpecialization = async () => {
    try {
      const response = await axios.get(`${ADMIN_API_URL}/doctors`);

      const filtered = response.data.filter(
        (doc) => doc.specialization?.id === parseInt(selectedSpecialization),
      );
      setDoctors(filtered);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
    }
  };

  const handleDoctorSelect = async (doc) => {
    setSelectedDoctor(doc);
    setLoading(true);
    try {
      const response = await axios.get(`${SCHEDULE_API_URL}/doctor/${doc.id}`);

      const todayStr = new Date().toISOString().split("T")[0];
      const activeSchedules = response.data.filter(
        (sch) => sch.availableDate >= todayStr,
      );

      setSchedules(activeSchedules);
      setStep(2);
    } catch (error) {
      console.error("Failed to fetch doctor schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSelect = (sch) => {
    setSelectedSchedule(sch);
    setStep(3);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSchedule) return;

    const appointmentPayload = {
      patientId: TEMPORARY_PATIENT_ID,
      scheduleId: selectedSchedule.id,
    };

    try {
      await axios.post(APPOINTMENT_API_URL, appointmentPayload);
      setMessage({
        text: "Your Appointment has been successfully booked! 🎉🎟️",
        type: "success",
      });
      setTimeout(() => {
        setStep(1);
        setSelectedSpecialization("");
        setSelectedDoctor(null);
        setSelectedSchedule(null);
        setMessage({ text: "", type: "" });
      }, 4000);
    } catch (error) {
      setMessage({
        text: "Failed to book appointment. Please try again!",
        type: "error",
      });
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-slate-800">
          Book An Appointment
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Get channelled with our specialized doctors in 3 simple steps.
        </p>
      </div>

      <div className="flex items-center justify-center space-x-4 border-b border-gray-100 pb-5">
        <div
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${step === 1 ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-500"}`}
        >
          1. Choose Doctor
        </div>
        <div className="text-gray-300">➔</div>
        <div
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${step === 2 ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-500"}`}
        >
          2. Select Session
        </div>
        <div className="text-gray-300">➔</div>
        <div
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${step === 3 ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-500"}`}
        >
          3. Confirm Booking
        </div>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold border text-center transition-all ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm max-w-md mx-auto">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filter by Specialization
            </label>
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition text-sm bg-white"
            >
              <option value="">Select Category</option>
              {specializations.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name}
                </option>
              ))}
            </select>
          </div>

          {selectedSpecialization && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-700">
                Available Doctors ({doctors.length})
              </h3>
              {doctors.length === 0 ? (
                <p className="text-sm text-gray-400 italic">
                  No doctors available under this specialization currently.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctors.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center hover:border-blue-500 transition-all group"
                    >
                      <div>
                        <h4 className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition">
                          {doc.user?.name}
                        </h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                          ✉️ {doc.user?.email}
                        </p>
                        <span className="inline-block mt-2 px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold">
                          {doc.specialization?.name}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDoctorSelect(doc)}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition cursor-pointer"
                      >
                        See Slots ➔
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep(1)}
              className="text-sm text-blue-600 hover:underline cursor-pointer font-medium"
            >
              ⬅ Back to Doctors
            </button>
            <h3 className="text-lg font-bold text-slate-700">
              Available Sessions for {selectedDoctor?.user?.name}
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-400">
              Loading channels...
            </div>
          ) : schedules.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-2xl border border-gray-100 text-gray-400 italic shadow-sm">
              This doctor has no active availability sessions scheduled at the
              moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schedules.map((sch) => (
                <div
                  key={sch.id}
                  onClick={() => handleScheduleSelect(sch)}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-blue-500 hover:shadow-md transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">
                      📅 {sch.availableDate}
                    </span>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                      Available
                    </span>
                  </div>
                  <div className="text-sm font-bold text-blue-600 mt-3 flex items-center justify-between">
                    <span>
                      ⏱️ Time: {sch.startTime?.substring(0, 5)} -{" "}
                      {sch.endTime?.substring(0, 5)}
                    </span>
                    <span className="text-xs font-semibold text-gray-400 group-hover:text-blue-600 transition">
                      Select Slot ➔
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 3 && selectedSchedule && (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-md max-w-xl mx-auto space-y-6">
          <h3 className="text-xl font-bold text-center text-slate-800 border-b border-gray-50 pb-3">
            Confirm Your Appointment Ticket
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-gray-400 font-medium">Doctor Name:</span>
              <span className="font-bold text-slate-800">
                {selectedDoctor?.user?.name}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-gray-400 font-medium">Specialization:</span>
              <span className="font-semibold text-blue-600">
                {selectedDoctor?.specialization?.name}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-gray-400 font-medium">
                Channelling Date:
              </span>
              <span className="font-bold text-slate-800">
                📅 {selectedSchedule.availableDate}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-50 pb-2">
              <span className="text-gray-400 font-medium">Session Time:</span>
              <span className="font-bold text-slate-800">
                ⏱️ {selectedSchedule.startTime?.substring(0, 5)} -{" "}
                {selectedSchedule.endTime?.substring(0, 5)}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-gray-400 font-medium">
                Hospital Room / Location:
              </span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                📍 {selectedSchedule?.roomNumber || "Main Clinic Room"}
              </span>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setStep(2)}
              className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition cursor-pointer"
            >
              Go Back
            </button>
            <button
              onClick={handleConfirmBooking}
              className="w-2/3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/10 transition cursor-pointer"
            >
              Confirm & Book Appointment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
