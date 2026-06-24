import { useState, useEffect } from 'react';
import { Event, Ticket } from './types';
import EventDiscovery from './components/EventDiscovery';
import MpesaSimulator from './components/MpesaSimulator';
import TicketDownloader from './components/TicketDownloader';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Ticket as TicketIcon, FolderHeart, Calendar, MapPin, ArrowLeft, Trash2, 
  User as UserIcon, LogIn
} from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { AuthModal } from './components/AuthModal';
import { collection, doc, setDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { db } from './lib/firebase';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'discovery' | 'checkout' | 'ticket' | 'wallet'>('discovery');
  
  // Auth Integration
  const { user, profile } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup' | 'profile'>('login');

  // Checkout Context
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedTier, setSelectedTier] = useState<{ name: string; price: number } | null>(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [checkoutUserName, setCheckoutUserName] = useState('');
  const [checkoutUserPhone, setCheckoutUserPhone] = useState('');

  // Generated/Saved Tickets Wallet (Persistent locally & synced with Firestore)
  const [ticketWallet, setTicketWallet] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);

  // Synchronize local guest tickets and fetch cloud tickets on login/logout
  useEffect(() => {
    const syncAndFetchTickets = async () => {
      if (!user) {
        // If not logged in, load only guest-specific tickets
        const savedTickets = localStorage.getItem('kenyan_ticket_wallet_guest') || localStorage.getItem('kenyan_ticket_wallet');
        if (savedTickets) {
          try {
            // Keep only tickets with no userId to keep information safe for different users
            const parsedTickets: Ticket[] = JSON.parse(savedTickets);
            const guestTickets = parsedTickets.filter(t => !t.userId);
            setTicketWallet(guestTickets);
          } catch (e) {
            setTicketWallet([]);
          }
        } else {
          setTicketWallet([]);
        }
        return;
      }
      
      try {
        // 1. Fetch current local guest/unassigned tickets (checking both partitioned and older legacy key)
        const guestData = localStorage.getItem('kenyan_ticket_wallet_guest') || localStorage.getItem('kenyan_ticket_wallet');
        let localTickets: Ticket[] = [];
        if (guestData) {
          try {
            localTickets = JSON.parse(guestData);
          } catch (e) {
            console.error(e);
          }
        }

        // 2. Identify local guest tickets (no userId) and upload them securely to Firestore
        const guestTickets = localTickets.filter(t => !t.userId);
        if (guestTickets.length > 0) {
          const batch = writeBatch(db);
          guestTickets.forEach(ticket => {
            const ticketRef = doc(db, 'tickets', ticket.id);
            const updatedTicket = { ...ticket, userId: user.uid };
            batch.set(ticketRef, updatedTicket);
          });
          await batch.commit();
          
          // Clear legacy guest tickets to keep the space fresh and secure
          localStorage.removeItem('kenyan_ticket_wallet_guest');
          localStorage.removeItem('kenyan_ticket_wallet');
        }

        // 3. Fetch all user-specific tickets from Firestore to get the secure, unified list
        const q = query(collection(db, 'tickets'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const cloudTickets: Ticket[] = [];
        querySnapshot.forEach((doc) => {
          cloudTickets.push(doc.data() as Ticket);
        });

        // Sort cloud tickets descending by ID
        cloudTickets.sort((a, b) => b.id.localeCompare(a.id));

        // 4. Update state and the user-partitioned local storage space
        setTicketWallet(cloudTickets);
        localStorage.setItem(`kenyan_ticket_wallet_${user.uid}`, JSON.stringify(cloudTickets));
      } catch (err) {
        console.error('Error synchronizing tickets with Firestore:', err);
      }
    };

    syncAndFetchTickets();
  }, [user]);

  // Save to localStorage whenever wallet changes, respecting user partition
  const saveWallet = (updatedWallet: Ticket[]) => {
    setTicketWallet(updatedWallet);
    const key = user ? `kenyan_ticket_wallet_${user.uid}` : 'kenyan_ticket_wallet_guest';
    localStorage.setItem(key, JSON.stringify(updatedWallet));
  };

  const handleInitiateCheckout = (
    event: Event,
    tier: { name: string; price: number },
    quantity: number,
    name: string,
    phone: string
  ) => {
    setSelectedEvent(event);
    setSelectedTier(tier);
    setTicketQuantity(quantity);
    
    // Auto-populate from profile if logged in
    setCheckoutUserName(profile?.displayName || name);
    setCheckoutUserPhone(profile?.phone || phone);
    
    setCurrentScreen('checkout');
  };

  const handlePaymentSuccess = async (mpesaRef: string, finalPhone: string) => {
    if (!selectedEvent || !selectedTier) return;

    const newTicketId = `TKT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const timestampStr = new Date().toLocaleString('en-KE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const newTicket: Ticket = {
      id: newTicketId,
      eventId: selectedEvent.id,
      eventTitle: selectedEvent.title,
      eventDate: selectedEvent.date,
      eventTime: selectedEvent.time,
      eventVenue: selectedEvent.venue,
      eventCity: selectedEvent.city,
      ticketTypeName: selectedTier.name,
      quantity: ticketQuantity,
      pricePerTicket: selectedTier.price,
      totalPaid: selectedTier.price * ticketQuantity,
      mpesaRef: mpesaRef,
      purchasedAt: timestampStr + ' at ' + selectedEvent.venue,
      userName: checkoutUserName,
      userPhone: finalPhone,
      qrValue: `VERIFIED-GATEPASS:${newTicketId}:${mpesaRef}:${selectedTier.name}:${ticketQuantity}`
    };

    // If logged in, back up to Firestore cloud
    if (user) {
      newTicket.userId = user.uid;
      try {
        await setDoc(doc(db, 'tickets', newTicketId), newTicket);
      } catch (err) {
        console.error('Failed to back up ticket to Firestore:', err);
      }
    }

    // Update state and persistence
    const updatedWallet = [newTicket, ...ticketWallet];
    saveWallet(updatedWallet);

    // Transition to active single ticket download screen
    setActiveTicket(newTicket);
    setCurrentScreen('ticket');

    // Reset temporary checkout context
    setSelectedEvent(null);
    setSelectedTier(null);
  };

  const handleClearWallet = () => {
    if (window.confirm('Are you sure you want to clear your Ticket Wallet? This will permanently erase your purchased tickets.')) {
      saveWallet([]);
    }
  };

  const viewSavedTicket = (ticket: Ticket) => {
    setActiveTicket(ticket);
    setCurrentScreen('ticket');
  };

  return (
    <div className="min-h-screen bg-bg-cream text-ink flex flex-col font-sans">
      
      {/* Visual Identity Header - Kenya flag color accents at the absolute top */}
      <div className="relative">
        <div className="h-1.5 w-full flex">
          <div className="bg-black flex-1"></div>
          <div className="bg-kenya-red flex-1"></div>
          <div className="bg-safari-green flex-1"></div>
        </div>

        <header className="bg-white border-b-2 border-black/5 px-4 sm:px-10 py-5 flex justify-between items-center max-w-7xl mx-auto w-full rounded-b-3xl shadow-xs">
          <button 
            onClick={() => setCurrentScreen('discovery')}
            className="flex items-center space-x-2.5 hover:opacity-85 transition-opacity text-left cursor-pointer"
          >
            <div className="flex items-center gap-1.5 font-black text-2xl tracking-tighter text-safari-green">
              TIKETI<span className="w-2.5 h-2.5 bg-kenya-red rounded-full inline-block"></span>KE
            </div>
          </button>

          {/* Navigation Options */}
          <div className="flex items-center space-x-2.5">
            <button
              id="wallet-toggle-btn"
              onClick={() => setCurrentScreen(currentScreen === 'wallet' ? 'discovery' : 'wallet')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer border ${
                currentScreen === 'wallet'
                  ? 'bg-ink text-white border-ink shadow-md'
                  : 'bg-white hover:bg-neutral-50 border-neutral-200 text-ink'
              }`}
            >
              <FolderHeart className="w-4 h-4" />
              <span className="hidden md:inline">My Ticket Wallet</span>
              {ticketWallet.length > 0 && (
                <span className="bg-safari-green text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {ticketWallet.length}
                </span>
              )}
            </button>

            {/* Auth Profile / Login Button */}
            {profile ? (
              <button
                id="profile-trigger-btn"
                onClick={() => {
                  setAuthModalTab('profile');
                  setIsAuthModalOpen(true);
                }}
                className="px-4 py-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-2xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer text-ink shadow-xs"
              >
                <span className="text-sm leading-none">{profile.avatar || '🦁'}</span>
                <span className="hidden sm:inline max-w-[90px] truncate">{profile.displayName}</span>
              </button>
            ) : (
              <button
                id="auth-trigger-btn"
                onClick={() => {
                  setAuthModalTab('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-4 py-2.5 bg-safari-green hover:opacity-95 text-white rounded-2xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
              >
                <UserIcon className="w-4 h-4 text-white" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </header>
      </div>

      {/* Main Context Stage */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-10 py-6">
        <AnimatePresence mode="wait">
          
          {/* Discovery View */}
          {currentScreen === 'discovery' && (
            <motion.div
              key="discovery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <EventDiscovery onInitiateCheckout={handleInitiateCheckout} />
            </motion.div>
          )}

          {/* Active Checkout Simulator View */}
          {currentScreen === 'checkout' && selectedEvent && selectedTier && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="py-6 max-w-lg mx-auto space-y-6"
            >
              {/* Back Button */}
              <button
                onClick={() => setCurrentScreen('discovery')}
                className="flex items-center space-x-1.5 text-xs text-neutral-500 hover:text-ink font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Change ticket tier / selection</span>
              </button>

              {/* Order Summary Overview Card */}
              <div className="bg-white p-6 rounded-[24px] border border-black/5 shadow-xs space-y-4 font-sans">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] bg-emerald-50 text-safari-green font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider block w-max mb-2">
                      Selected Order
                    </span>
                    <h4 className="font-extrabold text-ink text-sm">{selectedEvent.title}</h4>
                    <p className="text-xs text-neutral-500 mt-1 flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{selectedEvent.date}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Tier</p>
                    <p className="font-bold text-[#FFB800] text-xs uppercase">{selectedTier.name}</p>
                  </div>
                </div>

                <div className="border-t border-neutral-100 pt-3 flex justify-between items-center text-xs">
                  <div className="text-neutral-500 font-medium">
                    Ksh {selectedTier.price.toLocaleString()} x {ticketQuantity}
                  </div>
                  <div className="font-black text-ink text-sm">
                    Ksh {(selectedTier.price * ticketQuantity).toLocaleString()}.00
                  </div>
                </div>
              </div>

              {/* Payment Simulator Gateway */}
              <MpesaSimulator
                amount={selectedTier.price * ticketQuantity}
                onPaymentSuccess={handlePaymentSuccess}
                onCancel={() => {
                  if (confirm('Cancel payment process? Your ticket reservation will be lost.')) {
                    setCurrentScreen('discovery');
                  }
                }}
              />
            </motion.div>
          )}

          {/* Generated Digital Ticket Stub Downloader View */}
          {currentScreen === 'ticket' && activeTicket && (
            <motion.div
              key="ticket"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <TicketDownloader 
                ticket={activeTicket} 
                onBackToDashboard={() => {
                  setActiveTicket(null);
                  setCurrentScreen('discovery');
                }}
              />
            </motion.div>
          )}

          {/* Local Ticket Wallet View */}
          {currentScreen === 'wallet' && (
            <motion.div
              key="wallet"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-3xl mx-auto space-y-6 font-sans"
            >
              <div className="flex justify-between items-center border-b border-black/5 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-ink tracking-tight">My Ticket Wallet</h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Your purchased event tickets are saved locally in this browser cache.
                  </p>
                </div>
                {ticketWallet.length > 0 && (
                  <button
                    onClick={handleClearWallet}
                    className="text-kenya-red hover:text-red-700 bg-red-50 hover:bg-red-100/50 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear Wallet</span>
                  </button>
                )}
              </div>

              {ticketWallet.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ticketWallet.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => viewSavedTicket(t)}
                      className="bg-white p-5 rounded-[20px] border border-black/5 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] text-neutral-400 font-mono">
                          <span>ID: {t.id}</span>
                          <span className="bg-emerald-50 text-safari-green font-bold px-2.5 py-0.5 rounded-full uppercase">
                            Approved
                          </span>
                        </div>
                        <h3 className="font-bold text-ink text-sm line-clamp-1">{t.eventTitle}</h3>
                        <p className="text-[11px] text-[#FFB800] font-black uppercase tracking-wider">{t.ticketTypeName}</p>
                      </div>

                      <div className="space-y-2 border-t border-neutral-100 pt-3 text-[11px] text-neutral-500">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{t.eventDate}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="truncate">{t.eventVenue}, {t.eventCity}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center border-t border-neutral-100 pt-3 text-[11px]">
                        <span className="text-neutral-400">Qty: {t.quantity} • Paid KES {t.totalPaid.toLocaleString()}</span>
                        <span className="text-safari-green font-bold flex items-center space-x-0.5">
                          <span>View Ticket</span>
                          <span className="text-xs">➔</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-12 text-center rounded-[24px] border border-black/5 space-y-3 shadow-xs">
                  <TicketIcon className="w-12 h-12 text-neutral-300 mx-auto" />
                  <h3 className="font-bold text-ink text-base">Your wallet is empty</h3>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                    You haven't bought any tickets yet. Explore active events and checkout using Lipa na M-Pesa to populate your wallet!
                  </p>
                  <button
                    onClick={() => setCurrentScreen('discovery')}
                    className="bg-safari-green hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Explore Events
                  </button>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Styled Footer */}
      <footer className="bg-ink text-neutral-400 font-sans mt-12 py-8 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-10 text-xs text-center space-y-3">
          <div className="flex justify-center items-center space-x-2 text-[10px] tracking-widest font-mono text-neutral-500">
            <span>SECURE PAYMENT PROCESSED IN SHILLINGS (KES)</span>
          </div>
          <p>© {new Date().getFullYear()} TIKETI ● KE. Renders custom gate passes with real-time browser-based Canvas rendering & QR Code algorithms.</p>
          <div className="flex justify-center space-x-4 text-neutral-500 text-[11px] font-medium pt-1">
            <span className="hover:text-neutral-300 transition-colors">Nairobi</span>
            <span>•</span>
            <span className="hover:text-neutral-300 transition-colors">Mombasa</span>
            <span>•</span>
            <span className="hover:text-neutral-300 transition-colors">Kisumu</span>
            <span>•</span>
            <span className="hover:text-neutral-300 transition-colors">Nakuru</span>
            <span>•</span>
            <span className="hover:text-neutral-300 transition-colors">Eldoret</span>
          </div>
        </div>
      </footer>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialTab={authModalTab}
      />

    </div>
  );
}
