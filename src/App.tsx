import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowDownUp,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CircleX,
  Heart,
  MapPin,
  Menu,
  Phone,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  Wallet,
  X,
} from 'lucide-react';

type Service = { id: string; name: string; duration: number; price: number; description?: string };
type Booking = {
  id: string;
  businessId: string;
  businessName: string;
  businessImage: string;
  serviceName: string;
  date: string;
  time: string;
  clientName: string;
  clientPhone: string;
  price: number;
  paymentMethod: 'mpesa' | 'in_person';
  paymentStatus: 'paid' | 'unpaid' | 'pending';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
};
type Business = {
  id: string;
  name: string;
  category: string;
  location: string;
  distance: string;
  rating: number;
  reviews: number;
  image: string;
  color: string;
  description: string;
  services: Service[];
  hours: string;
  tags: string[];
};
type View = 'discover' | 'bookings' | 'dashboard' | 'onboarding';

const seedBusinesses: Business[] = [
  {
    id: 'mali-studio',
    name: 'Mali Studio',
    category: 'Hair & beauty',
    location: 'Kilimani, Nairobi',
    distance: '1.2 km away',
    rating: 4.9,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1000&q=85',
    color: '#f1e8df',
    description: 'A little space for a little self-care. Thoughtful cuts, good coffee, and even better company.',
    hours: 'Open today · 9:00 am – 7:00 pm',
    tags: ['Top rated', 'Women-owned'],
    services: [
      { id: 'silk-press', name: 'Silk press & trim', duration: 90, price: 3500, description: 'Wash, condition, silk press and a light trim.' },
      { id: 'natural-cut', name: 'Natural hair cut', duration: 45, price: 1800, description: 'A shape-up tailored to your natural texture.' },
      { id: 'braid-consult', name: 'Braid consultation', duration: 30, price: 1000, description: 'Plan your next protective style with a stylist.' },
    ],
  },
  {
    id: 'form-and-flow',
    name: 'Form & Flow',
    category: 'Fitness',
    location: 'Westlands, Nairobi',
    distance: '2.4 km away',
    rating: 4.8,
    reviews: 86,
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=85',
    color: '#e6eee7',
    description: 'Small-group movement and mindful strength, for wherever you are in your journey.',
    hours: 'Open today · 6:00 am – 8:00 pm',
    tags: ['Small groups', 'All levels'],
    services: [
      { id: 'movement', name: 'Movement class', duration: 60, price: 1200, description: 'A small-group flow class with a certified coach.' },
      { id: 'personal-training', name: '1:1 personal training', duration: 60, price: 3000, description: 'A focused session built around your goals.' },
    ],
  },
  {
    id: 'the-good-doctor',
    name: 'The Good Doctor',
    category: 'Wellness',
    location: 'Lavington, Nairobi',
    distance: '3.1 km away',
    rating: 4.9,
    reviews: 204,
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=85',
    color: '#e8edeb',
    description: 'Friendly, unhurried care for you and your family. Your health, at your pace.',
    hours: 'Open today · 8:00 am – 5:00 pm',
    tags: ['Family friendly', 'Verified'],
    services: [
      { id: 'consultation', name: 'General consultation', duration: 30, price: 2500, description: 'A one-on-one appointment with a practitioner.' },
      { id: 'follow-up', name: 'Follow-up visit', duration: 20, price: 1500, description: 'A short check-in to follow up on your care.' },
    ],
  },
  {
    id: 'kinyozi-254',
    name: 'Kinyozi 254',
    category: 'Barbers',
    location: 'Kileleshwa, Nairobi',
    distance: '2.8 km away',
    rating: 4.7,
    reviews: 73,
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1000&q=85',
    color: '#e9e7e2',
    description: 'Sharp cuts, easy conversation. Your neighbourhood barbershop, made a little better.',
    hours: 'Open today · 8:00 am – 8:00 pm',
    tags: ['Walk-ins welcome', 'Popular'],
    services: [
      { id: 'classic-cut', name: 'Classic cut', duration: 40, price: 800, description: 'A clean, classic cut from one of our barbers.' },
      { id: 'cut-beard', name: 'Cut & beard trim', duration: 60, price: 1400, description: 'Haircut and beard line-up, all in one.' },
    ],
  },
  {
    id: 'studio-nia',
    name: 'Studio Nia',
    category: 'Nails',
    location: 'Kilimani, Nairobi',
    distance: '1.6 km away',
    rating: 4.8,
    reviews: 91,
    image: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?auto=format&fit=crop&w=1000&q=85',
    color: '#f1e7ea',
    description: 'A calm corner for colour, care and a proper catch-up.',
    hours: 'Open today · 9:00 am – 6:00 pm',
    tags: ['Good vibes', 'Top rated'],
    services: [
      { id: 'gel-mani', name: 'Gel manicure', duration: 60, price: 1800, description: 'A tidy manicure with a long-lasting gel finish.' },
      { id: 'classic-pedi', name: 'Classic pedicure', duration: 55, price: 1600, description: 'A relaxing clean-up, soak and polish.' },
    ],
  },
  {
    id: 'little-learners',
    name: 'Little Learners',
    category: 'Tutoring',
    location: 'Parklands, Nairobi',
    distance: '4.2 km away',
    rating: 5.0,
    reviews: 42,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1000&q=85',
    color: '#ecebdd',
    description: 'Patient, one-on-one tutoring that helps curious minds find their confidence.',
    hours: 'Open today · 9:00 am – 5:00 pm',
    tags: ['One-on-one', 'Verified'],
    services: [
      { id: 'math', name: 'Maths tutoring', duration: 60, price: 1500, description: 'A focused 1:1 lesson for primary and secondary learners.' },
      { id: 'english', name: 'English tutoring', duration: 60, price: 1500, description: 'Build confidence in reading, writing and communication.' },
    ],
  },
];

