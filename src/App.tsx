import { useState, useEffect, FormEvent, MouseEvent } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  Stethoscope, 
  Syringe, 
  ShieldCheck, 
  HeartHandshake, 
  Award, 
  Heart, 
  Scissors, 
  Utensils, 
  ShoppingBag, 
  Activity, 
  Sparkles, 
  Smile, 
  Phone, 
  MapPin, 
  Clock, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  X, 
  Menu, 
  Check, 
  Plus, 
  User, 
  BadgeAlert, 
  FileCheck2, 
  ArrowRight,
  Star,
  Zap,
  CheckCircle2,
  Lock,
  ThumbsUp,
  LogOut,
  Unlock,
  Users,
  Coins,
  TrendingUp,
  Globe,
  FileText,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { 
  CLINIC_INFO, 
  CORE_VALUES, 
  SERVICES, 
  TESTIMONIALS, 
  FAQS, 
  Service, 
  Review, 
  FAQItem 
} from './data';

// Definition of locally stored appointments
interface Appointment {
  id: string;
  ownerName: string;
  ownerAddress?: string; // CRM confidential detail
  phone: string;
  petName: string;
  petBreed?: string;    // CRM confidential detail
  petAge?: string;      // CRM confidential detail
  animalType: string;
  serviceId: string;
  serviceTitle: string;
  date: string;
  session: 'Morning' | 'Afternoon' | 'Evening';
  notes?: string;
  fee: number;
  ticketNo: string;
  createdAt: string;
  status: 'Pending' | 'Checked-In' | 'Completed';
}

// Pre-seeded clinical records for testing and premium layout loading
const DEFAULT_BOOKINGS: Appointment[] = [
  {
    id: "apt_1",
    ownerName: "Muhammad Asif",
    ownerAddress: "House 12, Dunyapur Rural Division, Pakistan",
    phone: "+92 328 7348720",
    petName: "Heifer Cow Delta",
    petBreed: "Zebu Sahiwal Ruminant",
    petAge: "3 Years",
    animalType: "Cow",
    serviceId: "s4",
    serviceTitle: "Treatment",
    date: "2026-06-10",
    session: "Morning",
    notes: "Sudden appetite loss, persistent high temperature, check vital parameters",
    fee: 1400,
    ticketNo: "PVZ-872051",
    createdAt: "2026-06-09",
    status: "Pending"
  },
  {
    id: "apt_2",
    ownerName: "Sara Khan",
    ownerAddress: "Sector F-10 Main Boulevard, Islamabad, Pakistan",
    phone: "+92 300 5551234",
    petName: "Mochi",
    petBreed: "Purebred Fluffy Persian Cat",
    petAge: "8 Months",
    animalType: "Cat",
    serviceId: "s2",
    serviceTitle: "Vaccination",
    date: "2026-06-11",
    session: "Afternoon",
    notes: "Requires rabies vaccine core booster scheduling plus routine claw de-shelling",
    fee: 1500,
    ticketNo: "PVZ-412355",
    createdAt: "2026-06-09",
    status: "Checked-In"
  },
  {
    id: "apt_3",
    ownerName: "Chaudhary Bashir",
    ownerAddress: "Bazar Dokota Road Complex, Dunyapur, Pakistan",
    phone: "+92 311 4567890",
    petName: "Snowball",
    petBreed: "Angora Longhorn Rabbit",
    petAge: "1 Year",
    animalType: "Bird/Rabbit",
    serviceId: "s3",
    serviceTitle: "Deworming",
    date: "2026-06-09",
    session: "Evening",
    notes: "Checking ideal body weight index. Needs seasonal deworming prescription tablets.",
    fee: 800,
    ticketNo: "PVZ-993821",
    createdAt: "2026-06-08",
    status: "Completed"
  }
];

