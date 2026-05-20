'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  Scissors, 
  CalendarDays, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck,
  Check,
  MapPin,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { 
  getTenants, 
  getServices, 
  getBarbers, 
  getAppointments, 
  saveAppointments, 
  getCurrentUser,
  Tenant, 
  Service, 
  Barber, 
  Appointment 
} from '@/lib/storage';

export default function CustomerBookingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = (params?.tenant as string) || 'grand-classic';

  const [currentShop, setCurrentShop] = useState<Tenant | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  
  // Progress Step: 1 = Service, 2 = Date & Time, 3 = Confirmation
  const [step, setStep] = useState(1);

  // Form State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  
  // Client Details (prefilled with simulated current user)
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('(555) 901-2345');
  const [clientEmail, setClientEmail] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  // Loaded Slots Configuration
  const [availableDates, setAvailableDates] = useState<{ label: string; dateStr: string; dayIndex: number; disabled?: boolean }[]>([]);
  const [hoursGrid, setHoursGrid] = useState<{ time: string; available: boolean }[]>([]);

  const [bookingSuccessModal, setBookingSuccessModal] = useState(false);
  const [generatedApt, setGeneratedApt] = useState<Appointment | null>(null);

  useEffect(() => {
    // Load database Context
    const shops = getTenants();
    const matchShop = shops.find(s => s.id === tenantId);

    const usr = getCurrentUser();

    // Compute next 10 consecutive business days for safe scheduling select
    const list: { label: string; dateStr: string; dayIndex: number; disabled: boolean }[] = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Start generating dates from today (and skip sundays)
    let currentDay = new Date();
    for (let i = 0; list.length < 10; i++) {
      const cloned = new Date(currentDay);
      cloned.setDate(currentDay.getDate() + i);
      const dayIdx = cloned.getDay();
      
      const dateStr = cloned.toISOString().split('T')[0];
      const isSunday = dayIdx === 0;

      list.push({
        label: `${weekdays[dayIdx]} ${cloned.getDate()}`,
        dateStr,
        dayIndex: dayIdx,
        disabled: isSunday // Shops are usually closed on sundays
      });
    }

    // Construct a standard operating hour list spanning 9AM to 6PM
    const hourSlots = [
      { time: '09:00', available: true },
      { time: '09:30', available: true },
      { time: '10:00', available: false }, // Simulating occupied slot
      { time: '10:30', available: true },
      { time: '11:00', available: true },
      { time: '11:30', available: true },
      { time: '13:00', available: true },
      { time: '13:30', available: true },
      { time: '14:00', available: true },
      { time: '14:30', available: false }, // Simulating occupied slot
      { time: '15:00', available: true },
      { time: '15:30', available: true },
      { time: '16:00', available: true },
      { time: '16:30', available: true },
      { time: '17:00', available: true },
    ];

    setTimeout(() => {
      if (matchShop) {
        setCurrentShop(matchShop);
        
        const activeServices = getServices(tenantId).filter(s => s.status === 'Active');
        setServices(activeServices);
        
        const activeBarbers = getBarbers(tenantId);
        setBarbers(activeBarbers);
        if (activeBarbers.length > 0) {
          setSelectedBarber(activeBarbers[0]);
        }
        
        // Check URL query search for service preselection
        const querySvcId = searchParams?.get('service');
        if (querySvcId) {
          const preSelected = activeServices.find(s => s.id === querySvcId);
          if (preSelected) {
            setSelectedService(preSelected);
            setStep(2); // take them straight to date scheduling step!
          }
        }
      }

      setClientName(usr.name);
      setClientEmail(usr.email);
      setAvailableDates(list);
      
      // Choose the first available date
      const firstEnabled = list.find(d => !d.disabled);
      if (firstEnabled) setSelectedDate(firstEnabled.dateStr);

      setHoursGrid(hourSlots);
      setSelectedTimeSlot('09:00');
    }, 0);

  }, [tenantId, searchParams]);

  const handleFinalBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedBarber || !selectedDate || !selectedTimeSlot || !clientName || !clientEmail) {
      alert('Please fill out all required parameters.');
      return;
    }

    // Construct a beautiful, authenticated appointment block
    const randomId = 'apt-' + Math.floor(1000 + Math.random() * 9000);
    const newApt: Appointment = {
      id: randomId,
      tenantId: tenantId,
      customerName: clientName,
      customerPhone: clientPhone,
      customerEmail: clientEmail,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      barberId: selectedBarber.id,
      barberName: selectedBarber.name,
      date: selectedDate,
      time: selectedTimeSlot,
      price: selectedService.price,
      status: 'Pending', // Default status upon customer reservation submission
      notes: clientNotes,
      createdAt: new Date().toISOString()
    };

    // Load master appointments, push new block, and archive
    const existingMaster = getAppointments();
    const updatedMaster = [newApt, ...existingMaster];
    saveAppointments(updatedMaster);

    setGeneratedApt(newApt);
    setBookingSuccessModal(true);
  };

  const handleModalCompletionRedirect = () => {
    setBookingSuccessModal(false);
    // Dynamic redirect to the active customer dashboard log
    router.push(`/${tenantId}/customer/dashboard`);
  };

  if (!currentShop) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center font-sans p-6">
        <div className="space-y-4 text-center">
          <div className="h-8 w-8 border-4 border-[#d4a574] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#8b7355] text-xs">Authenticating barber node...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col font-sans" id="booking-wizard">
      
      {/* Visual Navigation Header */}
      <header className="sticky top-0 bg-[#1a1a1a] text-white z-40 border-b border-[#d4a574]/15">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push(`/${tenantId}`)}
              className="p-1.5 rounded-sm bg-white/5 hover:bg-white/10 transition text-neutral-400 hover:text-white"
              title="Return to Parlor"
              id="back-to-shop-btn"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="font-serif font-black text-sm tracking-wider uppercase hover:text-[#d4a574] text-white">
              {currentShop.name} Scheduler
            </span>
          </div>

          <div className="text-[10px] text-neutral-450 font-mono tracking-wider uppercase hidden sm:block">
            Database schema: <span className="text-[#d4a574] font-bold">{currentShop.schemaName}</span>
          </div>
        </div>
      </header>

      {/* Main interactive form card */}
      <main className="max-w-4xl w-full mx-auto px-6 py-12 flex-1 flex flex-col items-center">
        
        {/* Progress Stepper Visualiser */}
        <div className="w-full max-w-2xl mb-12" id="scheduler-stepper">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-neutral-200 -translate-y-1/2 z-0"></div>
            
            {/* Step 1 Pill */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`h-9 w-9 rounded-sm flex items-center justify-center text-xs font-bold font-mono transition border-2 ${step >= 1 ? 'bg-[#1a1a1a] text-[#d4a574] border-[#d4a574]' : 'bg-white text-neutral-400 border-neutral-200'}`}>
                {step > 1 ? <Check className="h-4 w-4 text-[#d4a574]" /> : '01'}
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest mt-2 text-neutral-500 font-sans">Service</span>
            </div>

            {/* Step 2 Pill */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`h-9 w-9 rounded-sm flex items-center justify-center text-xs font-bold font-mono transition border-2 ${step >= 2 ? 'bg-[#1a1a1a] text-[#d4a574] border-[#d4a574]' : 'bg-white text-neutral-400 border-neutral-200'}`}>
                {step > 2 ? <Check className="h-4 w-4 text-[#d4a574]" /> : '02'}
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest mt-2 text-neutral-500 font-sans">Time & Date</span>
            </div>

            {/* Step 3 Pill */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`h-9 w-9 rounded-sm flex items-center justify-center text-xs font-bold font-mono transition border-2 ${step >= 3 ? 'bg-[#1a1a1a] text-[#d4a574] border-[#d4a574]' : 'bg-white text-neutral-400 border-neutral-200'}`}>
                03
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest mt-2 text-neutral-500 font-sans">Form Details</span>
            </div>
          </div>
        </div>

        {/* STEP 1: SELECT TREATMENT SERVICE */}
        {step === 1 && (
          <div className="w-full space-y-6" id="booking-step-1">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-serif font-black text-neutral-900 uppercase tracking-tight">Select Your Treatment Option</h2>
              <p className="text-xs text-neutral-500 max-w-md mx-auto font-serif italic">Assess individual times, hair solutions, and pricing cards listed in the active shop ledger.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {services.length === 0 ? (
                <p className="text-neutral-500 text-xs text-center col-span-2">This tenant has not published any active treatments yet.</p>
              ) : (
                services.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedService(svc)}
                    className={`w-full text-left bg-white border rounded-sm p-5 hover:border-[#d4a574]/60 transition relative flex flex-col justify-between ${selectedService?.id === svc.id ? 'border-2 border-[#d4a574] bg-[#d4a574]/5' : 'border-[#1a1a1a]/5'}`}
                    id={`book-service-selector-${svc.id}`}
                  >
                    {selectedService?.id === svc.id && (
                      <span className="absolute top-4 right-4 bg-[#d4a574] text-neutral-900 rounded-sm p-1 border border-neutral-950">
                        <Check className="h-3 w-3" />
                      </span>
                    )}

                    <div className="space-y-1.5 pr-8">
                      <h3 className="font-serif font-black text-lg text-neutral-950 leading-tight uppercase tracking-wide">
                        {svc.name}
                      </h3>
                      <p className="text-xs text-[#1a1a1a]/60 leading-relaxed font-sans">{svc.description}</p>
                    </div>

                    <div className="pt-4 mt-6 border-t border-[#1a1a1a]/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-neutral-400 font-mono">{svc.duration} Mins</span>
                      <span className="font-serif text-sm text-[#8b7355] font-black">${svc.price}</span>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="pt-8 border-t border-[#1a1a1a]/5 flex items-center justify-end">
              <button
                disabled={!selectedService}
                onClick={() => setStep(2)}
                className={`px-6 py-3 font-bold text-xs uppercase tracking-wider rounded-sm transition flex items-center gap-2 ${selectedService ? 'bg-neutral-950 text-white hover:bg-[#d4a574] hover:text-[#1a1a1a]' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'}`}
                id="next-step-1-btn"
              >
                Proceed To Timeline <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE BARBER, DATE, AND TIME WINDOW */}
        {step === 2 && (
          <div className="w-full space-y-8" id="booking-step-2">
            
            <div className="text-center space-y-2">
              <button 
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-black font-semibold uppercase tracking-wider mb-2 font-mono"
                id="back-step-2-btn"
              >
                <ArrowLeft className="h-3 w-3" /> Return to Service Selection
              </button>
              <h2 className="text-2xl md:text-3xl font-serif font-black text-neutral-900 uppercase tracking-tight">Set Your Timeline</h2>
              <p className="text-xs text-neutral-450 font-serif italic">Match calendar days, operating hours, and active barber specialists.</p>
            </div>

            <div className="bg-white border border-[#1a1a1a]/5 rounded-sm p-6 shadow-sm space-y-8">
              
              {/* Part 1: Stylist select */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-[#8b7355] font-sans">1. Choose Barber Stylist</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {barbers.map((barb) => (
                    <button
                      key={barb.id}
                      type="button"
                      onClick={() => setSelectedBarber(barb)}
                      className={`p-3.5 border rounded-sm flex items-center gap-3 hover:border-[#d4a574]/60 text-left transition ${selectedBarber?.id === barb.id ? 'border-[#d4a574] bg-amber-50/10 text-neutral-950 ring-1 ring-amber-500/10' : 'border-[#1a1a1a]/10'}`}
                      id={`barber-select-btn-${barb.id}`}
                    >
                      <div className="h-10 w-10 rounded-sm overflow-hidden bg-neutral-900 border border-neutral-200 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={barb.avatar} alt={barb.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-xs text-neutral-900 leading-tight">{barb.name}</h4>
                        <span className="text-[9px] uppercase font-mono tracking-wider text-neutral-400 block mt-0.5 truncate max-w-[100px]">{barb.specialty}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Part 2: Horizontal Date selector (no crash calendar alternative) */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-[#8b7355] font-sans">2. Choose Available Date</p>
                <div className="flex gap-2.5 overflow-x-auto pb-1" id="date-scroll-list">
                  {availableDates.map((dayObj) => (
                    <button
                      key={dayObj.dateStr}
                      type="button"
                      disabled={dayObj.disabled}
                      onClick={() => setSelectedDate(dayObj.dateStr)}
                      className={`flex-1 min-w-[70px] aspect-square p-2 border rounded-sm flex flex-col items-center justify-center transition-all ${dayObj.disabled ? 'bg-neutral-50 text-neutral-300 border-neutral-100 cursor-not-allowed opacity-50' : selectedDate === dayObj.dateStr ? 'bg-[#1a1a1a] text-[#d4a574] border-[#d4a574] shadow' : 'bg-white text-neutral-700 border-[#1a1a1a]/10 hover:border-[#d4a574]/60'}`}
                      id={`date-select-btn-${dayObj.dateStr}`}
                    >
                      <span className="text-[10px] font-mono font-bold uppercase leading-none">{dayObj.label.split(' ')[0]}</span>
                      <span className="text-base font-serif font-black mt-1 leading-none">{dayObj.label.split(' ')[1]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Part 3: Hour slot selector */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-[#8b7355] font-sans">3. Select Appointment Slot</p>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {hoursGrid.map((slot, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedTimeSlot(slot.time)}
                      className={`py-3.5 px-2 border rounded-sm text-center font-bold tracking-widest text-xs transition font-mono ${!slot.available ? 'bg-neutral-50 border-neutral-100 text-neutral-300 cursor-not-allowed line-through' : selectedTimeSlot === slot.time ? 'bg-[#d4a574] text-neutral-900 border-[#d4a574] shadow' : 'bg-white text-neutral-800 border-[#1a1a1a]/10 hover:border-[#d4a574]'}`}
                      id={`time-select-btn-${slot.time}`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="pt-6 border-t border-[#1a1a1a]/5 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 font-semibold text-xs uppercase tracking-wider text-neutral-500 hover:text-black font-mono hover:underline"
              >
                Prev: Treatments
              </button>
              
              <button
                disabled={!selectedDate || !selectedTimeSlot || !selectedBarber}
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-[#1a1a1a] text-white hover:bg-[#d4a574] hover:text-[#1a1a1a] font-bold text-xs uppercase tracking-wider rounded-sm transition flex items-center gap-2"
                id="next-step-2-btn"
              >
                Proceed to Contacts <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONTACT FORM DETAILS AND SUMMATION */}
        {step === 3 && (
          <div className="w-full space-y-8" id="booking-step-3">
            
            <div className="text-center space-y-2">
              <button 
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-black font-semibold uppercase tracking-wider mb-2 font-mono"
                id="back-step-3-btn"
              >
                <ArrowLeft className="h-3 w-3" /> Return to Date & Time
              </button>
              <h2 className="text-2xl md:text-3xl font-serif font-black text-neutral-900 uppercase tracking-tight">Grooming Authorization Form</h2>
              <p className="text-xs text-neutral-450 font-serif italic">Complete personal contact logs and authorize appointment reservation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Form entries - Left */}
              <form onSubmit={handleFinalBookingSubmit} className="md:col-span-7 bg-white border border-[#1a1a1a]/5 rounded-sm p-6 shadow-sm space-y-4">
                <h3 className="font-serif font-black text-sm uppercase tracking-wide text-[#1a1a1a] border-b border-neutral-100 pb-2">Client Details</h3>
                
                <div className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="text-neutral-400 uppercase tracking-widest text-[9px] block mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. James Craig"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full p-2.5 border border-[#1a1a1a]/15 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium"
                      id="booking-name-input"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-neutral-400 uppercase tracking-widest text-[9px] block mb-1">E-mail <span className="text-[#8b7355]">*</span></label>
                      <input 
                        type="email" 
                        required
                        placeholder="james@co.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full p-2.5 border border-[#1a1a1a]/15 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium"
                        id="booking-email-input"
                      />
                    </div>
                    <div>
                      <label className="text-neutral-400 uppercase tracking-widest text-[9px] block mb-1">Mobile Phone <span className="text-[#8b7355]">*</span></label>
                      <input 
                        type="tel" 
                        required
                        placeholder="(555) 901-2345"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full p-2.5 border border-[#1a1a1a]/15 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium"
                        id="booking-phone-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-neutral-400 uppercase tracking-widest text-[9px] block mb-1">Stylist Directives / Session Notes</label>
                    <textarea 
                      rows={3}
                      value={clientNotes}
                      placeholder="e.g. Skin fade, blend sides..."
                      onChange={(e) => setClientNotes(e.target.value)}
                      className="w-full p-2.5 border border-[#1a1a1a]/15 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#d4a574] font-medium font-sans"
                      id="booking-notes-input"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 bg-[#1a1a1a] hover:bg-[#d4a574] text-white hover:text-neutral-900 transition font-serif font-black uppercase text-xs tracking-widest rounded-sm"
                  id="booking-confirm-submit-btn"
                >
                  Request Appointment Window
                </button>
              </form>

              {/* Summarization card - Right */}
              <div className="md:col-span-5 bg-[#1a1a1a] text-[#fafaf9] rounded-sm overflow-hidden border border-[#d4a574]/20 shadow-lg">
                <div className="bg-[#1a1a1a] p-5 border-b border-[#d4a574]/15 flex items-center justify-between">
                  <span className="font-serif font-bold text-xs text-[#d4a574] uppercase tracking-wider">Session Summation</span>
                  <Scissors className="h-4 w-4 text-[#d4a574]" />
                </div>

                <div className="p-6 space-y-6">
                  {selectedService && (
                    <div className="space-y-4">
                      <div className="border-b border-white/5 pb-3">
                        <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-mono">Chosen Grooming</p>
                        <h4 className="font-serif font-bold text-[#fafaf9] text-base leading-snug uppercase tracking-wide">{selectedService.name}</h4>
                        <p className="text-[10px] text-stone-405 italic font-medium leading-relaxed mt-1 font-sans">{selectedService.description}</p>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <p className="flex justify-between">
                          <span className="text-neutral-400 font-semibold font-sans">Artisan Stylist:</span>
                          <span className="font-serif text-[#d4a574] font-bold">{selectedBarber?.name || 'Any Available'}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-neutral-400 font-semibold font-sans">Calendar Date:</span>
                          <span className="font-mono">{selectedDate}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-neutral-400 font-semibold font-sans">Starting Hour:</span>
                          <span className="font-mono text-white font-bold">{selectedTimeSlot}</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="text-neutral-400 font-semibold font-sans">Session Length:</span>
                          <span className="font-mono text-[#d4a574] font-bold">{selectedService.duration} Minutes</span>
                        </p>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <span className="text-xs font-semibold text-neutral-400 uppercase font-sans">Total Bill Due:</span>
                        <span className="font-serif text-xl font-black text-white">${selectedService.price}</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-white/5 p-3.5 rounded-sm border border-white/5 text-[10px] text-zinc-450 flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#d4a574] shrink-0 mt-0.5" />
                    <p className="leading-normal font-sans">This window is isolated under tenant {currentShop.schemaName}. Upon booking, the slot will register directly into the Barber ledger.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* SUCCESS MODAL TRIGGER */}
      {bookingSuccessModal && generatedApt && (
        <div className="fixed inset-0 bg-[#1a1a1a]/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm" id="booking-success-modal">
          <div className="bg-white border-2 border-[#d4a574] rounded-sm max-w-md w-full overflow-hidden shadow-2xl animate-fade-in text-[#1a1a1a] p-8 text-center space-y-6">
            <div className="h-16 w-16 bg-[#d4a574]/10 text-[#8b7355] rounded-sm flex items-center justify-center mx-auto border border-[#d4a574]/20 animate-pulse">
              <CheckCircle className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <span className="text-[#8b7355] text-[10px] uppercase font-mono tracking-widest font-black block">Database Committed Successfully</span>
              <h3 className="font-serif font-black text-2xl text-neutral-950 uppercase">Appointment Scheduled</h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans max-w-xs mx-auto">
                Congratulations {generatedApt.customerName}! Your scheduled session is pending shop review under isolated key <code className="bg-neutral-100 p-0.5 text-zinc-805 font-bold rounded-sm font-mono">#{generatedApt.id}</code>.
              </p>
            </div>

            <div className="bg-[#fafaf9] rounded-sm p-4 border border-[#1a1a1a]/5 text-xs text-left space-y-1.5 font-medium max-w-sm mx-auto">
              <p className="flex justify-between"><span className="text-neutral-400 font-sans">Treatment:</span> <span className="font-bold text-neutral-950 font-serif">{generatedApt.serviceName}</span></p>
              <p className="flex justify-between"><span className="text-neutral-400 font-sans">Barber:</span> <span className="font-serif font-bold text-neutral-950">{generatedApt.barberName}</span></p>
              <p className="flex justify-between"><span className="text-neutral-400 font-sans">Time Shift:</span> <span className="font-bold text-neutral-950 font-mono">{generatedApt.date} at {generatedApt.time}</span></p>
            </div>

            <button 
              onClick={handleModalCompletionRedirect}
              className="w-full py-3 bg-[#1a1a1a] hover:bg-[#d4a574] hover:text-[#1a1a1a] transition font-serif font-black text-[#fafaf9] uppercase tracking-widest text-xs rounded-sm"
              id="confirm-ok-btn"
            >
              Open My Bookings Log
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