const categories = ['All services', 'Hair & beauty', 'Barbers', 'Nails', 'Wellness', 'Fitness', 'Tutoring'];
const savedBusinessesKey = 'ledger_demo_businesses';
const savedBookingsKey = 'ledger_demo_bookings';
const stored = <T,>(key: string, fallback: T): T => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch (error) {
    console.error(`Could not read ${key} from browser storage:`, error);
    return fallback;
  }
};
const money = (amount: number) => `KSh ${amount.toLocaleString('en-KE')}`;
const shortDate = (date: Date) => date.toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' });
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const timeToMinutes = (time: string) => {
  const match = time.match(/^(\d+):(\d+)\s*(am|pm)$/i);
  if (!match) return 0;
  const hour = Number(match[1]) % 12 + (match[3].toLowerCase() === 'pm' ? 12 : 0);
  return hour * 60 + Number(match[2]);
};
const isPastSlot = (date: string, time: string) => {
  if (date !== todayKey) return false;
  const now = new Date();
  return timeToMinutes(time) <= now.getHours() * 60 + now.getMinutes() + 15;
};
const todayKey = dateKey(new Date());
const makeDates = () => Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() + i);
  return date;
});

function App() {
  const [view, setView] = useState<View>('discover');
  const [businesses, setBusinesses] = useState<Business[]>(() => stored(savedBusinessesKey, seedBusinesses));
  const [bookings, setBookings] = useState<Booking[]>(() => stored(savedBookingsKey, [
    { id: 'BK-2084', businessId: 'mali-studio', businessName: 'Mali Studio', businessImage: seedBusinesses[0].image, serviceName: 'Silk press & trim', date: todayKey, time: '10:30 am', clientName: 'Wanjiku Njeri', clientPhone: '+254 712 345 678', price: 3500, paymentMethod: 'mpesa', paymentStatus: 'paid', status: 'confirmed' },
    { id: 'BK-2085', businessId: 'mali-studio', businessName: 'Mali Studio', businessImage: seedBusinesses[0].image, serviceName: 'Natural hair cut', date: todayKey, time: '11:30 am', clientName: 'Akinyi Otieno', clientPhone: '+254 723 456 789', price: 1800, paymentMethod: 'in_person', paymentStatus: 'unpaid', status: 'confirmed' },
    { id: 'BK-2086', businessId: 'mali-studio', businessName: 'Mali Studio', businessImage: seedBusinesses[0].image, serviceName: 'Braid consultation', date: todayKey, time: '1:00 pm', clientName: 'Njeri Kamau', clientPhone: '+254 734 567 890', price: 1000, paymentMethod: 'in_person', paymentStatus: 'unpaid', status: 'confirmed' },
    { id: 'BK-2087', businessId: 'mali-studio', businessName: 'Mali Studio', businessImage: seedBusinesses[0].image, serviceName: 'Silk press & trim', date: todayKey, time: '2:30 pm', clientName: 'Faith Wambui', clientPhone: '+254 745 678 901', price: 3500, paymentMethod: 'mpesa', paymentStatus: 'paid', status: 'confirmed' },
    { id: 'BK-2088', businessId: 'mali-studio', businessName: 'Mali Studio', businessImage: seedBusinesses[0].image, serviceName: 'Natural hair cut', date: todayKey, time: '4:00 pm', clientName: 'Miriam Achieng', clientPhone: '+254 756 789 012', price: 1800, paymentMethod: 'in_person', paymentStatus: 'unpaid', status: 'confirmed' },
  ]));
  const [ownerBusinessId, setOwnerBusinessId] = useState(() => localStorage.getItem('ledger_demo_owner_id') ?? 'mali-studio');
  const [activeCategory, setActiveCategory] = useState('All services');
  const [search, setSearch] = useState('');
  const [bookingBusiness, setBookingBusiness] = useState<Business | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'in_person'>('in_person');
  const [bookingNotice, setBookingNotice] = useState<Booking | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dashboardFilter, setDashboardFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [newBusiness, setNewBusiness] = useState({ name: '', category: 'Hair & beauty', location: '', service: '', price: '', duration: '60' });

  useEffect(() => localStorage.setItem(savedBusinessesKey, JSON.stringify(businesses)), [businesses]);
  useEffect(() => localStorage.setItem(savedBookingsKey, JSON.stringify(bookings)), [bookings]);
  useEffect(() => localStorage.setItem('ledger_demo_owner_id', ownerBusinessId), [ownerBusinessId]);

  const filteredBusinesses = useMemo(() => businesses.filter((business) => {
    const matchesCategory = activeCategory === 'All services' || business.category === activeCategory;
    const needle = search.trim().toLowerCase();
    const matchesSearch = !needle || `${business.name} ${business.category} ${business.location} ${business.services.map((service) => service.name).join(' ')}`.toLowerCase().includes(needle);
    return matchesCategory && matchesSearch;
  }), [activeCategory, businesses, search]);

  const ownerBusiness = businesses.find((business) => business.id === ownerBusinessId) ?? seedBusinesses[0];
  const ownerBookings = bookings.filter((booking) => booking.businessId === ownerBusinessId);
  const clientBookings = bookings.filter((booking) => booking.id.startsWith('LDG-'));
  const visibleBookings = dashboardFilter === 'all'
    ? ownerBookings
    : ownerBookings.filter((booking) => dashboardFilter === 'completed' ? booking.status === 'completed' : booking.status === 'confirmed' || booking.status === 'pending');
  const todayBookings = ownerBookings.filter((booking) => booking.date === todayKey && booking.status === 'confirmed');
  const revenueToday = todayBookings.filter((booking) => booking.paymentStatus === 'paid').reduce((total, booking) => total + booking.price, 0);
  const dates = useMemo(makeDates, []);
  const times = ['9:00 am', '9:30 am', '10:00 am', '10:30 am', '11:00 am', '11:30 am', '12:00 pm', '1:00 pm', '1:30 pm', '2:00 pm', '2:30 pm', '3:00 pm', '3:30 pm', '4:00 pm'];
  const slotUnavailable = (time: string) => {
    const start = timeToMinutes(time);
    const duration = selectedService?.duration ?? 30;
    return isPastSlot(selectedDate, time) || bookings.some((booking) => {
      if (booking.businessId !== bookingBusiness?.id || booking.date !== selectedDate || booking.status === 'cancelled') return false;
      const existingService = businesses.find((business) => business.id === booking.businessId)?.services.find((service) => service.name === booking.serviceName);
      const existingStart = timeToMinutes(booking.time);
      return start < existingStart + (existingService?.duration ?? 30) && existingStart < start + duration;
    });
  };

  const openBooking = (business: Business) => {
    setBookingBusiness(business);
    setSelectedService(business.services[0] ?? null);
    setSelectedDate(todayKey);
    setSelectedTime('');
    setClientName('');
    setClientPhone('');
    setPaymentMethod('in_person');
  };

  const submitBooking = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!bookingBusiness || !selectedService || !selectedTime) return;
    const booking: Booking = {
      id: `LDG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      businessId: bookingBusiness.id,
      businessName: bookingBusiness.name,
      businessImage: bookingBusiness.image,
      serviceName: selectedService.name,
      date: selectedDate,
      time: selectedTime,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      price: selectedService.price,
      paymentMethod,
      paymentStatus: paymentMethod === 'mpesa' ? 'pending' : 'unpaid',
      status: paymentMethod === 'mpesa' ? 'pending' : 'confirmed',
    };
    setBookings((current) => [booking, ...current]);
    setBookingNotice(booking);
    setBookingBusiness(null);
  };

  const updateBooking = (id: string, patch: Partial<Booking>) => {
    setBookings((current) => current.map((booking) => booking.id === id ? { ...booking, ...patch } : booking));
  };

  const createBusiness = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const item: Business = {
      id: `new-${Date.now()}`,
      name: newBusiness.name.trim(),
      category: newBusiness.category,
      location: newBusiness.location.trim(),
      distance: 'New on Ledger',
      rating: 5,
      reviews: 0,
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=85',
      color: '#e8eee7',
      description: 'A local business on Ledger. Book your next visit in just a few taps.',
      hours: 'Open today · 9:00 am – 5:00 pm',
      tags: ['New on Ledger'],
      services: [{ id: `service-${Date.now()}`, name: newBusiness.service.trim(), duration: Number(newBusiness.duration), price: Number(newBusiness.price), description: 'Book a visit with our friendly team.' }],
    };
    setBusinesses((current) => [item, ...current]);
    setOwnerBusinessId(item.id);
    setNewBusiness({ name: '', category: 'Hair & beauty', location: '', service: '', price: '', duration: '60' });
    setView('dashboard');
  };

  const navTo = (next: View) => {
    setView(next);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-shell">
      <div className="demo-strip"><span className="demo-dot" /> Prototype preview <span className="demo-divider">·</span> Bookings are saved in this browser; M-Pesa and SMS are not connected</div>
      <header className="topbar">
        <button className="brand" onClick={() => navTo('discover')} aria-label="Ledger home">
          <span className="brand-mark"><CalendarDays size={19} strokeWidth={2.5} /></span>
          <span>ledger<span className="brand-period">.</span></span>
        </button>
        <nav className={`main-nav ${mobileMenuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
          <button className={view === 'discover' ? 'nav-link active' : 'nav-link'} onClick={() => navTo('discover')}>Discover</button>
          <button className={view === 'bookings' ? 'nav-link active' : 'nav-link'} onClick={() => navTo('bookings')}>My bookings</button>
          <button className={view === 'dashboard' ? 'nav-link active' : 'nav-link'} onClick={() => navTo('dashboard')}>Business dashboard</button>
        </nav>
        <div className="header-actions">
          <button className="owner-link" onClick={() => navTo('onboarding')}><span>Own a business?</span> Get started <ArrowUpRight size={15} /></button>
          <button className="avatar-button" onClick={() => navTo('bookings')} aria-label="My account">W</button>
          <button className="mobile-menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">{mobileMenuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <main>
        {view === 'discover' && (
          <>
            <section className="hero">
              <div className="hero-copy">
                <div className="eyebrow"><Sparkles size={14} /> GOOD THINGS, RIGHT ON TIME</div>
                <h1>Your time is<br />worth <em>booking.</em></h1>
                <p>Find the people who make your day a little better. Book a slot, skip the back-and-forth.</p>
                <div className="search-bar">
                  <Search size={19} />
                  <input aria-label="Search businesses or services" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Try “a fresh fade” or “Kilimani”" />
                  <button className="search-location" onClick={() => setSearch('Nairobi')}><MapPin size={15} /> Nairobi <ChevronDown size={15} /></button>
                  <button className="search-submit" aria-label="Search"><ArrowRight size={19} /></button>
                </div>
                <div className="hero-trust"><span className="avatar-stack"><i>J</i><i>A</i><i>M</i></span><span><b>2,400+</b> locals booked this week</span><span className="trust-star"><Star size={13} fill="currentColor" /> 4.9</span></div>
              </div>
              <div className="hero-art">
                <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1100&q=90" alt="A stylist working in a bright, welcoming salon" />
                <div className="floating-note"><span className="note-icon"><Check size={17} /></span><span><strong>That's you, booked.</strong><small>Good choice, Wanjiku.</small></span></div>
                <div className="hero-stamp"><span>MADE FOR</span><b>your<br />neighbourhood</b><span className="stamp-heart">♥</span></div>
              </div>
            </section>

            <section className="discovery-section">
              <div className="section-heading">
                <div><div className="eyebrow muted-eyebrow">THE GOOD STUFF IS NEARBY</div><h2>Find your kind of <em>place.</em></h2></div>
                <button className="text-action" onClick={() => { setActiveCategory('All services'); setSearch(''); }}>View all places <ArrowRight size={17} /></button>
              </div>
              <div className="category-row" role="tablist" aria-label="Categories">
                {categories.map((category, index) => <button key={category} role="tab" aria-selected={activeCategory === category} className={`category-chip ${activeCategory === category ? 'selected' : ''}`} onClick={() => setActiveCategory(category)}>{index === 0 ? <Sparkles size={15} /> : <span className="category-dot">{['', '✳', '✂', '✿', '♡', '↗', '⌂'][index]}</span>}{category}</button>)}
                <button className="filter-button"><SlidersHorizontal size={15} /> Filters</button>
              </div>
              <div className="results-heading"><span>{search ? `Results for “${search}”` : 'Little local favourites'}</span><span className="results-count">{filteredBusinesses.length} places <ArrowDownUp size={13} /></span></div>
              {filteredBusinesses.length ? <div className="business-grid">
                {filteredBusinesses.map((business, index) => <BusinessCard key={business.id} business={business} index={index} onBook={() => openBooking(business)} />)}
              </div> : <div className="empty-state"><Search size={26} /><h3>No places found just yet</h3><p>Try another service or browse all categories.</p><button className="button button-outline" onClick={() => { setSearch(''); setActiveCategory('All services'); }}>Clear search</button></div>}
              <div className="nearby-cta"><div className="nearby-icon"><MapPin size={21} /></div><div><strong>Looking for something specific?</strong><p>We're adding lovely local businesses every week.</p></div><button className="button button-dark" onClick={() => navTo('onboarding')}>List your business <ArrowRight size={16} /></button></div>
            </section>
          </>
        )}

        {view === 'bookings' && (
          <section className="page-section narrow-page">
            <div className="page-kicker"><CalendarDays size={15} /> YOUR PLANS, ALL IN ONE PLACE</div>
            <div className="section-heading page-title-row"><div><h1>My <em>bookings.</em></h1><p className="page-subtitle">A little something to look forward to.</p></div><button className="button button-dark" onClick={() => navTo('discover')}>Find a place <ArrowRight size={16} /></button></div>
            {clientBookings.length ? <div className="booking-list">
              {clientBookings.map((booking) => <BookingCard key={booking.id} booking={booking} onCancel={() => updateBooking(booking.id, { status: 'cancelled' })} />)}
            </div> : <div className="empty-state"><CalendarDays size={26} /><h3>Nothing on the calendar yet</h3><p>Find a place you love and book your first visit.</p><button className="button button-dark" onClick={() => navTo('discover')}>Discover places</button></div>}
          </section>
        )}

        {view === 'dashboard' && (
          <section className="dashboard-page">
            <div className="dashboard-topline"><div><div className="page-kicker"><span className="live-dot" /> YOUR BUSINESS, AT A GLANCE</div><h1>Morning, <em>{ownerBusiness.name}.</em></h1><p className="page-subtitle">Here's what's happening at your business today.</p></div><div className="dashboard-date"><CalendarDays size={16} /> {new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })}</div></div>
            <div className="dashboard-layout">
              <div className="dashboard-main">
                <div className="stat-grid">
                  <StatCard icon={<CalendarDays size={17} />} label="Bookings today" value={String(todayBookings.length).padStart(2, '0')} note="+2 from yesterday" tone="green" />
                  <StatCard icon={<Wallet size={17} />} label="Collected today" value={money(revenueToday)} note="M-Pesa payments only" tone="pink" />
                  <StatCard icon={<Users size={17} />} label="This week" value={`${ownerBookings.length + 14}`} note="3 new clients" tone="lavender" />
                </div>
                <div className="panel appointments-panel">
                  <div className="panel-heading"><div><h2>Today's appointments</h2><p>{todayBookings.length} lovely people, coming your way</p></div><button className="icon-button" aria-label="Appointment settings"><Settings2 size={18} /></button></div>
                  <div className="filter-tabs">{(['all', 'upcoming', 'completed'] as const).map((filter) => <button key={filter} className={dashboardFilter === filter ? 'filter-tab active' : 'filter-tab'} onClick={() => setDashboardFilter(filter)}>{filter === 'all' ? 'All appointments' : filter === 'upcoming' ? 'Upcoming' : 'Completed'}</button>)}</div>
                  <div className="appointment-table">
                    <div className="table-header"><span>CLIENT</span><span>SERVICE</span><span>PAYMENT</span><span>STATUS</span><span /></div>
                    {visibleBookings.length ? visibleBookings.map((booking) => <div className="appointment-row" key={booking.id}>
                      <div className="client-cell"><span className="client-avatar">{booking.clientName.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><span><b>{booking.clientName}</b><small><Phone size={11} /> {booking.clientPhone}</small></span></div>
                      <div className="service-cell"><b>{booking.serviceName}</b><small><Clock3 size={11} /> {booking.time}</small></div>
                      <div>{booking.paymentStatus === 'unpaid' ? <button className="payment-pill unpaid" onClick={() => updateBooking(booking.id, { paymentStatus: 'paid' })} title="Mark payment collected">Mark paid</button> : <span className={`payment-pill ${booking.paymentStatus}`}>{booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</span>}<small className="row-price">{money(booking.price)}</small></div>
                      <div><span className={`status-pill ${booking.status}`}>{booking.status === 'completed' ? 'Completed' : booking.status === 'cancelled' ? 'Cancelled' : booking.status === 'pending' ? 'Payment pending' : booking.status === 'no_show' ? 'No-show' : 'Confirmed'}</span></div>
                      <div className="row-actions">{booking.status === 'confirmed' ? <><button className="more-button" onClick={() => updateBooking(booking.id, { status: 'completed' })} title="Mark complete"><CheckCircle2 size={16} /></button><button className="no-show-button" onClick={() => updateBooking(booking.id, { status: 'no_show' })} title="Mark no-show"><CircleX size={16} /></button></> : booking.status === 'completed' ? <CheckCircle2 size={16} className="complete-icon" /> : null}</div>
                    </div>) : <div className="table-empty">No appointments in this view.</div>}
                  </div>
                  <div className="panel-foot"><span>Showing {visibleBookings.length} appointments</span><button className="text-action" onClick={() => navTo('bookings')}>View client bookings <ArrowRight size={15} /></button></div>
                </div>
              </div>
              <aside className="dashboard-aside">
                <div className="panel studio-panel"><div className="studio-cover" style={{ backgroundImage: `url(${ownerBusiness.image})` }}><span className="verified-tag"><BadgeCheck size={13} /> LIVE</span><button className="edit-cover">Edit profile</button></div><div className="studio-body"><span className="studio-category">{ownerBusiness.category.toUpperCase()} · {ownerBusiness.location.toUpperCase()}</span><h3>{ownerBusiness.name} <BadgeCheck size={17} fill="currentColor" /></h3><div className="studio-rating"><Star size={14} fill="currentColor" /> {ownerBusiness.rating.toFixed(1)} <span>·</span> {ownerBusiness.reviews} reviews <span>·</span> <span className="open-label">Open</span></div><div className="studio-divider" /><div className="studio-metric"><span>Profile visits</span><b>243 <small>this week</small></b></div><div className="studio-metric"><span>Booking conversion</span><b>18.4% <small className="positive">↑ 3.2%</small></b></div><button className="studio-link" onClick={() => navTo('discover')}>View public page <ArrowUpRight size={15} /></button></div></div>
                <div className="panel tip-panel"><div className="tip-icon"><Sparkles size={17} /></div><div><span className="tip-label">A LITTLE TIP</span><p>Clients who get a reminder are <b>35% less likely</b> to miss their appointment.</p><button className="text-action">Set up reminders <ArrowRight size={14} /></button></div></div>
              </aside>
            </div>
          </section>
        )}

        {view === 'onboarding' && (
          <section className="onboarding-page">
            <div className="onboarding-intro"><div className="page-kicker"><Sparkles size={15} /> A BETTER WAY TO GET BOOKED</div><h1>Make room for<br /><em>good business.</em></h1><p>Your own booking page, less time on the phone, and a little more breathing room. Let's get your business on Ledger.</p><div className="onboarding-benefits"><div><span><Check size={14} /></span> Set up in a few minutes</div><div><span><Check size={14} /></span> Clients choose how they pay</div><div><span><Check size={14} /></span> No monthly fee to get started</div></div><div className="onboarding-art"><img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85" alt="A welcoming local salon" /><div className="onboard-note"><Heart size={17} fill="currentColor" /> Made for local businesses</div></div></div>
            <form className="onboarding-form panel" onSubmit={createBusiness}>
              <div className="form-top"><span className="step-number">01</span><div><h2>Let's meet your business.</h2><p>Start with the basics. You can add more later.</p></div></div>
              <label>Business name<input required minLength={2} value={newBusiness.name} onChange={(event) => setNewBusiness({ ...newBusiness, name: event.target.value })} placeholder="e.g. Mali Studio" /></label>
              <div className="form-two-col"><label>What do you do?<select value={newBusiness.category} onChange={(event) => setNewBusiness({ ...newBusiness, category: event.target.value })}>{categories.slice(1).map((category) => <option key={category}>{category}</option>)}</select></label><label>Neighbourhood<input required value={newBusiness.location} onChange={(event) => setNewBusiness({ ...newBusiness, location: event.target.value })} placeholder="e.g. Kilimani, Nairobi" /></label></div>
              <div className="form-rule" /><div className="form-top service-form-top"><span className="step-number">02</span><div><h2>Add your first service.</h2><p>Give people something to book.</p></div></div>
              <label>Service name<input required value={newBusiness.service} onChange={(event) => setNewBusiness({ ...newBusiness, service: event.target.value })} placeholder="e.g. Classic haircut" /></label>
              <div className="form-two-col"><label>Price (KES)<div className="input-prefix"><span>KSh</span><input type="number" required min="1" step="1" value={newBusiness.price} onChange={(event) => setNewBusiness({ ...newBusiness, price: event.target.value })} placeholder="1,500" /></div></label><label>Duration<select value={newBusiness.duration} onChange={(event) => setNewBusiness({ ...newBusiness, duration: event.target.value })}><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">1 hour</option><option value="90">1.5 hours</option><option value="120">2 hours</option></select></label></div>
              <div className="form-footnote"><ShieldCheck size={16} /> You can update your details and hours any time.</div>
              <button className="button button-dark submit-onboarding" type="submit">Create your booking page <ArrowRight size={17} /></button>
              <p className="form-legal">By continuing, you agree to Ledger's terms. This demo stores information only in this browser.</p>
            </form>
          </section>
        )}
      </main>

      <footer className="footer"><button className="brand footer-brand" onClick={() => navTo('discover')}><span className="brand-mark"><CalendarDays size={17} strokeWidth={2.5} /></span><span>ledger<span className="brand-period">.</span></span></button><span>Good businesses deserve good bookings.</span><div><span>Built for Kenya <span className="kenya-heart">♥</span></span><span>·</span><button onClick={() => navTo('onboarding')}>For businesses</button></div></footer>

      {bookingBusiness && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setBookingBusiness(null); }}>
          <form className="booking-modal" onSubmit={submitBooking}>
            <div className="modal-header"><div><span className="modal-kicker">YOUR NEXT LITTLE TREAT</span><h2>Book a visit</h2></div><button type="button" className="icon-button close-modal" onClick={() => setBookingBusiness(null)} aria-label="Close"><X size={20} /></button></div>
            <div className="booking-business"><img src={bookingBusiness.image} alt="" /><div><strong>{bookingBusiness.name}</strong><span><MapPin size={13} /> {bookingBusiness.location}</span></div><span className="booking-rating"><Star size={13} fill="currentColor" /> {bookingBusiness.rating}</span></div>
            <div className="modal-section"><label className="field-label" htmlFor="service-select">Choose a service</label><select id="service-select" className="modal-select" value={selectedService?.id ?? ''} onChange={(event) => setSelectedService(bookingBusiness.services.find((service) => service.id === event.target.value) ?? null)}>{bookingBusiness.services.map((service) => <option key={service.id} value={service.id}>{service.name} · {money(service.price)}</option>)}</select>{selectedService && <div className="service-meta"><span><Clock3 size={13} /> {selectedService.duration} min</span><span>{selectedService.description}</span></div>}</div>
            <div className="modal-section"><div className="field-heading"><span className="field-label">Pick a day</span><span className="timezone-note">Nairobi time · EAT</span></div><div className="date-picker">{dates.map((date) => { const key = dateKey(date); return <button type="button" key={key} className={`date-option ${selectedDate === key ? 'selected' : ''}`} onClick={() => { setSelectedDate(key); setSelectedTime(''); }}><span>{date.toLocaleDateString('en-KE', { weekday: 'short' })}</span><b>{date.getDate()}</b><small>{date.toLocaleDateString('en-KE', { month: 'short' })}</small></button>; })}</div><div className="time-grid">{times.map((time) => <button key={time} type="button" disabled={slotUnavailable(time)} className={`time-option ${selectedTime === time ? 'selected' : ''}`} onClick={() => setSelectedTime(time)}>{time}</button>)}</div></div>
            <div className="modal-section contact-fields"><label><span className="field-label">Your name</span><input required minLength={2} value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="e.g. Wanjiku Njeri" /></label><label><span className="field-label">Phone number</span><div className="phone-input"><span>🇰🇪 +254</span><input required type="tel" pattern="[0-9]{9}" value={clientPhone} onChange={(event) => setClientPhone(event.target.value)} placeholder="712345678" /></div></label></div>
            <div className="modal-section"><span className="field-label">How would you like to pay?</span><div className="payment-options">
              <button type="button" className={`payment-option ${paymentMethod === 'in_person' ? 'selected' : ''}`} onClick={() => setPaymentMethod('in_person')}><span className="payment-option-icon person-icon"><Wallet size={18} /></span><span><b>Pay in person</b><small>At your appointment</small></span><span className="radio-mark">{paymentMethod === 'in_person' && <i />}</span></button>
              <button type="button" className={`payment-option ${paymentMethod === 'mpesa' ? 'selected' : ''}`} onClick={() => setPaymentMethod('mpesa')}><span className="payment-option-icon mpesa-icon">M</span><span><b>Pay with M-Pesa</b><small>STK push · Demo only</small></span><span className="radio-mark">{paymentMethod === 'mpesa' && <i />}</span></button>
            </div><div className="demo-disclaimer"><ShieldCheck size={14} /> Prototype only — no real payment or SMS will be sent.</div></div>
            <div className="booking-submit-row"><div><small>Total</small><strong>{selectedService ? money(selectedService.price) : '—'}</strong></div><button className="button button-dark" type="submit" disabled={!selectedService || !selectedTime}>Confirm booking <ArrowRight size={16} /></button></div>
          </form>
        </div>
      )}

      {bookingNotice && <div className="modal-backdrop notice-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setBookingNotice(null); }}><div className="confirmation-modal"><button className="icon-button confirmation-close" onClick={() => setBookingNotice(null)} aria-label="Close"><X size={20} /></button><div className="confirmation-check">{bookingNotice.status === 'pending' ? <Clock3 size={25} /> : <Check size={26} />}</div><div className="page-kicker">{bookingNotice.status === 'pending' ? 'PAYMENT ACTION NEEDED' : "IT'S IN THE DIARY"}</div><h2>{bookingNotice.status === 'pending' ? <>Your slot is <em>pending.</em></> : <>You're <em>booked.</em></>}</h2><p className="confirmation-intro">{bookingNotice.status === 'pending' ? 'Your slot is not confirmed until M-Pesa payment succeeds. This prototype cannot send an STK push.' : `Lovely choice, ${bookingNotice.clientName.split(' ')[0]}. We've saved your appointment details.`}</p><div className="confirmation-details"><div><CalendarDays size={17} /><span><b>{new Date(`${bookingNotice.date}T12:00:00`).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })}</b><small>{bookingNotice.time}</small></span></div><div><Sparkles size={17} /><span><b>{bookingNotice.serviceName}</b><small>{bookingNotice.businessName} · {bookingBusiness?.location ?? ownerBusiness.location}</small></span></div><div><Wallet size={17} /><span><b>{bookingNotice.paymentMethod === 'mpesa' ? 'M-Pesa payment pending (demo)' : 'Pay in person'}</b><small>{bookingNotice.paymentMethod === 'mpesa' ? 'No STK push was sent. Payment is not collected.' : `${money(bookingNotice.price)} due at your appointment`}</small></span></div></div><div className="sms-note"><Phone size={14} /> In production, we'd send an SMS to {bookingNotice.clientPhone}. This demo doesn't send messages.</div><button className="button button-dark confirmation-button" onClick={() => { setBookingNotice(null); navTo('bookings'); }}>See my bookings <ArrowRight size={16} /></button><button className="confirmation-back" onClick={() => setBookingNotice(null)}>Back to discovering</button></div></div>}
    </div>
  );
}