export default function App() {
  // Navigation & Scroll states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Filter States
  const [activeServiceTab, setActiveServiceTab] = useState<'all' | 'clinical' | 'care' | 'products'>('all');
  const [activeCareAnimal, setActiveCareAnimal] = useState<'dog' | 'cat' | 'livestock' | 'bird'>('dog');
  const [activeFaqCategory, setActiveFaqCategory] = useState<'All' | 'General' | 'Pets' | 'Livestock'>('All');
  const [faqSearch, setFaqSearch] = useState('');

  // Routing View State: 'user' | 'admin-login' | 'admin-dashboard'
  const [currentView, setCurrentView] = useState<'user' | 'admin-login' | 'admin-dashboard'>('user');

  // Booking Modal States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);
  
  // Local Booking Form States (including CRM inputs)
  const [bookingStep, setBookingStep] = useState(1);
  const [ownerName, setOwnerName] = useState('');
  const [ownerAddress, setOwnerAddress] = useState(''); // CRM data field
  const [phone, setPhone] = useState('');
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState(''); // CRM data field
  const [petAge, setPetAge] = useState('');     // CRM data field
  const [animalType, setAnimalType] = useState('Dog');
  const [selectedServiceId, setSelectedServiceId] = useState(SERVICES[0].id);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentSession, setAppointmentSession] = useState<'Morning' | 'Afternoon' | 'Evening'>('Morning');
  const [bookingNotes, setBookingNotes] = useState('');

  // Persisted bookings list
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [generatedTicket, setGeneratedTicket] = useState<Appointment | null>(null);

  // Dynamic Service Prices loaded from and synced to LocalStorage
  const [servicePrices, setServicePrices] = useState<Record<string, number>>(() => {
    const stored = localStorage.getItem('petvet_service_prices');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (err) {
        console.error("Failed to parse prices", err);
      }
    }
    return {
      s1: 1200, // Consultation
      s2: 1500, // Vaccination
      s3: 800,  // Deworming
      s4: 1400, // Treatment
      s5: 4500, // Surgeries
      s6: 1000, // Nutritional Consultation
      s7: 500   // Pet Food & Accessories
    };
  });

  // Admin Auth states
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('petvet_admin_logged_in') === 'true';
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState<'appointments' | 'crm' | 'pricing'>('appointments');
  const [adminSearchTerm, setAdminSearchTerm] = useState('');

  // Sync scroll positioning
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle hash-based custom routing for Admin Views
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin/login') {
        const loggedIn = localStorage.getItem('petvet_admin_logged_in') === 'true';
        if (loggedIn) {
          setCurrentView('admin-dashboard');
          window.location.hash = '#admin/dashboard';
        } else {
          setCurrentView('admin-login');
        }
      } else if (hash === '#admin/dashboard') {
        const loggedIn = localStorage.getItem('petvet_admin_logged_in') === 'true';
        if (loggedIn) {
          setCurrentView('admin-dashboard');
        } else {
          setCurrentView('admin-login');
          window.location.hash = '#admin/login';
        }
      } else {
        setCurrentView('user');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Retrieve saved clinic appointments from local storage
  useEffect(() => {
    const stored = localStorage.getItem('petvet_bookings');
    if (stored) {
      try {
        setAppointments(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to parse appointments", err);
      }
    } else {
      // Seed with beautiful predefined clinical entries
      setAppointments(DEFAULT_BOOKINGS);
      localStorage.setItem('petvet_bookings', JSON.stringify(DEFAULT_BOOKINGS));
    }
  }, []);

  // Sync to local storage
  const saveAppointmentsToStorage = (updatedList: Appointment[]) => {
    setAppointments(updatedList);
    localStorage.setItem('petvet_bookings', JSON.stringify(updatedList));
  };

  // Smoothly scroll to an anchor element with offsets to account for the fixed navbar
  const scrollToSection = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    
    // If we're not currently on the main user landing page view, return back to website first
    if (currentView !== 'user') {
      setCurrentView('user');
      window.location.hash = id;
    } else {
      window.history.pushState(null, '', `#${id}`);
    }
    
    // Smooth scroll to the element after giving DOM a moment to settle/render
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = 90; // offset of the fixed top navigation bar 
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, currentView !== 'user' ? 250 : 50);
  };

  // Handle direct modal opening with optional service configuration
  const handleOpenBooking = (service?: Service) => {
    if (service) {
      setPreselectedService(service);
      setSelectedServiceId(service.id);
    } else {
      setPreselectedService(null);
      setSelectedServiceId(SERVICES[0].id);
    }
    setBookingStep(1);
    setIsBookingModalOpen(true);
  };

  // Dynamically calculate clinical fees from active pricing state
  const getServicePrice = (id: string): number => {
    return servicePrices[id] || 1000;
  };

  // Submit Booking implementation with advanced CRM storage fields
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Quick validation
    if (!ownerName.trim() || !phone.trim() || !petName.trim() || !appointmentDate) {
      alert("Please fill in all mandatory fields before submitting.");
      return;
    }

    const matchedService = SERVICES.find(s => s.id === selectedServiceId) || SERVICES[0];
    const targetFee = getServicePrice(selectedServiceId);
    const randomTicket = "PVZ-" + Math.floor(100000 + Math.random() * 900000);

    const newAppointment: Appointment = {
      id: "apt_" + Date.now(),
      ownerName: ownerName.trim(),
      ownerAddress: ownerAddress.trim() || "Address Not Specified",
      phone: phone.trim(),
      petName: petName.trim(),
      petBreed: petBreed.trim() || "Mixed Breed/TBD",
      petAge: petAge.trim() || "Not Specified",
      animalType,
      serviceId: selectedServiceId,
      serviceTitle: matchedService.title,
      date: appointmentDate,
      session: appointmentSession,
      notes: bookingNotes.trim(),
      fee: targetFee,
      ticketNo: randomTicket,
      createdAt: new Date().toLocaleDateString(),
      status: 'Pending'
    };

    const updatedAppts = [newAppointment, ...appointments];
    saveAppointmentsToStorage(updatedAppts);
    setGeneratedTicket(newAppointment);
    setBookingStep(4); // Advance to beautiful receipt phase
  };

  // Delete booked appointments
  const handleDeleteAppointment = (id: string) => {
    if (confirm("Are you sure you want to cancel this booking ticket?")) {
      const updated = appointments.filter(a => a.id !== id);
      saveAppointmentsToStorage(updated);
    }
  };

  // Reset form helper including new crm inputs
  const resetForm = () => {
    setOwnerName('');
    setOwnerAddress('');
    setPhone('');
    setPetName('');
    setPetBreed('');
    setPetAge('');
    setAnimalType('Dog');
    setSelectedServiceId(SERVICES[0].id);
    setAppointmentDate('');
    setAppointmentSession('Morning');
    setBookingNotes('');
    setBookingStep(1);
    setGeneratedTicket(null);
    setIsBookingModalOpen(false);
  };

  // Active Icon Resolver
  const renderIcon = (iconName: string, className = "w-6 h-6") => {
    switch (iconName) {
      case 'Stethoscope': return <Stethoscope className={className} />;
      case 'Syringe': return <Syringe className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'HeartHandshake': return <HeartHandshake className={className} />;
      case 'Award': return <Award className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'Scissors': return <Scissors className={className} />;
      case 'Utensils': return <Utensils className={className} />;
      case 'ShoppingBag': return <ShoppingBag className={className} />;
      case 'Activity': return <Activity className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'Smile': return <Smile className={className} />;
      default: return <Stethoscope className={className} />;
    }
  };

  // Animal Advice Generator
  const getAnimalAdvice = () => {
    switch (activeCareAnimal) {
      case 'dog':
        return {
          title: "Companion Canine Healthcare",
          notes: "Dogs bring unmatched energy to our homes, requiring rigorous vigilance to guard against viral infections.",
          items: [
            { label: "Deworming Cycle", val: "Critical every 3 months for adult dogs, monthly for puppies under 6 months." },
            { label: "Core Vaccination", val: "DHPP vaccine (against Parvovirus, Distemper) plus annual Rabies jabs." },
            { label: "Nutrition Tip", val: "Protein-focused diets with structured portion controls. Strictly avoid toxic chocolate, grapes, and onions." }
          ]
        };
      case 'cat':
        return {
          title: "Feline Wellness & Precision Care",
          notes: "Cats are highly expert at masking discomfort, requiring proactive diagnostic checkups and strict hydration cycles.",
          items: [
            { label: "Vaccination Routine", val: "FVRCP vaccine starts at 8 weeks to prevent cat flu, feline enteritis, and chronic respiratory infections." },
            { label: "Hairball Prevention", val: "Regular weekly brushing, combined with rich functional fiber or clean grass consumption." },
            { label: "Hydration Balance", val: "Ensure access to fresh running water sources. Wet food is highly recommended for kidney stone prevention." }
          ]
        };
      case 'livestock':
        return {
          title: "Livestock & Herd Prosperity",
          notes: "For ruminants like cows, buffaloes, goats, and sheep, veterinary care is paramount to safeguard milk yields and herd survival.",
          items: [
            { label: "Seasonal Immunization", val: "Frequent diagnostic routines for Foot and Mouth Disease (FMD) and hemorrhagic septicemia (HS)." },
            { label: "Rumen Diagnostics", val: "Maintain high dry-matter forage quality, ensuring sufficient cobalt, magnesium, and salt mineral blocks." },
            { label: "Deworming Impact", val: "Biannual deworming corresponding with seasonal crop switches to maximize weight gain and milk density." }
          ]
        };
      case 'bird':
        return {
          title: "Avian & Rabbit Veterinary Checkups",
          notes: "Exotic birds, backyard chickens, and rabbits are highly sensitive to thermal shocks and damp conditions.",
          items: [
            { label: "Rabbit Deworming", val: "Frequent treatment for internal parasites, intestinal coccidiosis, and routine dental filing." },
            { label: "Avian Hygiene", val: "Provide clean breathable ventilation, avoiding chemical aerosols, cookware fumes, and humid drafts." },
            { label: "Diet Formulation", val: "Fiber-rich Timothy hay for rabbits; calcium and vitamin supplements for egg-laying and feather growth." }
          ]
        };
    }
  };

  // FAQ Filtering
  const filteredFaqs = FAQS.filter(item => {
    const matchesCategory = activeFaqCategory === 'All' || item.category === activeFaqCategory;
    const matchesSearch = item.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
                          item.answer.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    if (expandedFaqId === id) {
      setExpandedFaqId(null);
    } else {
      setExpandedFaqId(id);
    }
  };

  // Filter service items
  const filteredServices = SERVICES.filter(s => {
    if (activeServiceTab === 'all') return true;
    return s.category === activeServiceTab;
  });

  // =========================================================================
  // 1. SECURE ADMIN LOGIN SCREEN VIEW DESIGN
  // =========================================================================
  if (currentView === 'admin-login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070F19] text-white p-4 font-sans selection:bg-[#9b1b30] selection:text-white">
        {/* Abstract design elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#9b1b30]"></div>
        
        <div className="w-full max-w-md bg-[#001733]/40 border border-white/10 p-8 space-y-6 shadow-2xl relative backdrop-blur-md">
          {/* Back button */}
          <div className="flex justify-between items-center pb-2">
            <a 
              href="#" 
              className="group flex items-center space-x-1.5 text-[9px] uppercase tracking-widest font-bold text-slate-400 hover:text-white transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#9b1b30] group-hover:scale-110 transition-transform" />
              <span>← Go to Website</span>
            </a>
            <span className="text-[8px] font-mono uppercase text-slate-500 bg-white/5 py-0.5 px-2">
              Staff Pass Portal
            </span>
          </div>

          {/* Title Branding */}
          <div className="text-center space-y-3 pt-2">
            <div className="inline-block bg-[#9b1b30] p-3 text-white border border-white/10 mx-auto shadow-lg">
              <Lock className="w-5 h-5 stroke-[2] animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-normal tracking-wider font-serif uppercase text-white block">
                Pet & Vet <span className="italic font-medium text-[#9b1b30]">Secure Portal</span>
              </h2>
              <div className="h-0.5 w-8 bg-[#9b1b30] mx-auto my-2"></div>
              <p className="text-[10px] text-slate-400 max-w-xs mx-auto font-light leading-relaxed">
                Registered RVMP & DVM Staff Authorization Gateway. Unauthorized accessing is strictly logged.
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              // Safely pull from environment variables with safe fallback credentials if unset
              const reqEmail = (((import.meta as any).env?.VITE_ADMIN_EMAIL) || "bhindersamejutt@gmail.com").trim().toLowerCase();
              const reqPass = (((import.meta as any).env?.VITE_ADMIN_PASSWORD) || "DrLaibaTariq928!").trim();

              if (loginEmail.trim().toLowerCase() === reqEmail && loginPassword.trim() === reqPass) {
                localStorage.setItem('petvet_admin_logged_in', 'true');
                setIsAdminLoggedIn(true);
                setLoginError('');
                window.location.hash = '#admin/dashboard';
              } else {
                setLoginError('Authorization Rejected: Incorrect Email or Security Password.');
              }
            }} 
            className="space-y-4"
          >
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block font-display">
                Authorized Email ID
              </label>
              <input 
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="staff-email@clinic.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 focus:outline-none focus:border-[#9b1b30] text-xs text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-slate-400 block font-display">
                Workstation Password
              </label>
              <input 
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="🔑 Security Key"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 focus:outline-none focus:border-[#9b1b30] text-xs text-white placeholder:text-slate-600"
              />
            </div>

            {loginError && (
              <p className="text-[#9b1b30] text-[10px] uppercase tracking-wider font-bold text-center bg-white/5 py-2 border-l-2 border-[#9b1b30]">
                ✕ {loginError}
              </p>
            )}

            <button 
              type="submit"
              className="w-full bg-[#9b1b30] hover:bg-red-800 text-white font-bold tracking-widest uppercase py-3 text-[10px] font-display border border-[#9b1b30] transition duration-200 mt-2"
            >
              Verify Credentials & Unlock Panel
            </button>
          </form>
          
          <div className="text-center pt-2">
            <p className="text-[9px] text-slate-500 font-mono">
              &copy; {new Date().getFullYear()} Pet & Vet Zone. Authorized Clinic Workstation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. SECURE ADMIN PANEL DASHBOARD WORKSPACE DESIGN
  // =========================================================================
  if (currentView === 'admin-dashboard') {
    // Rigid Security Guard Check
    if (!isAdminLoggedIn) {
      window.location.hash = '#admin/login';
      return null;
    }

    // Interactive Admin Calculations & Metrics Indicators
    const totalAppointments = appointments.length;
    const pendingApptsCount = appointments.filter(a => a.status === 'Pending').length;
    const checkedInCount = appointments.filter(a => a.status === 'Checked-In').length;
    const completedCount = appointments.filter(a => a.status === 'Completed').length;
    
    // SUM Revenue dynamically based on booked fees (supports real-time price updates)
    const estimatedRevenue = appointments.reduce((sum, a) => sum + parseFloat(a.fee.toString()), 0);

    // Apply filters to dashboard tracking table data (search by Owner Name, Pet Name, Phone, Ticket Number)
    const filteredAppointments = appointments.filter(appt => {
      const query = adminSearchTerm.toLowerCase().trim();
      if (!query) return true;
      return (
        appt.ownerName.toLowerCase().includes(query) ||
        appt.petName.toLowerCase().includes(query) ||
        appt.phone.includes(query) ||
        appt.ticketNo.toLowerCase().includes(query) ||
        (appt.petBreed && appt.petBreed.toLowerCase().includes(query)) ||
        appt.animalType.toLowerCase().includes(query) ||
        appt.serviceTitle.toLowerCase().includes(query)
      );
    });

    const handleLogout = () => {
      if (confirm("Disconnect clinic workstation and log out?")) {
        localStorage.removeItem('petvet_admin_logged_in');
        setIsAdminLoggedIn(false);
        window.location.hash = '#admin/login';
      }
    };

    const updateBookingStatus = (id: string, nextStatus: 'Pending' | 'Checked-In' | 'Completed') => {
      const updated = appointments.map(a => {
        if (a.id === id) {
          return { ...a, status: nextStatus };
        }
        return a;
      });
      saveAppointmentsToStorage(updated);
    };

    const saveDynamicPrices = () => {
      localStorage.setItem('petvet_service_prices', JSON.stringify(servicePrices));
      // Re-trigger pricing update to booking form
      setServicePrices({ ...servicePrices });
      alert("Success: Dynamic service prices have been saved and applied across the clinic registration form.");
    };

    return (
      <div className="min-h-screen bg-[#F3F4F6] text-[#1A1A1A] font-sans flex flex-col md:flex-row selection:bg-[#9b1b30] selection:text-white">
        
        {/* A. STUNNING SIDE NAVIGATION PANEL (DARK WORKSPACE CLOUD) */}
        <aside className="w-full md:w-64 bg-primary-navy text-white flex flex-col justify-between p-6 shrink-0 border-r border-[#001733]/20 md:min-h-screen">
          <div className="space-y-8">
            {/* Logo */}
            <div>
              <div className="flex items-center space-x-3">
                <div className="bg-[#9b1b30] p-2 text-white border border-white/10">
                  <Unlock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-bold uppercase tracking-widest block text-white font-display">
                    PVZ Workstation
                  </span>
                  <p className="text-[9px] tracking-wider text-crimson-300 uppercase font-bold font-mono">
                    Dr. Laiba's Admin
                  </p>
                </div>
              </div>
              <div className="h-px bg-white/10 mt-4"></div>
            </div>

            {/* Menu Links */}
            <nav className="space-y-2">
              <span className="text-[8.5px] uppercase tracking-widest font-bold text-slate-400 block pb-1 font-display">
                Clinic Systems Control
              </span>
              
              <button
                onClick={() => { setActiveAdminTab('appointments'); setAdminSearchTerm(''); }}
                className={`w-full flex items-center justify-between py-2.5 px-4 text-xs font-bold uppercase tracking-wider transition rounded-none ${activeAdminTab === 'appointments' ? 'bg-[#9b1b30] text-white border-l-2 border-white' : 'text-slate-350 hover:bg-white/5 hover:text-white'}`}
              >
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4" />
                  <span>Clinic Tracker</span>
                </div>
                {pendingApptsCount > 0 && (
                  <span className="bg-yellow-400 text-[#001733] font-mono text-[9px] px-1.5 py-0.5 rounded-none font-extrabold">
                    {pendingApptsCount} NEW
                  </span>
                )}
              </button>

              <button
                onClick={() => { setActiveAdminTab('crm'); setAdminSearchTerm(''); }}
                className={`w-full flex items-center py-2.5 px-4 text-xs font-bold uppercase tracking-wider transition rounded-none ${activeAdminTab === 'crm' ? 'bg-[#9b1b30] text-white border-l-2 border-white' : 'text-slate-350 hover:bg-white/5 hover:text-white'}`}
              >
                <Users className="w-4 h-4 mr-3" />
                <span>Pet Owner CRM ({totalAppointments})</span>
              </button>

              <button
                onClick={() => { setActiveAdminTab('pricing'); setAdminSearchTerm(''); }}
                className={`w-full flex items-center py-2.5 px-4 text-xs font-bold uppercase tracking-wider transition rounded-none ${activeAdminTab === 'pricing' ? 'bg-[#9b1b30] text-white border-l-2 border-white' : 'text-slate-350 hover:bg-white/5 hover:text-white'}`}
              >
                <Coins className="w-4 h-4 mr-3" />
                <span>Global Price Config</span>
              </button>
            </nav>
          </div>

          {/* Sidebar Footer Operations */}
          <div className="space-y-3 pt-8 md:pt-0 border-t border-white/10 md:border-t-0">
            <div className="h-px bg-white/10 my-4 hidden md:block"></div>
            
            <a 
              href="#" 
              className="flex items-center py-2 px-3 text-[10px] text-slate-350 hover:text-white font-bold uppercase tracking-wider transition rounded-none bg-white/5 border border-white/15"
            >
              <Globe className="w-3.5 h-3.5 text-crimson-300 mr-2.5" />
              <span>Back to Website</span>
            </a>

            <button
              onClick={handleLogout}
              className="w-full flex items-center py-2 px-3 text-[10px] text-red-300 hover:bg-[#9b1b30] hover:text-white font-bold uppercase tracking-wider transition rounded-none border border-red-500/20 bg-red-500/5"
            >
              <LogOut className="w-3.5 h-3.5 mr-2.5" />
              <span>Secure Logout</span>
            </button>
          </div>
        </aside>

        {/* B. MAIN INTERACTIVE WORKSPACE VIEWPORT */}
        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-h-screen">
          
          {/* Header Status Bar component */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-serif text-primary-navy font-normal">
                Dr. Laiba's <span className="italic font-medium text-[#9b1b30]">Medical Registry</span>
              </h1>
              <p className="text-[10px] uppercase tracking-widest font-mono text-slate-450 mt-1">
                Active Staff workstation: Registered RVMP Clinical Terminal
              </p>
            </div>
            
            <div className="bg-white border border-slate-250 py-2 px-4 shadow-sm text-right">
              <span className="text-[8px] uppercase tracking-widest text-slate-400 block font-bold font-mono">Current Station Time</span>
              <span className="text-[11px] font-bold font-mono text-primary-navy tracking-wider uppercase">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* CLOUD METRICS INDICATORS BENTO GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="bg-white border border-slate-200 p-4 shadow-sm">
              <span className="text-[8.5px] uppercase tracking-widest text-slate-400 block font-bold">Total Appointments</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold font-mono text-[#001733]">{totalAppointments}</span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 font-bold border border-slate-200">Tickets</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[8.5px] uppercase tracking-widest text-yellow-650 block font-bold">Awaiting (Pending)</span>
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold font-mono text-yellow-600">{pendingApptsCount}</span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-yellow-50 text-yellow-700 font-bold border border-yellow-205">Visits</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[8.5px] uppercase tracking-widest text-blue-650 block font-bold">Checked-In</span>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold font-mono text-blue-600">{checkedInCount}</span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-blue-50 text-blue-700 font-bold border border-blue-205">Ward</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 shadow-sm">
              <span className="text-[8.5px] uppercase tracking-widest text-green-650 block font-bold">Completed Care</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-2xl font-bold font-mono text-green-600">{completedCount}</span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-green-50 text-green-700 font-bold border border-green-205">Done</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 shadow-sm col-span-2 lg:col-span-1 border-r-4 border-r-[#9b1b30]">
              <span className="text-[8.5px] uppercase tracking-widest text-[#9b1b30] block font-bold">Estimated Revenue</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold font-mono text-primary-navy tracking-tight">{estimatedRevenue.toLocaleString()}</span>
                <span className="text-[8px] uppercase font-mono text-[#9b1b30] font-bold">PKR</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB A: APPOINTMENTS & CHECK-IN TRACKER PANEL */}
          {/* ========================================================================= */}
          {activeAdminTab === 'appointments' && (
            <div className="bg-white border border-slate-200 p-5 shadow-sm space-y-4">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-primary-navy font-display">
                    Clinical Consultation Tracker Log
                  </h3>
                  <p className="text-[10px] text-slate-400 font-light">
                    Real-time patients list checking. Doctors can modify booking phases instant status.
                  </p>
                </div>

                {/* Filter Search */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by ticket, owner, pet type..."
                    value={adminSearchTerm}
                    onChange={(e) => setFaqSearch(e.target.value)} // Bind search term
                    onInput={(e) => setAdminSearchTerm((e.target as HTMLInputElement).value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-[#F9FAFB] border border-slate-200 focus:outline-none focus:border-[#9b1b30] text-xs"
                  />
                  {adminSearchTerm && (
                    <button onClick={() => setAdminSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-wider font-mono font-bold text-[#9b1b30]">
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto border border-slate-250">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-slate-250 text-[9.5px] font-bold uppercase tracking-wider text-slate-500 font-display">
                      <th className="py-3 px-4">Ticket No</th>
                      <th className="py-3 px-4">Date / Session</th>
                      <th className="py-3 px-4">Pet Owner</th>
                      <th className="py-3 px-4">Patient (Type/Breed)</th>
                      <th className="py-3 px-4">Treatment Service</th>
                      <th className="py-3 px-4">Status & Action Pillars</th>
                      <th className="py-3 px-4 text-right">Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((appt) => {
                        // color status pill
                        let statusStyle = "bg-yellow-50 text-yellow-700 border-yellow-250";
                        if (appt.status === 'Checked-In') statusStyle = "bg-blue-50 text-blue-700 border-blue-250";
                        if (appt.status === 'Completed') statusStyle = "bg-green-50 text-green-700 border-green-250";

                        return (
                          <tr key={appt.id} className="hover:bg-[#F9FAFB] transition-colors leading-relaxed">
                            <td className="py-3 px-4 font-mono font-bold text-slate-500 uppercase tracking-widest text-[10px]">
                              {appt.ticketNo}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-mono text-[9.5px] font-semibold text-slate-900">{appt.date}</div>
                              <span className="text-[8px] uppercase tracking-widest font-bold px-1 py-0.5 bg-slate-100 text-slate-500">
                                {appt.session}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-primary-navy">{appt.ownerName}</div>
                              <a href={`tel:${appt.phone}`} className="text-[10px] text-slate-500 hover:underline hover:text-[#9b1b30] font-mono block">
                                {appt.phone}
                              </a>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-[#001733]">{appt.petName}</div>
                              <div className="text-[9.5px] text-slate-450 flex items-center space-x-1 uppercase tracking-wider">
                                <span className="font-semibold text-slate-600">{appt.animalType}</span>
                                <span>•</span>
                                <span className="truncate max-w-32">{appt.petBreed || "Mixed"}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-medium text-slate-800">
                              {appt.serviceTitle}
                            </td>
                            <td className="py-3 px-4 space-y-2">
                              {/* Status Display badge */}
                              <span className={`inline-block text-[9px] uppercase tracking-wider font-mono font-extrabold border py-0.5 px-2 rounded-none ${statusStyle}`}>
                                {appt.status}
                              </span>
                              
                              {/* Quick Action Pillars */}
                              <div className="flex items-center space-x-1">
                                {appt.status === 'Pending' && (
                                  <button
                                    onClick={() => updateBookingStatus(appt.id, 'Checked-In')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-1 transition rounded-none font-display"
                                  >
                                    Check In
                                  </button>
                                )}
                                {appt.status === 'Checked-In' && (
                                  <button
                                    onClick={() => updateBookingStatus(appt.id, 'Completed')}
                                    className="bg-green-600 hover:bg-green-700 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-1 transition rounded-none font-display"
                                  >
                                    Complete Care
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteAppointment(appt.id)}
                                  className="text-red-400 hover:text-red-600 hover:bg-slate-100 p-1.5 transition"
                                  title="Cancel Appointment Entry"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                              {appt.fee} PKR
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                          No registered clinic tickets matching configuration search filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Instructions */}
              <div className="bg-slate-50 p-4 border border-dashed border-slate-250 text-[10px] text-slate-500 rounded-none leading-relaxed">
                📢 <strong>RVMP Clinical Guide:</strong> Updating status to "Checked-In" moves the animal into the active triage ward list. Marking "Completed Care" completes clinical logs bookkeeping.
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB B: PET OWNER CONFIDENTIAL CRM VIEW */}
          {/* ========================================================================= */}
          {activeAdminTab === 'crm' && (
            <div className="bg-white border border-slate-200 p-5 shadow-sm space-y-5">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-primary-navy font-display">
                    Confidential Pet Owner CRM Records Directory
                  </h3>
                  <p className="text-[10px] text-slate-400 font-light">
                    Protected database of client contacts, addresses, animal medical histories, and triage reports.
                  </p>
                </div>

                {/* Filter Search */}
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter owner dossiers by name/address..."
                    value={adminSearchTerm}
                    onInput={(e) => setAdminSearchTerm((e.target as HTMLInputElement).value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-[#F9FAFB] border border-slate-200 focus:outline-none focus:border-[#9b1b30] text-xs"
                  />
                  {adminSearchTerm && (
                    <button onClick={() => setAdminSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] uppercase tracking-wider font-mono font-bold text-[#9b1b30]">
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Dossier Card Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appt) => (
                    <div 
                      key={appt.id}
                      className="border border-slate-250 bg-[#F9FAFB] p-5 shadow-sm space-y-4 relative border-l-4 border-l-primary-navy hover:shadow-md transition"
                    >
                      {/* Ticket badge */}
                      <span className="absolute top-4 right-4 bg-primary-navy text-white text-[8px] font-mono py-0.5 px-2 font-bold uppercase tracking-wider">
                        {appt.ticketNo}
                      </span>
                      
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase tracking-widest text-[#9b1b30] font-bold block">Owner Dossier Profile</span>
                        <h4 className="text-sm font-bold text-primary-navy uppercase font-display leading-tight">{appt.ownerName}</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[11px] border-t border-slate-200">
                        <div className="space-y-0.5">
                          <span className="text-[8px] uppercase tracking-widest text-slate-400 block font-bold">Contact Phone</span>
                          <a href={`tel:${appt.phone}`} className="font-mono text-slate-800 hover:underline hover:text-[#9b1b30] font-semibold">{appt.phone}</a>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[8px] uppercase tracking-widest text-slate-400 block font-bold">Clinical Category</span>
                          <span className="font-semibold text-slate-700 uppercase tracking-wide text-[9.5px] font-mono">{appt.animalType}</span>
                        </div>
                        <div className="space-y-0.5 sm:col-span-2">
                          <span className="text-[8px] uppercase tracking-widest text-slate-400 block font-bold">Confidential Physical Address</span>
                          <span className="text-slate-650 font-light">{appt.ownerAddress || "Islamabad / Dunyapur District"}</span>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 p-3 pt-2 space-y-2.5">
                        <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                          <div>
                            <span className="text-[7.5px] uppercase tracking-widest text-slate-400 block font-bold">Patient Pet Breed</span>
                            <span className="font-bold text-[#001733]">{appt.petBreed || "Mixed TBD"}</span>
                          </div>
                          <div>
                            <span className="text-[7.5px] uppercase tracking-widest text-slate-400 block font-bold">Patient Animal Age</span>
                            <span className="font-bold text-[#001733]">{appt.petAge || "TBD"}</span>
                          </div>
                        </div>

                        <div className="h-px bg-slate-100 my-1"></div>

                        <div className="text-[11px]">
                          <span className="text-[7.5px] uppercase tracking-widest text-[#9b1b30] block font-bold">Reported Symptoms & Notes</span>
                          <p className="text-slate-600 font-light leading-relaxed italic pt-0.5">
                            "{appt.notes || "No custom symptoms formulated during online check-in. Clean vital signs check requested."}"
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 font-mono">
                        <span>Submitted: {appt.createdAt}</span>
                        <span className="bg-[#9b1b30]/10 text-[#9b1b30] font-bold px-2 py-0.5 uppercase text-[8px]">{appt.status}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 border border-slate-200 col-span-2 text-slate-400 text-xs">
                    No clinical CRM records matching filters found.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB C: DYNAMIC SERVICE & PRICE CONFIGURATION PANEL */}
          {/* ========================================================================= */}
          {activeAdminTab === 'pricing' && (
            <div className="bg-white border border-slate-200 p-5 shadow-sm space-y-5">
              
              <div className="space-y-1">
                <h3 className="text-xs uppercase tracking-widest font-bold text-primary-navy font-display">
                  Global Service Pricing & Medical Console Configuration
                </h3>
                <p className="text-[10px] text-slate-400 font-light">
                  Directly adjust standard veterinary consultation, vaccinations, surgeries, and accessories pricing. Updates take impact immediately in registration passport fees calculations.
                </p>
              </div>

              {/* Services Dynamic Edit Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SERVICES.map((serv) => (
                  <div 
                    key={serv.id}
                    className="border border-slate-200 bg-[#F9FAFB] p-4.5 shadow-sm space-y-3.5 relative flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2.5">
                        <div className="bg-primary-navy/5 p-2 text-primary-navy">
                          {renderIcon(serv.iconName, "w-4 h-4")}
                        </div>
                        <div>
                          <span className="text-[8px] uppercase tracking-widest text-[#9b1b30] font-mono font-bold">
                            Service ID: {serv.id}
                          </span>
                          <h4 className="text-xs font-bold text-primary-navy uppercase font-display leading-tight">
                            {serv.title}
                          </h4>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-450 leading-relaxed font-light line-clamp-2">
                        {serv.description}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-slate-450 block font-mono">
                        Configured Price (PKR)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold text-slate-400">
                          PKR
                        </span>
                        <input
                          type="number"
                          value={servicePrices[serv.id] || ''}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setServicePrices({
                              ...servicePrices,
                              [serv.id]: val
                            });
                          }}
                          className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 focus:outline-none focus:border-[#9b1b30] text-xs font-bold font-mono text-[#001733]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Update Actions */}
              <div className="pt-4 border-t border-slate-250 flex items-center justify-between">
                <p className="text-[10.5px] text-slate-500 font-light">
                  🐾 Pricing updates operate with standard local cloud state cache boundaries.
                </p>
                <button
                  type="button"
                  onClick={saveDynamicPrices}
                  className="bg-[#9b1b30] hover:bg-crimson-800 text-white font-bold uppercase tracking-widest py-3 px-8 text-[10px] font-display border border-[#9b1b30] transition duration-200 shadow-sm"
                >
                  Commit Pricing Config
                </button>
              </div>

            </div>
          )}

        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1A1A1A] font-sans selection:bg-crimson-800 selection:text-white">
      
      {/* 1. Header & Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-white text-slate-800 ${scrolled ? 'py-3 shadow-md border-b border-slate-100/90' : 'py-5 border-b border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo */}
            <a href="#" className="flex items-center space-x-2.5 group">
              <div className="bg-[#9b1b30] text-white p-1.5 font-display font-black text-[11px] tracking-wider">
                PVZ
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-900 font-display">
                Pet & Vet <span className="text-[#9b1b30] italic font-serif lowercase tracking-normal font-medium">Zone</span>
              </span>
            </a>

            {/* Desktop Navbar Links */}
            <nav className="hidden md:flex items-center space-x-8 lg:space-x-12 text-[10.5px] font-semibold tracking-[0.18em] uppercase text-slate-650">
              <a href="#hero" onClick={(e) => scrollToSection(e, 'hero')} className="text-slate-800 hover:text-[#9b1b30] transition-colors duration-200">Home</a>
              <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="text-slate-800 hover:text-[#9b1b30] transition-colors duration-200">Our Services</a>
              <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="text-slate-800 hover:text-[#9b1b30] transition-colors duration-200">About Dr. Laiba</a>
              <a href="#values" onClick={(e) => scrollToSection(e, 'values')} className="text-slate-800 hover:text-[#9b1b30] transition-colors duration-200">Clinic Highlights</a>
              <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')} className="text-slate-800 hover:text-[#9b1b30] transition-colors duration-200">Contact Us</a>
            </nav>

            {/* Admin Portal & Action Button */}
            <div className="hidden lg:flex items-center space-x-6">
              <a 
                href="#admin/login" 
                className="text-[10px] uppercase tracking-[0.15em] font-semibold text-slate-500 hover:text-[#9b1b30] transition-colors flex items-center space-x-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Staff Portal</span>
              </a>
              <button 
                onClick={() => handleOpenBooking()}
                className="border border-slate-900 text-slate-900 hover:bg-[#9b1b30] hover:text-white hover:border-[#9b1b30] text-[10px] font-bold tracking-[0.15em] uppercase py-2 px-5 transition-all duration-300"
              >
                Book Appointment
              </button>
            </div>

            {/* Mobile Toggle Button */}
            <div className="md:hidden flex items-center space-x-3">
              <button
                onClick={() => handleOpenBooking()}
                className="bg-[#9b1b30] hover:bg-crimson-700 text-white p-2 text-xs font-bold flex items-center justify-center shadow transition-all duration-200"
              >
                <Calendar className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-800 hover:text-[#9b1b30] transition-colors p-1.5 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Flyout Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-100 mt-0 shadow-lg overflow-hidden"
            >
              <div className="px-4 pt-4 pb-6 space-y-2 bg-white">
                <a 
                  href="#hero" 
                  onClick={(e) => scrollToSection(e, 'hero')}
                  className="block px-3 py-2.5 hover:bg-slate-50 text-slate-800 hover:text-[#9b1b30] text-xs font-semibold transition-colors uppercase tracking-wider"
                >
                  Home
                </a>
                <a 
                  href="#services" 
                  onClick={(e) => scrollToSection(e, 'services')}
                  className="block px-3 py-2.5 hover:bg-slate-50 text-slate-800 hover:text-[#9b1b30] text-xs font-semibold transition-colors uppercase tracking-wider"
                >
                  Our Services
                </a>
                <a 
                  href="#about" 
                  onClick={(e) => scrollToSection(e, 'about')}
                  className="block px-3 py-2.5 hover:bg-slate-50 text-slate-800 hover:text-[#9b1b30] text-xs font-semibold transition-colors uppercase tracking-wider"
                >
                  About Dr. Laiba
                </a>
                <a 
                  href="#values" 
                  onClick={(e) => scrollToSection(e, 'values')}
                  className="block px-3 py-2.5 hover:bg-slate-50 text-slate-800 hover:text-[#9b1b30] text-[11px] font-semibold transition-colors uppercase tracking-wider"
                >
                  Clinic Highlights
                </a>
                <a 
                  href="#contact" 
                  onClick={(e) => scrollToSection(e, 'contact')}
                  className="block px-3 py-2.5 hover:bg-slate-50 text-slate-800 hover:text-[#9b1b30] text-xs font-semibold transition-colors uppercase tracking-wider"
                >
                  Contact Us
                </a>
                <a 
                  href="#admin/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2.5 hover:bg-slate-50 text-red-600 hover:text-red-800 text-xs font-bold transition-colors uppercase tracking-wider border-t border-slate-100 mt-1 flex items-center space-x-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Staff Workstation</span>
                </a>
                
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center space-x-3 px-3 py-1">
                    <Phone className="w-4 h-4 text-[#9b1b30]" />
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Call Dr. Laiba</p>
                      <a href={`tel:${CLINIC_INFO.contact.phone}`} className="text-slate-800 hover:text-[#9b1b30] text-xs font-bold font-mono">{CLINIC_INFO.contact.phoneDisplay}</a>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleOpenBooking();
                    }}
                    className="w-full bg-[#9b1b30] text-white hover:bg-crimson-700 font-bold py-3 px-5 transition text-xs uppercase tracking-widest"
                  >
                    Book Consultation Now
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* 2. Hero Section */}
      <section id="hero" className="relative bg-[#2ba5e0] text-white pt-24 pb-0 overflow-hidden min-h-[80vh] md:min-h-[85vh] lg:min-h-[90vh] flex flex-col justify-end">
        
        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 w-full h-full flex flex-col justify-end">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
            
            {/* Left Column (Hero copy) */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 md:space-y-8 pb-12 md:pb-20 lg:pb-24 pt-8 text-left">
              
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight leading-[0.98] text-white uppercase select-none">
                A Loving Hand,<br />
                A Healthy Life!
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-white/95 font-light max-w-xl leading-relaxed tracking-wide">
                Compassionate Care for Every Creature. Every Animal Deserves Love, Care & Respect.
              </p>

              {/* Tagline buttons block */}
              <div className="flex flex-wrap items-center gap-4 pt-1 sm:pt-3">
                <button 
                  onClick={() => handleOpenBooking()}
                  className="bg-white hover:bg-slate-50 text-[#2ba5e0] hover:text-[#218ec3] font-bold py-3.5 px-8 tracking-widest uppercase active:translate-y-px transition-all duration-200 text-xs shadow-md border border-white"
                >
                  Book Consultation
                </button>
                <a 
                  href="#services"
                  onClick={(e) => scrollToSection(e, 'services')}
                  className="bg-transparent hover:bg-white/10 text-white font-bold py-3.5 px-8 border border-white/30 tracking-widest uppercase transition-all duration-200 text-xs font-display text-center"
                >
                  Explore Services
                </a>
              </div>

              {/* Premium Quality Indicators */}
              <div className="pt-6 grid grid-cols-3 gap-6 border-t border-white/20 max-w-md">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-display">100%</h3>
                  <p className="text-[9px] tracking-widest uppercase text-white/80 font-bold">Sterility & Safety</p>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-display">Islamabad</h3>
                  <p className="text-[9px] tracking-widest uppercase text-white/80 font-bold">/ Dunyapur Base</p>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-display">Certified</h3>
                  <p className="text-[9px] tracking-widest uppercase text-white/80 font-bold">DVM & RVMP Doc</p>
                </div>
              </div>

            </div>

            {/* Right Column (Hero portrait of French Bulldog) */}
            <div className="lg:col-span-5 h-full flex items-end justify-center lg:justify-end overflow-hidden relative">
              <img 
                src="/src/assets/images/french_bulldog_hero_1780988814790.png" 
                alt="Happy French Bulldog wearing a cozy yellow sweater" 
                className="w-full max-w-sm sm:max-w-md lg:max-w-full h-auto object-cover object-bottom translate-y-2 lg:translate-y-6 select-none scale-102 duration-500 hover:scale-[105%]"
                referrerPolicy="no-referrer"
              />
            </div>

          </div>
        </div>

      </section>

      {/* 3. Core Values (4 Columns) */}
      <section id="values" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-bold tracking-widest text-[#9b1b30] uppercase font-display block">
              Our Professional Pillars
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-primary-navy font-serif">
              Core Veterinary <span className="italic font-medium text-[#9b1b30]">Philosophy</span>
            </h2>
            <div className="h-0.5 w-12 bg-[#9b1b30] mx-auto my-3"></div>
            <p className="text-slate-500 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
              At Pet & Vet Zone, we treat animals not just as clinical cases, but as respected creatures that deserve the highest quality medical empathy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CORE_VALUES.map((value, idx) => (
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                key={value.id}
                className="bg-white rounded-none p-6 border border-slate-200 transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  
                  {/* Values Icon Shield */}
                  <div className="inline-flex p-3 bg-[#F9FAFB] rounded-none text-[#9b1b30] border border-slate-200">
                    {renderIcon(value.iconName, "w-5 h-5 stroke-[1.5]")}
                  </div>

                  <div className="space-y-2">
                    <div className="block">
                      <span className="text-sm font-serif italic text-[#9b1b30] block mb-1">0{idx + 1}.</span>
                      <h3 className="font-bold text-primary-navy tracking-tight text-base font-display uppercase">
                        {value.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-normal">
                      {value.description}
                    </p>
                  </div>

                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 text-[10px] text-[#002147]/80 font-medium tracking-wide">
                  {value.details}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. About the Doctor Section */}
      <section id="about" className="py-20 bg-[#F9FAFB] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Col - Portraited Avatar with floating stats inside a beautiful frame */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                
                {/* Visual rings/frames of depth */}
                <div className="absolute -top-3 -left-3 bottom-3 right-3 border-2 border-[#9b1b30]/25 z-0"></div>
                <div className="absolute top-3 left-3 -bottom-3 -right-3 bg-primary-navy/5 z-0"></div>
                
                {/* Realistic Doctor headshot */}
                <div className="relative z-10 overflow-hidden rounded-none border border-slate-350 bg-white shadow-md aspect-square">
                  <img 
                    src={CLINIC_INFO.doctor.image} 
                    alt="Dr. Laiba Tariq (DVM, RVMP) - Veterinary Surgeon and Consultant" 
                    className="w-full h-full object-cover grayscale-10 hover:grayscale-0 transition-all duration-350"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Badge overlay indicating Islamabad/Dunyapur operation status */}
                  <div className="absolute top-4 right-4 bg-primary-navy text-white rounded-none p-2 text-[9px] font-bold uppercase tracking-widest border border-white/10 shadow-sm">
                    DVM, RVMP Practitioner
                  </div>
                </div>

                {/* Floating Veterinary Shield */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-none p-4 shadow-md border border-slate-200 flex items-center space-x-3 max-w-[210px] z-20">
                  <div className="bg-[#F9FAFB] text-primary-navy p-2 rounded-none border border-slate-200">
                    <Award className="w-5 h-5 text-[#9b1b30] stroke-[1.5]" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-primary-navy uppercase font-display">Dr. Laiba Tariq</h5>
                    <p className="text-[9px] text-slate-500 font-mono">PVMC-1082 (Regd)</p>
                  </div>
                </div>

                {/* Years experience floating box */}
                <div className="absolute -top-4 -right-4 bg-[#9b1b30] text-white rounded-none p-4 shadow-md border border-[#9b1b30] flex flex-col items-center justify-center max-w-[120px] z-20">
                  <span className="text-2xl font-normal font-serif italic tracking-tight">8+</span>
                  <span className="text-[8px] uppercase tracking-widest text-center font-bold">Years Practice</span>
                </div>

              </div>
            </div>

            {/* Right Col - Doctor descriptive text */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-widest text-accent-crimson uppercase block font-display">
                  Meet the Chief Veterinarian
                </span>
                <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-[#002147] font-serif">
                  {CLINIC_INFO.doctor.name} <span className="text-[#9b1b30] font-serif italic text-2xl">({CLINIC_INFO.doctor.degrees})</span>
                </h2>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  {CLINIC_INFO.doctor.role} — Dunyapur Base / Islamabad
                </p>
                <div className="h-0.5 w-12 bg-accent-crimson mt-2"></div>
              </div>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-light">
                {CLINIC_INFO.doctor.bio}
              </p>

              {/* Credentials list with checks */}
              <div className="space-y-3 bg-white p-5 rounded-none border border-slate-200 shadow-sm">
                <h4 className="text-[10px] font-bold text-primary-navy uppercase tracking-widest font-display">
                  Professional Credentials & Accreditations
                </h4>
                <div className="h-px bg-slate-100 my-2"></div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {CLINIC_INFO.doctor.credentials.map((cred, i) => (
                    <li key={i} className="flex items-start space-x-2.5 text-xs text-slate-600">
                      <div className="border border-slate-200 rounded-none p-0.5 mt-0.5 shrink-0 text-accent-crimson bg-[#F9FAFB]">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </div>
                      <span>{cred}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bio Highlights / Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
                <button 
                  onClick={() => handleOpenBooking()}
                  className="bg-primary-navy text-white hover:bg-navy-900 text-[10px] font-bold tracking-widest uppercase py-3.5 px-6 rounded-none border border-primary-navy transition duration-200 text-center flex items-center justify-center space-x-2 shadow-sm"
                >
                  <Calendar className="w-4 h-4 text-crimson-300" />
                  <span>Schedule doctor visit</span>
                </button>
                <a 
                  href={`tel:${CLINIC_INFO.contact.phone}`}
                  className="border border-slate-350 hover:border-accent-crimson text-primary-navy hover:text-accent-crimson font-bold tracking-widest uppercase py-3.5 px-6 rounded-none transition duration-200 text-[10px] text-center flex items-center justify-center space-x-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {CLINIC_INFO.contact.phoneDisplay}</span>
                </a>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 5. Core Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <span className="text-[10px] font-bold tracking-widest text-[#9b1b30] uppercase block font-display">
              Surgical & Therapeutics Specialties
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-primary-navy font-serif">
              Clinical Quality & <span className="italic font-medium text-[#9b1b30]">Care</span>
            </h2>
            <div className="h-0.5 w-12 bg-[#9b1b30] mx-auto my-3"></div>
            <p className="text-slate-500 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed">
              We maintain full sterile setups and strict pharmaceutical protocols for animal care. Select a service to pre-fill the consultation form instantly!
            </p>
          </div>

          {/* Dynamic Tabs Filters */}
          <div className="flex flex-wrap justify-center items-center gap-2 mb-10">
            <button
              onClick={() => setActiveServiceTab('all')}
              className={`py-2 px-4 rounded-none text-[10px] font-bold tracking-widest uppercase transition-all border ${activeServiceTab === 'all' ? 'bg-primary-navy text-white border-primary-navy' : 'bg-white text-slate-600 border-slate-200 hover:bg-[#F9FAFB]'}`}
            >
              All Services ({SERVICES.length})
            </button>
            <button
              onClick={() => setActiveServiceTab('clinical')}
              className={`py-2 px-4 rounded-none text-[10px] font-bold tracking-widest uppercase transition-all border ${activeServiceTab === 'clinical' ? 'bg-primary-navy text-white border-primary-navy' : 'bg-white text-slate-600 border-slate-200 hover:bg-[#F9FAFB]'}`}
            >
              Clinical Operations
            </button>
            <button
              onClick={() => setActiveServiceTab('care')}
              className={`py-2 px-4 rounded-none text-[10px] font-bold tracking-widest uppercase transition-all border ${activeServiceTab === 'care' ? 'bg-primary-navy text-white border-primary-navy' : 'bg-white text-slate-600 border-slate-200 hover:bg-[#F9FAFB]'}`}
            >
              Therapeutics & Nutrition
            </button>
            <button
              onClick={() => setActiveServiceTab('products')}
              className={`py-2 px-4 rounded-none text-[10px] font-bold tracking-widest uppercase transition-all border ${activeServiceTab === 'products' ? 'bg-primary-navy text-white border-primary-navy' : 'bg-white text-slate-600 border-slate-200 hover:bg-[#F9FAFB]'}`}
            >
              Pet Food & Accessories
            </button>
          </div>

          {/* Grid of services cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map(service => (
              <motion.div
                layout
                key={service.id}
                className="group relative bg-[#F9FAFB] border border-slate-200 rounded-none p-6 transition-all hover:bg-white hover:border-primary-navy flex flex-col justify-between"
              >
                <div className="space-y-4">
                  
                  {/* Icon or badge */}
                  <div className="flex items-start justify-between">
                    <div className="border border-slate-200 p-2.5 rounded-none text-primary-navy bg-white group-hover:bg-[#9b1b30] group-hover:text-white group-hover:border-[#9b1b30] transition-colors duration-300">
                      {renderIcon(service.iconName, "w-5 h-5 stroke-[1.5]")}
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest border border-slate-200 py-0.5 px-2 bg-white">
                      {service.highlight}
                    </span>
                  </div>

                  {/* Copy */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-primary-navy group-hover:text-[#9b1b30] transition-colors text-sm tracking-widest uppercase font-display">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-light">
                      {service.description}
                    </p>
                  </div>

                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    🕒 {service.duration}
                  </span>
                  <button
                    onClick={() => handleOpenBooking(service)}
                    className="text-[10px] font-bold tracking-widest uppercase text-[#9b1b30] hover:text-crimson-850 flex items-center space-x-1 border-b border-transparent hover:border-[#9b1b30] pb-0.5 transition"
                  >
                    <span>Instant Choice</span>
                    <Plus className="w-3 h-3 text-[#9b1b30]" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Service sub-highlights Split Banner with generated media thumbnails */}
          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Banner 1: Companion Pets */}
            <div className="relative overflow-hidden rounded-none border border-white/10 bg-primary-navy p-6 sm:p-8 text-white flex flex-col md:flex-row gap-6 items-center shadow">
              <div className="relative w-full md:w-2/5 aspect-[4/3] rounded-none overflow-hidden shrink-0 bg-slate-900 border border-white/10">
                <img 
                  src={CLINIC_INFO.media.pets} 
                  alt="Companion Pets Healthcare section" 
                  className="w-full h-full object-cover grayscale-10"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-4">
                <span className="text-[9px] text-[#ccd5df] font-bold uppercase tracking-widest block font-display">
                  Companion Animals Section
                </span>
                <h3 className="text-lg font-normal text-white font-serif italic leading-tight">
                  Premium Domestic Companion Care
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  Treating Persian cats, local breeds, high-IQ German Shepherds, companion birds, and toy rabbits. Secure diagnostics, pediatric packages, and soft-tissue surgery.
                </p>
                <button
                  onClick={() => handleOpenBooking()}
                  className="bg-accent-crimson hover:bg-crimson-700 py-2.5 px-4 rounded-none text-[10px] font-bold tracking-widest uppercase text-white transition flex items-center space-x-1.5 border border-accent-crimson"
                >
                  <span>Book companion consult</span>
                  <ArrowRight className="w-3.5 h-3.5 text-crimson-200" />
                </button>
              </div>
            </div>

            {/* Banner 2: Livestock Animals */}
            <div className="relative overflow-hidden rounded-none border border-white/10 bg-[#001733] p-6 sm:p-8 text-white flex flex-col md:flex-row gap-6 items-center shadow">
              <div className="relative w-full md:w-2/5 aspect-[4/3] rounded-none overflow-hidden shrink-0 bg-slate-850 border border-white/10">
                <img 
                  src={CLINIC_INFO.media.livestock} 
                  alt="Livestock veterinary medicine section" 
                  className="w-full h-full object-cover grayscale-10"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-4">
                <span className="text-[9px] text-[#ccd5df] font-bold uppercase tracking-widest block font-display">
                  Livestock & Agriculture Ruminants
                </span>
                <h3 className="text-lg font-normal text-white font-serif italic leading-tight">
                  Cows, Sheep, & Goats Therapeutics
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  Professional consultation for dairy cattle health, foot disease immunization, feed balancing, and lamb wellness deworming in Dunyapur rural sector.
                </p>
                <button
                  onClick={() => handleOpenBooking()}
                  className="bg-[#9b1b30] hover:bg-crimson-750 py-2.5 px-4 rounded-none text-[10px] font-bold tracking-widest uppercase text-white transition flex items-center space-x-1.5 border border-[#9b1b30]"
                >
                  <span>Book livestock visit</span>
                  <ArrowRight className="w-3.5 h-3.5 text-crimson-200" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Interactive Care Assistant section */}
      <section id="expert-care" className="py-20 bg-[#F9FAFB] border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side: Animal Selector Tabs & Details */}
            <div className="lg:col-span-8 space-y-6">
              
              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-widest text-[#9b1b30] uppercase block font-display">
                  Proactive Care Advisory Unit
                </span>
                <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-primary-navy font-serif">
                  Animal Wellness <span className="italic font-medium text-[#9b1b30]">Recommendations</span>
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-light max-w-xl">
                  Select your animal cohort to read structured recommendations compiled directly by Dr. Laiba Tariq to safeguard animal durability.
                </p>
              </div>

              {/* Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-transparent max-w-xl">
                <button
                  onClick={() => setActiveCareAnimal('dog')}
                  className={`py-3 px-3 rounded-none text-[10px] font-bold tracking-widest uppercase transition flex items-center justify-center space-x-1.5 border ${activeCareAnimal === 'dog' ? 'bg-primary-navy text-white border-primary-navy shadow-sm' : 'bg-white text-slate-600 border-slate-250 hover:bg-[#F9FAFB]'}`}
                >
                  <span>Canine (Dogs)</span>
                </button>
                <button
                  onClick={() => setActiveCareAnimal('cat')}
                  className={`py-3 px-3 rounded-none text-[10px] font-bold tracking-widest uppercase transition flex items-center justify-center space-x-1.5 border ${activeCareAnimal === 'cat' ? 'bg-primary-navy text-white border-primary-navy shadow-sm' : 'bg-white text-slate-600 border-slate-250 hover:bg-[#F9FAFB]'}`}
                >
                  <span>Feline (Cats)</span>
                </button>
                <button
                  onClick={() => setActiveCareAnimal('livestock')}
                  className={`py-3 px-3 rounded-none text-[10px] font-bold tracking-widest uppercase transition flex items-center justify-center space-x-1.5 border ${activeCareAnimal === 'livestock' ? 'bg-primary-navy text-white border-primary-navy shadow-sm' : 'bg-white text-slate-600 border-slate-250 hover:bg-[#F9FAFB]'}`}
                >
                  <span>Livestock</span>
                </button>
                <button
                  onClick={() => setActiveCareAnimal('bird')}
                  className={`py-3 px-3 rounded-none text-[10px] font-bold tracking-widest uppercase transition flex items-center justify-center space-x-1.5 border ${activeCareAnimal === 'bird' ? 'bg-primary-navy text-white border-primary-navy shadow-sm' : 'bg-white text-slate-600 border-slate-250 hover:bg-[#F9FAFB]'}`}
                >
                  <span>Birds & Rabbits</span>
                </button>
              </div>

              {/* Active advice card display */}
              <div className="bg-white rounded-none p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center space-x-3 text-primary-navy font-bold text-xs uppercase tracking-widest font-display border-b border-slate-100 pb-3">
                  <Activity className="w-4 h-4 text-[#9b1b30]" />
                  <span>{getAnimalAdvice()?.title}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-light">
                  {getAnimalAdvice()?.notes}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {getAnimalAdvice()?.items.map((item, idx) => (
                    <div key={idx} className="bg-[#F9FAFB] p-4 rounded-none border border-slate-200/80 space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary-navy border-l-2 border-[#9b1b30] pl-2 font-display">
                        {item.label}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                        {item.val}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right side: Urgent consultation CTA block */}
            <div className="lg:col-span-4 bg-primary-navy text-white rounded-none p-6 sm:p-8 relative overflow-hidden border border-white/5 shadow">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#9b1b30]/10 rounded-full blur-2xl"></div>
              
              <div className="space-y-6 relative z-10">
                <div className="inline-flex p-3 bg-white/5 rounded-none text-crimson-300 border border-white/10">
                  <Stethoscope className="w-5 h-5 stroke-[1.5]" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold tracking-widest uppercase text-crimson-300 font-display">
                    Emergency Treatment
                  </h3>
                  <p className="text-base font-normal text-white font-serif italic">
                    Need immediate assistance?
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    Dr. Laiba Tariq supports emergency medical consults for ruminant pasture toxicity or critical pet traumas. Our telephone registry remains active.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <a 
                    href={`tel:${CLINIC_INFO.contact.phone}`} 
                    className="w-full bg-[#9b1b30] hover:bg-crimson-750 text-white text-[10px] font-bold tracking-widest uppercase py-4 rounded-none flex items-center justify-center space-x-2 transition duration-200 border border-[#9b1b30] shadow"
                  >
                    <Phone className="w-4 h-4 text-crimson-300" />
                    <span className="font-mono tracking-wider">{CLINIC_INFO.contact.phoneDisplay}</span>
                  </a>
                  <p className="text-[9px] text-center text-slate-400 font-mono">
                    Registered under PVMC rules. Dunyapur sector
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. Booked Appointments Dashboard / Archives (if any exist) */}
      <AnimatePresence>
        {appointments.length > 0 && (
          <section className="py-20 bg-white border-b border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="skyline-header flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-extrabold tracking-widest text-crimson-500 uppercase block">
                    Your Clinic Safe Passports
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-900 font-display">
                    Local Appt Records
                  </h2>
                  <p className="text-slate-500 text-xs">
                    These tickets are saved locally in your browser cache. Show these codes at Dokota Chowk receipt desk on arrival.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to clear all your booked appointments?")) {
                      saveAppointmentsToStorage([]);
                    }
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-crimson-600 border border-slate-200 py-1.5 px-3.5 rounded-lg hover:border-crimson-100 transition duration-200 shrink-0 self-start md:self-end"
                >
                  Clear Booking History
                </button>
              </div>

              {/* Responsive appointments listing */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {appointments.map((appt) => (
                  <div 
                    key={appt.id} 
                    className="relative overflow-hidden bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-5 flex flex-col justify-between"
                  >
                    
                    {/* Upper ticket details */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-150 pb-2.5">
                        <span className="text-xs font-black font-mono tracking-wider text-crimson-600 bg-crimson-50/70 border border-crimson-100 py-1 px-2.5 rounded-lg uppercase">
                          {appt.ticketNo}
                        </span>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400">Date Booked</p>
                          <p className="text-xs font-bold text-navy-900">{appt.date}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                        <div>
                          <p className="text-[10px] text-slate-400">Owner Name</p>
                          <p className="font-bold text-navy-900">{appt.ownerName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400">Pet (Species)</p>
                          <p className="font-bold text-navy-900">{appt.petName} <span className="text-[10px] text-slate-500 uppercase">({appt.animalType})</span></p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400">Preferred Session</p>
                          <p className="font-bold text-navy-900">{appt.session}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400">Treatment Specialty</p>
                          <p className="font-bold text-navy-900 text-[11px] truncate">{appt.serviceTitle}</p>
                        </div>
                      </div>

                      {appt.notes && (
                        <div className="bg-white p-2.5 rounded-lg border border-slate-100 text-[10px] text-slate-500 italic max-h-16 overflow-y-auto">
                          "{appt.notes}"
                        </div>
                      )}

                    </div>

                    {/* Footer receipt details */}
                    <div className="mt-5 pt-3.5 border-t border-slate-200/50 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-slate-400">Est. Consult Fee</p>
                        <p className="text-sm font-extrabold text-navy-950 font-mono">{appt.fee} PKR</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAppointment(appt.id)}
                        className="text-[10px] font-bold text-slate-400 hover:text-crimson-600 transition"
                      >
                        Cancel Ticket
                      </button>
                    </div>

                    {/* Absolute visual ribbon for livestock/companion */}
                    <div className="absolute top-0 right-0 w-3 h-12 bg-navy-900"></div>

                  </div>
                ))}
              </div>

            </div>
          </section>
        )}
      </AnimatePresence>

      {/* 8. Testimonials & Reviews Section */}
      <section id="testimonials" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-[10px] font-bold tracking-widest text-[#9b1b30] uppercase block font-display">
              Testimonials of Animal Recovery
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal tracking-tight text-primary-navy font-serif">
              Healthy Animals, <span className="italic font-medium text-[#9b1b30]">Grateful Owners</span>
            </h2>
            <div className="h-0.5 w-12 bg-[#9b1b30] mx-auto my-3"></div>
            <p className="text-slate-500 max-w-xl mx-auto text-xs sm:text-sm leading-relaxed font-light">
              We serve farmers, backyard breeders, and casual domestic pet enthusiasts with the exact same clinical diagnostic integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((review) => (
              <div 
                key={review.id}
                className="bg-[#F9FAFB] rounded-none p-6 sm:p-8 border border-slate-200 transition duration-200 flex flex-col justify-between hover:bg-white hover:border-primary-navy"
              >
                
                <div className="space-y-4">
                  
                  {/* Rating Stars & Category Ribbon */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-[#9b1b30]">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#9b1b30] stroke-[#9b1b30]" />
                      ))}
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-widest py-0.5 px-2.5 rounded-none border ${review.type === 'Livestock' ? 'bg-primary-navy text-white border-primary-navy' : 'bg-white text-accent-crimson border-slate-200'}`}>
                      {review.type} Sector
                    </span>
                  </div>

                  {/* Comment */}
                  <blockquote className="text-xs sm:text-sm font-light text-slate-600 leading-relaxed font-serif italic">
                    "{review.comment}"
                  </blockquote>

                </div>

                {/* Author profile review tag */}
                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary-navy text-white font-mono text-[10px] h-9 w-9 rounded-none flex items-center justify-center border border-primary-navy shrink-0 uppercase tracking-widest">
                      {review.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-primary-navy uppercase tracking-wider font-display">
                        {review.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {review.role}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-semibold uppercase tracking-widest text-[#002147]/80 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-[#9b1b30]" />
                    <span>{review.location}</span>
                  </span>
                </div>

              </div>
            ))}
          </div>

          {/* Quick interactive call out banner */}
          <div className="mt-12 bg-primary-navy text-white rounded-none p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow relative overflow-hidden border border-white/5">
            <div className="absolute inset-0 z-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="space-y-2 relative z-10 text-center md:text-left">
              <h3 className="text-base md:text-lg font-serif italic text-white font-normal">Are you a recurring dairy farmer?</h3>
              <p className="text-xs text-slate-300 font-light max-w-xl">We offer periodic vaccine drives and herd temperature reports for larger agricultural stakeholders in Dunyapur rural.</p>
            </div>
            <button
              onClick={() => handleOpenBooking()}
              className="bg-[#9b1b30] hover:bg-crimson-750 text-white font-bold tracking-widest uppercase py-3 px-6 rounded-none text-[10px] transition duration-200 border border-[#9b1b30] relative z-10 shrink-0 select-none whitespace-nowrap active:translate-y-px"
            >
              Consult Dairy Pricing
            </button>
          </div>

        </div>
      </section>

      {/* 9. Interactive FAQs Section with Search */}
      <section id="faq" className="py-20 bg-[#F9FAFB] border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12 space-y-3">
            <span className="text-[10px] font-bold tracking-widest text-[#9b1b30] uppercase block font-display">
              Got Questions? We Have Answers
            </span>
            <h2 className="text-3xl font-normal tracking-tight text-primary-navy font-serif">
              Clinical <span className="italic font-medium text-[#9b1b30]">FAQs Hub</span>
            </h2>
            <div className="h-0.5 w-12 bg-[#9b1b30] mx-auto my-3"></div>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-light">
              Read transparent veterinary directives or perform an instant query lookup in our digital knowledge chest.
            </p>
          </div>

          {/* Search bar & Category filters container */}
          <div className="bg-white border border-slate-200 rounded-none p-5 mb-8 shadow-sm space-y-4">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search queries (e.g. vaccination, cow weight, surgery...)" 
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-slate-200 focus:outline-none focus:border-primary-navy text-xs rounded-none transition duration-200"
              />
              {faqSearch && (
                <button 
                  onClick={() => setFaqSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs uppercase tracking-wider font-mono font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sub category tabs inside filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mr-2 font-display">Filter Category:</span>
              {['All', 'General', 'Pets', 'Livestock'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFaqCategory(cat as any)}
                  className={`py-1 px-3 rounded-none text-[10px] font-bold tracking-widest uppercase transition border ${activeFaqCategory === cat ? 'bg-primary-navy text-white border-primary-navy' : 'bg-white text-slate-600 border-slate-200 hover:bg-[#F9FAFB]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>

          {/* Collapsible FAQ list with Framer Motion animations */}
          <div className="space-y-3">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                return (
                  <div 
                    key={faq.id}
                    className="border border-slate-200 rounded-none bg-white overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full text-left py-4 px-5 flex items-center justify-between text-primary-navy font-bold text-xs uppercase tracking-widest font-display focus:outline-none select-none hover:bg-[#F9FAFB] transition-colors"
                    >
                      <span className="pr-4 leading-normal">{faq.question}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180 text-[#9b1b30]' : ''}`} />
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="py-4 px-5 pt-0 border-t border-slate-250 text-slate-600 text-xs leading-relaxed bg-[#F9FAFB]">
                            <p className="font-light pt-3 text-slate-600">{faq.answer}</p>
                            <div className="mt-3 flex items-center space-x-2">
                              <span className="text-[9px] uppercase tracking-widest font-bold text-[#9b1b30] border border-slate-250 px-2 py-0.5 rounded-none bg-white">
                                Category: {faq.category}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 bg-white border border-slate-200 rounded-none max-w-md mx-auto">
                <p className="text-slate-400 text-xs">No matching clinic questions found.</p>
                <button
                  onClick={() => { setFaqSearch(''); setActiveFaqCategory('All'); }}
                  className="mt-3 text-[10px] text-[#9b1b30] uppercase tracking-widest font-bold hover:underline"
                >
                  Reset FAQ Filter Search
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 10. Contact, Address, & Hours Footer Dashboard */}
      <footer id="contact" className="bg-primary-navy text-white relative border-t-2 border-[#9b1b30]">
        
        {/* Upper footer content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Col 1: Logo & address description */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="flex items-center space-x-3">
                <div className="bg-[#9b1b30] p-2.5 rounded-none border border-white/10 shadow-sm">
                  <Heart className="w-5 h-5 text-white stroke-[2]" />
                </div>
                <div>
                  <span className="text-base font-bold tracking-widest block text-white uppercase font-display">
                    Pet & Vet Zone
                  </span>
                  <p className="text-[9px] tracking-widest text-crimson-300 uppercase font-bold font-mono">
                    DVM Specialist Health Clinic
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed max-w-sm font-light">
                Empowering companion pet owners and dairy farm operations across Dunyapur and Islamabad. Led by Regd. DVM Dr. Laiba Tariq providing compassionate clinical solutions.
              </p>

              {/* Quick direct contact links */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <MapPin className="w-4 h-4 text-crimson-300 mt-0.5 shrink-0" />
                  <span>
                    <strong>Address:</strong> {CLINIC_INFO.contact.address}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-300">
                  <Phone className="w-4 h-4 text-crimson-300 shrink-0" />
                  <span>
                    <strong>Phone:</strong> <a href={`tel:${CLINIC_INFO.contact.phone}`} className="hover:underline hover:text-white font-semibold font-mono tracking-wider">{CLINIC_INFO.contact.phoneDisplay}</a>
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-xs text-slate-300">
                  <Clock className="w-4 h-4 text-crimson-300 shrink-0" />
                  <span>
                    <strong>Emergency:</strong> 24-Hours On-Call Assistance
                  </span>
                </div>
              </div>

            </div>

            {/* Col 2: Clinic Schedule */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-xs font-bold text-crimson-300 uppercase tracking-widest font-display">
                Weekly Consultation Hours
              </h3>
              
              <div className="space-y-2.5 bg-[#001733] border border-white/10 p-4 rounded-none">
                {CLINIC_INFO.contact.hours.map((sched, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs text-slate-300 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                    <span className="font-bold text-white uppercase tracking-wider text-[10px]">{sched.days}</span>
                    <span className="font-mono bg-primary-navy py-1 px-2 rounded-none text-[9px] text-crimson-300 font-bold tracking-wider">{sched.times}</span>
                  </div>
                ))}
              </div>

              <div className="bg-[#001733]/50 p-3.5 rounded-none border border-white/5 text-[10px] text-slate-300 leading-normal font-light">
                🐾 <strong>Walk-in Instruction:</strong> For major surgical schedules, please try to book online or call us at least 4 hours ahead to let us sterilize the recovery ward.
              </div>

            </div>

            {/* Col 3: Direct booking/Query assistance */}
            <div className="lg:col-span-4 space-y-4">
              <h3 className="text-xs font-bold text-crimson-300 uppercase tracking-widest font-display">
                Quick Link Navigation
              </h3>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <a href="#about" onClick={(e) => scrollToSection(e, 'about')} className="text-slate-300 hover:text-white uppercase tracking-wider text-[10px] font-bold duration-200">Meet Dr. Laiba</a>
                <a href="#values" onClick={(e) => scrollToSection(e, 'values')} className="text-slate-300 hover:text-white uppercase tracking-wider text-[10px] font-bold duration-200">Philosophy</a>
                <a href="#services" onClick={(e) => scrollToSection(e, 'services')} className="text-slate-300 hover:text-white uppercase tracking-wider text-[10px] font-bold duration-200">Surgical List</a>
                <a href="#expert-care" onClick={(e) => scrollToSection(e, 'expert-care')} className="text-slate-300 hover:text-white uppercase tracking-wider text-[10px] font-bold duration-200">Care Advice</a>
                <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')} className="text-slate-300 hover:text-white uppercase tracking-wider text-[10px] font-bold duration-200">Clinical Q&A</a>
                <a href="#testimonials" onClick={(e) => scrollToSection(e, 'testimonials')} className="text-slate-300 hover:text-white uppercase tracking-wider text-[10px] font-bold duration-200">Client Reviews</a>
              </div>

              <div className="border border-white/10 bg-[#001733] p-4 rounded-none space-y-3">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-white font-display">
                  Clinic Location Guidance
                </h4>
                <p className="text-[10px] text-slate-300 leading-relaxed font-light">
                  Dokota Chowk block is highly accessible. Located next complex to Munshi Khan Hotel with spacious cattle trailer double-parking.
                </p>
                <button
                  onClick={() => handleOpenBooking()}
                  className="w-full bg-[#9b1b30] hover:bg-crimson-750 text-white font-bold tracking-widest uppercase py-2.5 rounded-none text-[10px] border border-[#9b1b30] transition duration-200"
                >
                  Direct Ticket Generator
                </button>
              </div>

            </div>

          </div>

          {/* Lower footer copyright block */}
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-light">
              &copy; {new Date().getFullYear()} <strong className="font-medium text-white">Pet & Vet Zone Health Clinic</strong>. All rights reserved. Registered RVMP & DVM.
            </p>
            <div className="flex items-center space-x-4 opacity-75">
              <span className="text-[9px] uppercase tracking-widest font-mono">Dundyapur / Islamabad Sector Care Initiative</span>
            </div>
          </div>

        </div>

      </footer>

      {/* ========================================================== */}
      {/* 11. Interactive Consultation Booking Modal (Framer Motion) */}
      {/* ========================================================== */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            
            {/* Backdrop Blur overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetForm}
              className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm"
            />

            {/* Modal main card */}
            <motion.div 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-slate-100"
            >
              
              {/* Modal Alert Header */}
              <div className="bg-navy-950 text-white px-6 py-5 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-base tracking-tight flex items-center space-x-2">
                    <Stethoscope className="w-5 h-5 text-crimson-500" />
                    <span>Booking Consultation Passport</span>
                  </h3>
                  <p className="text-[10px] text-slate-300">
                    Dr. Laiba Tariq (DVM, RVMP) Clinical Registry
                  </p>
                </div>
                <button 
                  onClick={resetForm}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-navy-900 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Indicator Steps */}
              <div className="bg-slate-100 border-b border-slate-200/55 px-6 py-3 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span className={bookingStep === 1 ? 'text-crimson-600 font-bold' : bookingStep > 1 ? 'text-green-600' : ''}>
                  Step 1: Patient Data
                </span>
                <span className="text-slate-300">➔</span>
                <span className={bookingStep === 2 ? 'text-crimson-600 font-bold' : bookingStep > 2 ? 'text-green-600' : ''}>
                  Step 2: Service Selection
                </span>
                <span className="text-slate-300">➔</span>
                <span className={bookingStep === 3 ? 'text-crimson-600 font-bold' : bookingStep > 3 ? 'text-green-600' : ''}>
                  Step 3: Session
                </span>
              </div>

              {/* Form implementation */}
              <form onSubmit={handleFormSubmit} className="p-6">
                
                {/* ==================================== */}
                {/* STEP 1: Owner and animal Patient Info */}
                {/* ==================================== */}
                {bookingStep === 1 && (
                  <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-navy-900 block font-display">
                          Owner’s Complete Name <span className="text-[#9b1b30]">*</span>
                        </label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Muhammad Asif" 
                          value={ownerName}
                          onChange={(e) => setOwnerName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#9b1b30] text-xs rounded-none transition"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-navy-900 block font-display">
                          Contact Phone Number <span className="text-[#9b1b30]">*</span>
                        </label>
                        <input 
                          type="tel" 
                          required
                          placeholder="e.g. +92 328 7348720" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#9b1b30] text-xs rounded-none font-mono transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-navy-900 block font-display">
                        Residential/Farm Address <span className="text-[#9b1b30]">*</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. House 12, Dokota Chowk, Dunyapur, Pakistan" 
                        value={ownerAddress}
                        onChange={(e) => setOwnerAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#9b1b30] text-xs rounded-none transition"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-navy-900 block font-display">
                          Patient Pet Name <span className="text-[#9b1b30]">*</span>
                        </label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Kitty, Leo" 
                          value={petName}
                          onChange={(e) => setPetName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#9b1b30] text-xs rounded-none transition"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-navy-900 block font-display">
                          Pet/Animal Breed <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. Persian Cat, Sahiwal Cow" 
                          value={petBreed}
                          onChange={(e) => setPetBreed(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#9b1b30] text-xs rounded-none transition"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-navy-900 block font-display">
                          Age of Animal <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input 
                          type="text" 
                          placeholder="e.g. 8 Months, 3 Years" 
                          value={petAge}
                          onChange={(e) => setPetAge(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#9b1b30] text-xs rounded-none transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-navy-900 block font-display">
                        Animal Classification Category <span className="text-[#9b1b30]">*</span>
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                        {['Dog', 'Cat', 'Cow', 'Sheep/Goat', 'Bird/Rabbit', 'Other'].map((anim) => (
                          <button
                            type="button"
                            key={anim}
                            onClick={() => setAnimalType(anim)}
                            className={`py-2 px-1 text-center text-[9px] font-bold uppercase tracking-wider rounded-none border transition font-display ${animalType === anim ? 'bg-primary-navy text-white border-primary-navy' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                          >
                            {anim}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (ownerName.trim() && phone.trim() && petName.trim() && ownerAddress.trim()) {
                            setBookingStep(2);
                          } else {
                            alert("Please fill in Owner Name, Contact Phone, Residential Address, and Pet Name.");
                          }
                        }}
                        className="bg-primary-navy text-white hover:bg-navy-900 font-bold uppercase tracking-widest py-2.5 px-6 rounded-none text-[10px] font-display transition duration-150"
                      >
                        Next Step
                      </button>
                    </div>

                  </div>
                )}

                {/* ==================================== */}
                {/* STEP 2: Service Selection */}
                {/* ==================================== */}
                {bookingStep === 2 && (
                  <div className="space-y-4">
                    
                    <div className="space-y-2">
                      <label className="text-[11px] font-black uppercase text-navy-900 block">
                        Select Requested Medical Service ({animalType} context)
                      </label>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {SERVICES.map((s) => (
                          <div 
                            key={s.id}
                            onClick={() => setSelectedServiceId(s.id)}
                            className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-center justify-between ${selectedServiceId === s.id ? 'bg-crimson-50/50 border-crimson-500' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`p-1.5 rounded-lg ${selectedServiceId === s.id ? 'bg-crimson-100 text-crimson-700' : 'bg-white text-slate-500'}`}>
                                {renderIcon(s.iconName, "w-4 h-4")}
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-navy-950">{s.title}</h4>
                                <p className="text-[10px] text-slate-400 truncate max-w-xs">{s.description}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold font-mono text-crimson-700 whitespace-nowrap bg-white py-0.5 px-2 rounded-md border border-slate-150">
                              {getServicePrice(s.id)} PKR
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setBookingStep(1)}
                        className="text-slate-500 hover:text-navy-950 text-xs font-bold"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingStep(3)}
                        className="bg-navy-950 text-white hover:bg-navy-900 font-bold py-2.5 px-6 rounded-lg text-xs"
                      >
                        Next Step
                      </button>
                    </div>

                  </div>
                )}

                {/* ==================================== */}
                {/* STEP 3: Dates, Session and final Notes */}
                {/* ==================================== */}
                {bookingStep === 3 && (
                  <div className="space-y-4">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase text-navy-900 block">
                          Desired Date <span className="text-crimson-500">*</span>
                        </label>
                        <input 
                          type="date" 
                          required
                          value={appointmentDate}
                          onChange={(e) => setAppointmentDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:border-crimson-500 focus:text-slate-900 text-xs rounded-lg font-mono transition"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase text-navy-900 block">
                          Preferred Session Time
                        </label>
                        <select
                          value={appointmentSession}
                          onChange={(e) => setAppointmentSession(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:border-crimson-500 text-xs rounded-lg font-medium transition"
                        >
                          <option value="Morning">Morning (09am - 12pm)</option>
                          <option value="Afternoon">Afternoon (1pm - 4pm)</option>
                          <option value="Evening">Evening (5pm - 8pm)</option>
                        </select>
                      </div>

                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase text-navy-900 block">
                        Add Patient Symptoms / Notes (Optional)
                      </label>
                      <textarea 
                        rows={2}
                        placeholder="e.g. Diarrhea since morning, vaccination booster calendar..." 
                        value={bookingNotes}
                        onChange={(e) => setBookingNotes(e.target.value)}
                        className="w-full px-3.5 py-2 py-2 bg-slate-50 border border-slate-200 focus:outline-none focus:border-crimson-500 text-xs rounded-lg font-normal transition"
                      />
                    </div>

                    {/* Cost Estimation calculation Box */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-slate-400">Owner Signature Code</p>
                        <p className="text-xs font-bold text-navy-950 font-mono">ESTIMATED TOTAL FEE</p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-crimson-600 font-mono">
                          {getServicePrice(selectedServiceId)} PKR
                        </span>
                        <p className="text-[8px] text-slate-400">Payment at clinical counter</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setBookingStep(2)}
                        className="text-slate-500 hover:text-navy-950 text-xs font-bold"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="bg-crimson-500 hover:bg-crimson-600 text-white font-bold py-2.5 px-8 rounded-lg text-xs tracking-wider"
                      >
                        Issue Booking Passport
                      </button>
                    </div>

                  </div>
                )}

                {/* ==================================== */}
                {/* STEP 4: Beautiful Confirmation Paper */}
                {/* ==================================== */}
                {bookingStep === 4 && generatedTicket && (
                  <div className="space-y-5 text-center">
                    
                    {/* Tick Check */}
                    <div className="mx-auto bg-green-50 text-green-600 h-14 w-14 rounded-full flex items-center justify-center border-2 border-green-200 shadow-sm animate-bounce">
                      <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                    </div>

                    <div>
                      <h4 className="text-base font-extrabold text-navy-950">
                        Appointment Confirmed Successfully!
                      </h4>
                      <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                        Your clinical entrance permit code is issued. Show this ticket number on your mobile at Dokota Chowk registry.
                      </p>
                    </div>

                    {/* Custom coupon lookalike ticket component */}
                    <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-5 text-left text-xs font-mono space-y-3 shadow-inner relative overflow-hidden">
                      
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="text-crimson-600 font-bold block text-sm">
                          {generatedTicket.ticketNo}
                        </span>
                        <span className="bg-navy-950 text-white font-bold text-[9px] py-1 px-2.5 rounded-md uppercase">
                          Pet & Vet Permit
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-y-2 text-[11px] leading-relaxed select-text">
                        <div>
                          <p className="text-[9px] text-slate-400 font-sans uppercase">Pet Companion</p>
                          <span className="font-bold text-navy-900">{generatedTicket.petName}</span>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-sans uppercase">Species / Breed</p>
                          <span className="font-bold text-navy-900">{generatedTicket.animalType}</span>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-sans uppercase">Session Time</p>
                          <span className="font-bold text-navy-900">{generatedTicket.session}</span>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 font-sans uppercase">Appt Date</p>
                          <span className="font-bold text-navy-900">{generatedTicket.date}</span>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[9px] text-slate-400 font-sans uppercase">Specialty Unit</p>
                          <span className="font-bold text-navy-900">{generatedTicket.serviceTitle}</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                        <div>
                          <p className="text-[8px] text-slate-400 font-sans uppercase">Entrance Fee Tag</p>
                          <p className="font-black text-navy-900 font-mono text-sm">{generatedTicket.fee} PKR</p>
                        </div>
                        <p className="text-[8px] max-w-[120px] text-right text-slate-400">Dokota Chowk, Near Munshi Khan Hotel, Dunyapur</p>
                      </div>

                    </div>

                    <div className="pt-2 border-t border-slate-150 flex justify-center">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="bg-navy-950 hover:bg-navy-900 text-white font-bold py-2.5 px-8 rounded-lg text-xs"
                      >
                        Acknowledged & Close
                      </button>
                    </div>

                  </div>
                )}

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
