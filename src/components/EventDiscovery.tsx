import React, { useState, useEffect } from 'react';
import { Event } from '../types';
import { KENYAN_EVENTS } from '../data/events';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Calendar, Tag, ChevronRight, User, Phone, ShoppingCart, Filter, Sparkles, X, Plus, Minus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface EventDiscoveryProps {
  onInitiateCheckout: (
    event: Event,
    selectedTier: { name: string; price: number },
    quantity: number,
    userName: string,
    userPhone: string
  ) => void;
}

export default function EventDiscovery({ onInitiateCheckout }: EventDiscoveryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  
  // Ticket selection details in modal
  const { profile } = useAuth();
  const [ticketQty, setTicketQty] = useState(1);
  const [selectedTierIdx, setSelectedTierIdx] = useState(0);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('0712345678');
  const [checkoutError, setCheckoutError] = useState('');

  // Auto-populate ticket purchaser info from profile when event is opened
  useEffect(() => {
    if (selectedEvent && profile) {
      if (profile.displayName) {
        setUserName(profile.displayName);
      }
      if (profile.phone) {
        setUserPhone(profile.phone);
      }
    }
  }, [selectedEvent, profile]);

  const categories = ['All', 'Concerts', 'Festivals', 'Sports', 'Comedy', 'Tech'];
  const cities = ['All', 'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'];

  // Filter Logic
  const filteredEvents = KENYAN_EVENTS.filter((event) => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesCity = selectedCity === 'All' || event.city === selectedCity;

    return matchesSearch && matchesCategory && matchesCity;
  });

  const handleOpenEvent = (event: Event) => {
    setSelectedEvent(event);
    setTicketQty(1);
    setSelectedTierIdx(0);
    setCheckoutError('');
  };

  const handleCloseEvent = () => {
    setSelectedEvent(null);
  };

  const handleQuantityChange = (type: 'inc' | 'dec', max: number) => {
    if (type === 'inc') {
      if (ticketQty < max) setTicketQty(prev => prev + 1);
    } else {
      if (ticketQty > 1) setTicketQty(prev => prev - 1);
    }
  };

  const handleProceedToCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');

    if (!selectedEvent) return;

    if (!userName.trim()) {
      setCheckoutError('Please enter the ticket holder\'s name.');
      return;
    }

    if (!userPhone.trim() || userPhone.length < 9) {
      setCheckoutError('Please enter a valid M-Pesa phone number.');
      return;
    }

    const tier = selectedEvent.pricing[selectedTierIdx];
    onInitiateCheckout(selectedEvent, { name: tier.name, price: tier.price }, ticketQty, userName, userPhone);
    handleCloseEvent(); // Close dialog on transition
  };

  const getLowestPrice = (event: Event) => {
    const prices = event.pricing.map(p => p.price);
    return Math.min(...prices);
  };

  return (
    <div id="event-discovery-container" className="space-y-6">
      
      {/* Featured Banner / Quick Search Header */}
      <div className="bg-gradient-to-br from-safari-green to-[#015e3a] text-white rounded-[28px] p-6 sm:p-10 relative overflow-hidden shadow-sm border border-black/5">
        {/* Rounded pattern matching design template */}
        <div className="absolute -right-10 -top-10 w-[300px] h-[300px] opacity-10 border-[40px] border-white rounded-full"></div>
        
        <div className="relative z-10 max-w-xl space-y-4">
          <span className="bg-sun-yellow text-ink px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider inline-block mb-2 shadow-xs">
            Featured Event
          </span>
          <h1 className="text-3xl sm:text-4xl font-sans font-black tracking-tight text-white leading-tight">
            Discover & Book The Best Events In Kenya
          </h1>
          <p className="text-sm text-neutral-100 leading-relaxed max-w-md font-sans opacity-95">
            Get instant, secure PDF & QR-coded tickets straight to your phone. Fully automated checkout powered by Safaricom STK Push simulation.
          </p>

          {/* Search Box */}
          <div className="pt-2">
            <div className="relative max-w-lg">
              <Search className="w-5 h-5 text-neutral-500 absolute left-4.5 top-1/2 -translate-y-1/2" />
              <input
                id="event-search-input"
                type="text"
                placeholder="Find concerts, sports, or cultural festivals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F0F2F0] border-0 rounded-full pl-12 pr-5 py-3.5 text-sm text-ink placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-sun-yellow transition-all font-sans"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="bg-white p-6 rounded-[24px] border border-black/5 shadow-xs space-y-5 font-sans">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          
          {/* Categories Slider */}
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
              <Tag className="w-3.5 h-3.5" />
              <span>Category</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4.5 py-2 text-xs font-bold rounded-full border transition-all duration-200 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-ink border-ink text-white shadow-xs'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cities Slider */}
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5 text-[10px] font-black text-neutral-400 uppercase tracking-widest">
              <MapPin className="w-3.5 h-3.5" />
              <span>Location / City</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  className={`px-4.5 py-2 text-xs font-bold rounded-full border transition-all duration-200 cursor-pointer ${
                    selectedCity === city
                      ? 'bg-ink border-ink text-white shadow-xs'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Active Filters status row */}
        {(selectedCategory !== 'All' || selectedCity !== 'All' || searchQuery !== '') && (
          <div className="flex items-center justify-between text-xs text-neutral-500 border-t border-neutral-100 pt-3">
            <span>
              Found {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} matching criteria
            </span>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedCity('All');
                setSearchQuery('');
              }}
              className="text-safari-green hover:underline font-bold"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div id="events-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-white rounded-[20px] border border-black/5 shadow-xs overflow-hidden group hover:shadow-sm transition-all flex flex-col h-full"
            >
              {/* Event Image Banner */}
              <div className="relative h-48 overflow-hidden bg-neutral-100">
                <img
                  src={event.image}
                  alt={event.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Popular Badge */}
                {event.isPopular && (
                  <span className="absolute top-3 left-3 bg-sun-yellow text-ink font-black text-[10px] px-3 py-1 rounded-lg uppercase tracking-wider flex items-center space-x-1 shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    <span>Popular</span>
                  </span>
                )}

                {/* City Badge */}
                <span className="absolute top-3 right-3 bg-black/75 backdrop-blur-xs text-white font-bold text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-neutral-300" />
                  <span>{event.city}</span>
                </span>
              </div>

              {/* Card Contents */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-safari-green font-bold uppercase tracking-wider">
                    <span>{event.category}</span>
                    <span className="text-neutral-400 font-medium lowercase italic">by {event.organizer}</span>
                  </div>
                  
                  <h3 className="text-base font-extrabold text-ink group-hover:text-safari-green transition-colors leading-snug">
                    {event.title}
                  </h3>
                  
                  <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex flex-col space-y-1.5 text-xs text-neutral-600 border-t border-neutral-100 pt-3">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                      <span className="font-semibold text-ink">{event.date}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-neutral-400" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase block">Tickets from</span>
                      <span className="text-base font-black text-safari-green">
                        Ksh {getLowestPrice(event).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={() => handleOpenEvent(event)}
                      className="bg-ink hover:bg-safari-green text-white font-bold text-xs px-4.5 py-2.5 rounded-xl transition-all flex items-center space-x-1 shadow-xs cursor-pointer"
                    >
                      <span>Buy Ticket</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 text-center rounded-[24px] border border-black/5 font-sans space-y-2 shadow-xs">
          <Filter className="w-10 h-10 text-neutral-300 mx-auto" />
          <h3 className="font-bold text-ink text-base">No events found</h3>
          <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
            We couldn't find any events matching "{searchQuery}" under the selected category or city. Try clearing filters or revising your search!
          </p>
        </div>
      )}

      {/* Elegant Details Overlay / Ticket Booking Modal */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[28px] overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl relative border border-black/5 font-sans"
            >
              
              {/* Close Button */}
              <button
                onClick={handleCloseEvent}
                className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header Image */}
              <div className="relative h-48 sm:h-56 flex-shrink-0 bg-neutral-100">
                <img
                  src={selectedEvent.image}
                  alt={selectedEvent.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="bg-safari-green text-white font-bold text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    {selectedEvent.category} • {selectedEvent.city}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-2 leading-tight">
                    {selectedEvent.title}
                  </h2>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Event Overview Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-600 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                  <div className="space-y-1">
                    <p className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Venue</p>
                    <p className="font-semibold text-neutral-800 flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-neutral-400" />
                      <span>{selectedEvent.venue}</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Date & Time</p>
                    <p className="font-semibold text-neutral-800 flex items-center space-x-1.5">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                      <span>{selectedEvent.date}</span>
                    </p>
                    <p className="font-medium text-neutral-500 pl-5">{selectedEvent.time}</p>
                  </div>
                </div>

                {/* Event Description */}
                <div className="space-y-2">
                  <h4 className="font-bold text-ink text-sm">About this Event</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    {selectedEvent.longDescription}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedEvent.tags.map(tag => (
                      <span key={tag} className="bg-neutral-100 text-neutral-600 text-[10px] px-2 py-0.5 rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Booking Form */}
                <form onSubmit={handleProceedToCheckout} className="space-y-5 border-t border-neutral-100 pt-5">
                  <h4 className="font-bold text-ink text-sm flex items-center space-x-1.5">
                    <ShoppingCart className="w-4 h-4 text-safari-green" />
                    <span>Select Ticket Tier & Quantity</span>
                  </h4>

                  {/* Tier Cards Selector */}
                  <div className="space-y-2.5">
                    {selectedEvent.pricing.map((tier, idx) => (
                      <div
                        key={tier.name}
                        onClick={() => setSelectedTierIdx(idx)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${
                          selectedTierIdx === idx
                            ? 'border-safari-green bg-emerald-50/10'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="space-y-1 max-w-[70%]">
                          <p className="font-bold text-sm text-ink">{tier.name}</p>
                          <p className="text-[11px] text-neutral-500 leading-normal">{tier.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-base text-ink">Ksh {tier.price.toLocaleString()}</p>
                          <p className="text-[9px] text-safari-green font-bold uppercase tracking-wider">Available</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Ticket Quantity Selector */}
                  <div className="flex items-center justify-between bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                    <div>
                      <p className="font-bold text-xs text-ink">How many tickets?</p>
                      <p className="text-[10px] text-neutral-400">Limit 10 tickets per transaction</p>
                    </div>
                    <div className="flex items-center space-x-3 bg-white border border-neutral-200 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange('dec', 10)}
                        className="p-1.5 text-neutral-500 hover:text-ink hover:bg-neutral-50 rounded-lg transition-all"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-sm text-ink w-6 text-center">{ticketQty}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange('inc', 10)}
                        className="p-1.5 text-neutral-500 hover:text-ink hover:bg-neutral-50 rounded-lg transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Personal Contact Details */}
                  <div className="space-y-4 pt-2">
                    <h5 className="font-bold text-ink text-xs">Ticket Holder Details</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5">
                        <label htmlFor="userName" className="text-[11px] font-semibold text-neutral-600 block">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            id="userName"
                            type="text"
                            placeholder="e.g. Kennedy Ochieng"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-safari-green transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="userPhone" className="text-[11px] font-semibold text-neutral-600 block">
                          M-Pesa Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            id="userPhone"
                            type="text"
                            placeholder="e.g. 0712345678"
                            value={userPhone}
                            onChange={(e) => setUserPhone(e.target.value)}
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-safari-green transition-all"
                            required
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  {checkoutError && (
                    <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl">
                      {checkoutError}
                    </div>
                  )}

                  {/* Order summary button */}
                  <div className="pt-2">
                    <button
                      id="proceed-to-payment-btn"
                      type="submit"
                      className="w-full bg-safari-green hover:opacity-95 text-white font-black text-sm py-4 rounded-2xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <span>Proceed to Lipa na M-Pesa</span>
                      <span>•</span>
                      <span className="font-mono">
                        Ksh {(selectedEvent.pricing[selectedTierIdx].price * ticketQty).toLocaleString()}
                      </span>
                    </button>
                  </div>

                </form>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