function BusinessCard({ business, index, onBook }: { business: Business; index: number; onBook: () => void }) {
  const [saved, setSaved] = useState(false);
  return <article className="business-card" style={{ animationDelay: `${index * 65}ms` }}>
    <div className="card-image-wrap"><img src={business.image} alt={business.name} className="card-image" /><span className="card-category">{business.category}</span><button className={`save-button ${saved ? 'saved' : ''}`} onClick={() => setSaved(!saved)} aria-label={saved ? 'Remove from saved' : 'Save place'}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button>{index === 0 && <span className="featured-badge"><Sparkles size={11} /> LOCAL FAVOURITE</span>}</div>
    <div className="card-body"><div className="card-title-line"><h3>{business.name}</h3><span className="rating"><Star size={13} fill="currentColor" /> {business.rating.toFixed(1)} <small>({business.reviews})</small></span></div><p className="card-location"><MapPin size={13} /> {business.location}<span>·</span>{business.distance}</p><p className="card-description">{business.description}</p><div className="card-bottom"><div className="starting-price"><small>FROM</small><b>{money(Math.min(...business.services.map((service) => service.price)))}</b></div><button className="button card-book-button" onClick={onBook}>Book a time <ArrowRight size={15} /></button></div></div>
  </article>;
}

function BookingCard({ booking, onCancel }: { booking: Booking; onCancel: () => void }) {
  const date = new Date(`${booking.date}T12:00:00`);
  return <article className={`client-booking-card ${booking.status === 'cancelled' ? 'booking-cancelled' : ''}`}>
    <div className="client-date-badge"><span>{date.toLocaleDateString('en-KE', { month: 'short' }).toUpperCase()}</span><b>{date.getDate()}</b><small>{date.toLocaleDateString('en-KE', { weekday: 'short' })}</small></div>
    <img className="client-booking-image" src={booking.businessImage} alt="" />
    <div className="client-booking-info"><div className="client-booking-heading"><h3>{booking.businessName}</h3><span className={`status-pill ${booking.status}`}>{booking.status === 'cancelled' ? 'Cancelled' : booking.status === 'completed' ? 'Completed' : booking.status === 'no_show' ? 'No-show' : booking.status === 'pending' ? 'Payment pending' : 'Confirmed'}</span></div><p>{booking.serviceName} <span>·</span> {booking.time}</p><small>{money(booking.price)} <span>·</span> {booking.paymentStatus === 'paid' ? 'Paid by M-Pesa' : booking.paymentStatus === 'pending' ? 'M-Pesa pending · demo' : 'Pay in person'}</small></div>
    {(booking.status === 'confirmed' || booking.status === 'pending') && <button className="booking-cancel-link" onClick={onCancel}>Cancel</button>}
  </article>;
}

function StatCard({ icon, label, value, note, tone }: { icon: ReactNode; label: string; value: string; note: string; tone: string }) {
  return <div className="stat-card"><span className={`stat-icon ${tone}`}>{icon}</span><span className="stat-label">{label}</span><strong>{value}</strong><small>{note}</small></div>;
}

export default App;
