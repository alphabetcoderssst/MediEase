import React, { useState, useEffect } from 'react';

/**
 * MediEase QR Senior - Functional React App Entry Point
 * 
 * This file centralizes the 13-screen flow for the elderly-first 
 * healthcare application. It manages navigation state and 
 * patient data.
 */

const App = () => {
  const [currentStep, setCurrentStep] = useState('START');
  const [patientData, setPatientData] = useState({
    name: '',
    mobile: '',
    age: '',
    department: '',
    doctor: '',
    date: '',
    time: '',
    token: 'A005',
    serving: 'A003',
    ahead: 2,
    wait: '20 min'
  });

  // Mock queue progression logic
  useEffect(() => {
    if (currentStep === 'QUEUE') {
      const timer = setTimeout(() => {
        setPatientData(prev => ({ ...prev, serving: 'A004', ahead: 1, wait: '10 min' }));
      }, 5000); // Progress after 5s
      return () => clearTimeout(timer);
    }
    if (currentStep === 'QUEUE' && patientData.serving === 'A004') {
       const timer = setTimeout(() => {
        setCurrentStep('YOUR_TURN');
      }, 5000); // Call patient after another 5s
      return () => clearTimeout(timer);
    }
  }, [currentStep, patientData.serving]);

  // Screen Router
  const renderScreen = () => {
    switch (currentStep) {
      case 'START':
        return <StartScreen onBook={() => setCurrentStep('DETAILS')} onCheck={() => setCurrentStep('TOKEN')} />;
      case 'DETAILS':
        return <DetailsScreen 
          data={patientData} 
          updateData={(d) => setPatientData({...patientData, ...d})} 
          onContinue={() => setCurrentStep('DEPARTMENT')} 
        />;
      case 'DEPARTMENT':
        return <DepartmentScreen onSelect={(dept) => {
          setPatientData({...patientData, department: dept});
          setCurrentStep('DOCTOR');
        }} />;
      case 'DOCTOR':
        return <DoctorScreen onSelect={(doc) => {
          setPatientData({...patientData, doctor: doc});
          setCurrentStep('DATE');
        }} />;
      case 'DATE':
        return <DateScreen onSelect={(date) => {
          setPatientData({...patientData, date: date});
          setCurrentStep('TIME');
        }} />;
      case 'TIME':
        return <TimeScreen onSelect={(time) => {
          setPatientData({...patientData, time: time});
          setCurrentStep('CONFIRM');
        }} />;
      case 'CONFIRM':
        return <ConfirmScreen data={patientData} onConfirm={() => setCurrentStep('TOKEN')} />;
      case 'TOKEN':
        return <TokenScreen data={patientData} onCheckQueue={() => setCurrentStep('QUEUE')} />;
      case 'QUEUE':
        return <QueueScreen data={patientData} onRequestHelp={() => setCurrentStep('HELP')} />;
      case 'YOUR_TURN':
        return <YourTurnScreen data={patientData} onGoToRoom={() => setCurrentStep('CONSULTATION')} />;
      case 'CONSULTATION':
        return <ConsultationScreen data={patientData} onFinish={() => setCurrentStep('COMPLETE')} />;
      case 'COMPLETE':
        return <CompleteScreen onDone={() => setCurrentStep('START')} />;
      case 'HELP':
        return <HelpScreen onCancel={() => setCurrentStep('QUEUE')} />;
      default:
        return <StartScreen onBook={() => setCurrentStep('DETAILS')} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-md mx-auto h-screen relative overflow-hidden bg-white shadow-xl">
        {renderScreen()}
      </div>
    </div>
  );
};

/* --- SCREEN COMPONENTS --- */

const StartScreen = ({ onBook, onCheck }) => (
  <div className="flex flex-col items-center justify-center h-full px-8 text-center space-y-12">
    <div className="space-y-4">
      <h1 className="text-4xl font-bold text-primary">MediEase QR</h1>
      <p className="text-2xl text-slate-600">Your hospital visit, made easier.</p>
    </div>
    <div className="w-full space-y-6">
      <button onClick={onBook} className="w-full py-6 text-2xl font-bold text-white bg-teal-700 rounded-2xl shadow-lg active:scale-95 transition-transform">
        BOOK APPOINTMENT
      </button>
      <div className="space-y-2">
        <p className="text-lg text-slate-500">Already have a token?</p>
        <button onClick={onCheck} className="w-full py-4 text-xl font-bold text-teal-700 border-4 border-teal-700 rounded-2xl active:scale-95 transition-transform">
          CHECK MY TOKEN
        </button>
      </div>
    </div>
  </div>
);

const DetailsScreen = ({ data, updateData, onContinue }) => (
  <div className="p-8 h-full flex flex-col justify-between">
    <div className="space-y-10">
      <h2 className="text-4xl font-bold">Your details</h2>
      <div className="space-y-8">
        <div className="space-y-2">
          <label className="text-xl font-bold text-slate-700">Full Name</label>
          <input 
            type="text" 
            placeholder="Enter your name"
            className="w-full p-6 text-2xl border-4 border-slate-200 rounded-2xl focus:border-teal-700 outline-none"
            onChange={(e) => updateData({ name: e.target.value })}
            value={data.name}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xl font-bold text-slate-700">Mobile Number</label>
          <input 
            type="tel" 
            placeholder="Enter mobile number"
            className="w-full p-6 text-2xl border-4 border-slate-200 rounded-2xl focus:border-teal-700 outline-none"
            onChange={(e) => updateData({ mobile: e.target.value })}
            value={data.mobile}
          />
        </div>
      </div>
    </div>
    <button onClick={onContinue} className="w-full py-6 text-2xl font-bold text-white bg-teal-700 rounded-2xl shadow-lg">
      CONTINUE
    </button>
  </div>
);

const DepartmentScreen = ({ onSelect }) => {
  const depts = ["General Medicine", "Cardiology", "Orthopedics", "Pediatrics", "Dermatology"];
  return (
    <div className="p-8 h-full space-y-8">
      <h2 className="text-4xl font-bold">Choose a department</h2>
      <div className="space-y-4 overflow-y-auto pb-10">
        {depts.map(dept => (
          <button 
            key={dept} 
            onClick={() => onSelect(dept)}
            className="w-full p-8 text-2xl font-bold text-left bg-white border-4 border-slate-100 rounded-3xl shadow-sm hover:border-teal-700 active:bg-teal-50 flex justify-between items-center"
          >
            {dept}
            <span className="text-teal-700">→</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const DoctorScreen = ({ onSelect }) => (
  <div className="p-8 h-full space-y-8">
    <h2 className="text-4xl font-bold">Choose your doctor</h2>
    <div className="p-8 border-4 border-slate-100 rounded-3xl space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 bg-slate-200 rounded-full"></div>
        <div>
          <h3 className="text-2xl font-bold">Dr. Priya Sharma</h3>
          <p className="text-xl text-slate-500">Cardiology</p>
        </div>
      </div>
      <div className="bg-teal-50 p-4 rounded-xl">
        <p className="text-xl font-bold text-teal-800">Available Today</p>
      </div>
      <button onClick={() => onSelect('Dr. Priya Sharma')} className="w-full py-4 text-2xl font-bold text-white bg-teal-700 rounded-2xl">
        SELECT
      </button>
    </div>
  </div>
);

const DateScreen = ({ onSelect }) => {
  // Today's Date is August 11, 2026
  const today = new Date(2026, 7, 11); // Month is 0-indexed (7 = August)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 11));
  const [selectedDay, setSelectedDay] = useState(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // Helper values
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of current month
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Total days in current month
  const totalDays = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    // Prevent going to months before August 2026
    if (year === 2026 && month <= 7) return;
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const handleDaySelect = (day) => {
    const checkDate = new Date(year, month, day);
    // Compare times using dates set to midnight
    const tCompare = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    if (checkDate.getTime() < tCompare) return; // Past date disabled
    setSelectedDay(day);
  };

  const handleContinue = () => {
    if (!selectedDay) return;
    const finalDate = new Date(year, month, selectedDay);
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    onSelect(finalDate.toLocaleDateString('en-US', options));
  };

  // Render days array
  const dayCells = [];
  // Empty blocks for alignment
  for (let i = 0; i < firstDayIndex; i++) {
    dayCells.push(<div key={`empty-${i}`} className="p-4"></div>);
  }
  // Days of the month
  for (let d = 1; d <= totalDays; d++) {
    const isPast = new Date(year, month, d).getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const isSelected = selectedDay === d;
    dayCells.push(
      <button
        key={`day-${d}`}
        disabled={isPast}
        onClick={() => handleDaySelect(d)}
        className={`p-3 text-xl font-bold rounded-full w-12 h-12 flex items-center justify-center transition-colors
          ${isPast ? 'text-slate-200 cursor-not-allowed' : 'text-slate-800 hover:bg-teal-50'}
          ${isSelected ? 'bg-teal-700 text-white hover:bg-teal-800' : ''}
        `}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="p-8 h-full flex flex-col justify-between">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold">Select Appointment Date</h2>
        
        {/* Calendar Nav */}
        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
          <button 
            onClick={handlePrevMonth} 
            disabled={year === 2026 && month <= 7}
            className={`text-3xl font-black px-4 py-2 rounded-xl active:bg-slate-200 ${year === 2026 && month <= 7 ? 'text-slate-300 cursor-not-allowed' : 'text-teal-700'}`}
          >
            ←
          </button>
          <span className="text-2xl font-bold text-slate-800">
            {months[month]} {year}
          </span>
          <button 
            onClick={handleNextMonth} 
            className="text-3xl font-black px-4 py-2 text-teal-700 rounded-xl active:bg-slate-200"
          >
            →
          </button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 text-center gap-y-2">
          {daysOfWeek.map(d => (
            <div key={d} className="text-lg font-bold text-slate-400">{d}</div>
          ))}
          {dayCells}
        </div>
      </div>

      <button 
        onClick={handleContinue}
        disabled={!selectedDay}
        className={`w-full py-6 text-2xl font-bold text-white rounded-2xl shadow-lg transition-colors
          ${selectedDay ? 'bg-teal-700 active:scale-95' : 'bg-slate-300 cursor-not-allowed'}
        `}
      >
        {selectedDay ? 'CONTINUE' : 'CHOOSE A DATE'}
      </button>
    </div>
  );
};

const TimeScreen = ({ onSelect }) => {
  const slots = [
    { time: "09:00 AM", status: "Available" },
    { time: "10:30 AM", status: "Available" },
    { time: "02:00 PM", status: "Few seats left" },
    { time: "03:30 PM", status: "Available" }
  ];
  return (
    <div className="p-8 h-full space-y-8">
      <h2 className="text-4xl font-bold">Choose a time</h2>
      <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-10">
        {slots.map(s => (
          <button 
            key={s.time} 
            onClick={() => onSelect(s.time)}
            className="w-full p-6 text-2xl font-bold bg-white border-4 border-slate-100 rounded-3xl shadow-sm hover:border-teal-700 active:bg-teal-50 flex justify-between items-center"
          >
            <span>{s.time}</span>
            <span className="text-sm font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-full uppercase">{s.status}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const ConfirmScreen = ({ data, onConfirm }) => (
  <div className="p-8 h-full flex flex-col justify-between">
    <div className="space-y-8">
      <h2 className="text-4xl font-bold text-center">Check your appointment</h2>
      <div className="space-y-6 bg-slate-50 p-8 rounded-3xl border-2 border-slate-100 text-center">
        <div className="space-y-2">
          <p className="text-lg text-slate-500">DOCTOR</p>
          <p className="text-3xl font-bold">{data.doctor || "Dr. Priya Sharma"}</p>
        </div>
        <div className="h-px bg-slate-200 w-full"></div>
        <div className="space-y-2">
          <p className="text-lg text-slate-500">DEPARTMENT</p>
          <p className="text-3xl font-bold">{data.department || "Cardiology"}</p>
        </div>
        <div className="h-px bg-slate-200 w-full"></div>
        <div className="space-y-2">
          <p className="text-lg text-slate-500">DATE & TIME</p>
          <p className="text-3xl font-bold">{data.date || "Wed, Aug 12"} at {data.time || "10:30 AM"}</p>
        </div>
      </div>
    </div>
    <button onClick={onConfirm} className="w-full py-6 text-2xl font-bold text-white bg-teal-700 rounded-2xl shadow-lg">
      CONFIRM
    </button>
  </div>
);

const TokenScreen = ({ data, onCheckQueue }) => (
  <div className="p-8 h-full flex flex-col items-center justify-center space-y-12 text-center">
    <div className="space-y-2">
      <h2 className="text-3xl font-bold text-teal-700">Your appointment is confirmed</h2>
      <p className="text-xl text-slate-500">Scheduled for {data.date} at {data.time}</p>
    </div>
    <div className="w-full p-10 bg-white border-8 border-teal-700 rounded-[3rem] shadow-2xl space-y-6">
      <p className="text-2xl font-bold text-slate-400">YOUR TOKEN</p>
      <h3 className="text-8xl font-black text-teal-800 tracking-tighter">#{data.token}</h3>
      <div className="flex justify-between pt-6 border-t-2 border-slate-100">
        <div>
          <p className="text-sm font-bold text-slate-400 uppercase">Wait</p>
          <p className="text-2xl font-bold">{data.wait}</p>
        </div>
        <div>
          <p className="text-sm font-bold text-slate-400 uppercase">Ahead</p>
          <p className="text-2xl font-bold">{data.ahead}</p>
        </div>
      </div>
    </div>
    <button onClick={onCheckQueue} className="w-full py-6 text-2xl font-bold text-white bg-teal-700 rounded-2xl shadow-lg">
      TRACK MY TURN →
    </button>
  </div>
);

const QueueScreen = ({ data, onRequestHelp }) => (
  <div className="p-8 h-full space-y-10">
    <h2 className="text-4xl font-bold text-center">Your queue</h2>
    <div className="space-y-6 text-center">
       <div className="p-8 bg-slate-50 rounded-3xl border-2 border-slate-100">
          <p className="text-xl text-slate-500">NOW SERVING</p>
          <p className="text-6xl font-black text-slate-900">#{data.serving}</p>
       </div>
       <div className="p-8 bg-teal-50 rounded-3xl border-4 border-teal-100">
          <p className="text-xl text-teal-800 font-bold">PEOPLE AHEAD</p>
          <p className="text-6xl font-black text-teal-900">{data.ahead}</p>
       </div>
    </div>
    <div className="flex flex-col items-center space-y-4 pt-10">
      <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-teal-700 w-2/3 transition-all duration-1000"></div>
      </div>
      <p className="text-xl font-bold text-slate-500 italic">Please wait for your number to be called...</p>
    </div>
    <button onClick={onRequestHelp} className="w-full py-4 text-xl font-bold text-slate-400 underline decoration-2">
      Need help?
    </button>
  </div>
);

const YourTurnScreen = ({ data, onGoToRoom }) => (
  <div className="p-8 h-full bg-teal-700 flex flex-col items-center justify-center space-y-12 text-white text-center animate-pulse">
    <h2 className="text-7xl font-black tracking-tight">YOUR TURN</h2>
    <h3 className="text-9xl font-black opacity-40">#{data.token}</h3>
    <div className="bg-white text-teal-900 p-10 rounded-3xl w-full shadow-2xl space-y-4">
      <p className="text-3xl font-bold">GO TO</p>
      <p className="text-7xl font-black">ROOM 204</p>
      <p className="text-2xl font-bold opacity-60">Dr. Priya Sharma</p>
    </div>
    <button onClick={onGoToRoom} className="w-full py-8 text-3xl font-black bg-white text-teal-700 rounded-3xl shadow-2xl animate-bounce">
      GO TO ROOM →
    </button>
  </div>
);

const ConsultationScreen = ({ data, onFinish }) => (
  <div className="p-8 h-full flex flex-col items-center justify-center space-y-8 text-center">
    <div className="w-40 h-40 bg-teal-50 rounded-full flex items-center justify-center border-8 border-teal-100">
       <span className="text-6xl">🩺</span>
    </div>
    <h2 className="text-4xl font-bold">{data.doctor}</h2>
    <div className="px-6 py-2 bg-slate-100 rounded-full">
      <p className="text-2xl font-bold text-slate-600">ROOM 204</p>
    </div>
    <p className="text-3xl font-medium text-teal-700">Your consultation has started.</p>
    <button onClick={onFinish} className="w-full mt-8 py-4 text-xl font-bold text-white bg-teal-700 rounded-2xl shadow-lg">
      COMPLETE VISIT
    </button>
  </div>
);

const CompleteScreen = ({ onDone }) => (
  <div className="p-8 h-full flex flex-col items-center justify-center space-y-12 text-center">
    <div className="w-32 h-32 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-6xl shadow-inner">
      ✓
    </div>
    <h2 className="text-5xl font-black text-slate-900">VISIT COMPLETE</h2>
    <p className="text-2xl text-slate-500">Thank you for using MediEase QR.</p>
    <button onClick={onDone} className="w-full py-6 text-2xl font-bold text-white bg-teal-700 rounded-2xl shadow-lg">
      DONE
    </button>
  </div>
);

const HelpScreen = ({ onCancel }) => (
  <div className="p-8 h-full flex flex-col items-center justify-center space-y-12 text-center">
     <div className="w-32 h-32 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-6xl animate-ping">
      🔔
     </div>
    <div className="space-y-4">
      <h2 className="text-5xl font-black text-red-600">HELP REQUESTED</h2>
      <p className="text-2xl text-slate-600">A staff member has been notified and is on their way.</p>
    </div>
    <button onClick={onCancel} className="w-full py-6 text-2xl font-bold text-slate-400 border-4 border-slate-100 rounded-2xl">
      CANCEL REQUEST
    </button>
  </div>
);

export default App;
