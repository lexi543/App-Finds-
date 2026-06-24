import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Mail, Lock, User, Phone, LogOut, CheckCircle, AlertCircle, Key, FileText, Sparkles, Edit2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'signup' | 'profile';
}

const AVATARS = ['🦁', '🐆', '🐘', '🦏', '🦅', '🦓', '🦒', '🦩', '🦊', '🐻', '🐼', '🐨'];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialTab = 'login' }) => {
  const { user, profile, signUp, logIn, logOut, resetPassword, updateProfileData } = useAuth();
  
  const [tab, setTab] = useState<'login' | 'signup' | 'reset' | 'profile' | 'edit-profile'>(
    user ? 'profile' : initialTab === 'profile' ? 'login' : initialTab
  );
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Edit Profile States
  const [editName, setEditName] = useState(profile?.displayName || '');
  const [editPhone, setEditPhone] = useState(profile?.phone || '');
  const [editBio, setEditBio] = useState(profile?.bio || '');
  const [editAvatar, setEditAvatar] = useState(profile?.avatar || '🦁');
  
  // Message & Error States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync tab with user and initialTab on open
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setTab('profile');
      } else {
        setTab(initialTab === 'profile' ? 'login' : initialTab);
      }
      setError('');
      setSuccess('');
    }
  }, [isOpen, initialTab, user]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      await logIn(email, password);
      setSuccess('Logged in successfully!');
      setTimeout(() => {
        onClose();
        setError('');
        setSuccess('');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await signUp(email, password, displayName, phoneNumber);
      setSuccess('Account created successfully!');
      setTimeout(() => {
        onClose();
        setError('');
        setSuccess('');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to register account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      await resetPassword(email);
      setSuccess('Password reset link sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      await updateProfileData({
        displayName: editName,
        phone: editPhone,
        bio: editBio,
        avatar: editAvatar
      });
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        setTab('profile');
        setSuccess('');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = () => {
    if (profile) {
      setEditName(profile.displayName);
      setEditPhone(profile.phone);
      setEditBio(profile.bio);
      setEditAvatar(profile.avatar);
      setTab('edit-profile');
    }
  };

  const handleLogout = async () => {
    setError('');
    setSuccess('');
    try {
      await logOut();
      setTab('login');
      onClose();
    } catch (err: any) {
      setError('Failed to log out.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs"
      />

      {/* Modal Dialog Box */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="relative bg-bg-cream rounded-[28px] border border-black/5 shadow-2xl w-full max-w-md overflow-hidden font-sans z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header decoration */}
        <div className="h-1.5 w-full flex">
          <div className="bg-black flex-1"></div>
          <div className="bg-kenya-red flex-1"></div>
          <div className="bg-safari-green flex-1"></div>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-ink hover:bg-neutral-100 p-2 rounded-full transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto p-6 sm:p-8 flex-1">
          
          {/* Notification Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-100 p-3.5 rounded-xl flex items-center space-x-2.5 text-xs text-kenya-red font-medium mb-5"
              >
                <AlertCircle className="w-4.5 h-4.5 text-kenya-red flex-shrink-0" />
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl flex items-center space-x-2.5 text-xs text-safari-green font-bold mb-5"
              >
                <CheckCircle className="w-4.5 h-4.5 text-safari-green flex-shrink-0" />
                <span className="leading-relaxed">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB: LOGIN */}
          {tab === 'login' && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-center">
                <div className="inline-flex items-center justify-center bg-emerald-50 text-safari-green p-3.5 rounded-2xl mb-2">
                  <Key className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-ink tracking-tight">Welcome Back</h3>
                <p className="text-xs text-neutral-500 leading-normal max-w-xs mx-auto">
                  Log in to manage your bookings and view your downloaded secure tickets.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink block">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. john@domain.com"
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-sm text-ink placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-safari-green transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-ink block">Password</label>
                    <button 
                      type="button" 
                      onClick={() => setTab('reset')}
                      className="text-[11px] font-bold text-safari-green hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-sm text-ink placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-safari-green transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-safari-green hover:opacity-95 text-white font-black text-sm py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Logging in...' : 'Sign In'}</span>
                </button>
              </form>

              <div className="text-center text-xs text-neutral-500 pt-2 border-t border-neutral-100">
                Don't have an account?{' '}
                <button 
                  onClick={() => setTab('signup')}
                  className="text-safari-green font-bold hover:underline cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </div>
          )}

          {/* TAB: SIGNUP */}
          {tab === 'signup' && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-center">
                <div className="inline-flex items-center justify-center bg-emerald-50 text-safari-green p-3.5 rounded-2xl mb-2">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-ink tracking-tight">Create Account</h3>
                <p className="text-xs text-neutral-500 leading-normal max-w-xs mx-auto">
                  Register for instant ticket updates and automated Lipa na M-Pesa checkouts.
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink block">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Kennedy Ochieng"
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-sm text-ink placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-safari-green transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink block">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. kennedy@domain.com"
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-sm text-ink placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-safari-green transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink block">Safaricom Mobile (M-Pesa)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. 0712345678"
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-sm text-ink placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-safari-green transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink block">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-sm text-ink placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-safari-green transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-safari-green hover:opacity-95 text-white font-black text-sm py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Registering...' : 'Sign Up'}</span>
                </button>
              </form>

              <div className="text-center text-xs text-neutral-500 pt-2 border-t border-neutral-100">
                Already have an account?{' '}
                <button 
                  onClick={() => setTab('login')}
                  className="text-safari-green font-bold hover:underline cursor-pointer"
                >
                  Log In
                </button>
              </div>
            </div>
          )}

          {/* TAB: RESET PASSWORD */}
          {tab === 'reset' && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-center">
                <div className="inline-flex items-center justify-center bg-emerald-50 text-safari-green p-3.5 rounded-2xl mb-2">
                  <Key className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-ink tracking-tight">Reset Password</h3>
                <p className="text-xs text-neutral-500 leading-normal max-w-xs mx-auto">
                  Enter your email address and we'll send a password recovery link.
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink block">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. john@domain.com"
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-sm text-ink placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-safari-green transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-safari-green hover:opacity-95 text-white font-black text-sm py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Sending link...' : 'Send Recovery Email'}</span>
                </button>
              </form>

              <div className="text-center text-xs text-neutral-500 pt-2 border-t border-neutral-100">
                Back to{' '}
                <button 
                  onClick={() => setTab('login')}
                  className="text-safari-green font-bold hover:underline cursor-pointer"
                >
                  Log In
                </button>
              </div>
            </div>
          )}

          {/* TAB: PROFILE MANAGEMENT */}
          {tab === 'profile' && profile && (
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="bg-gradient-to-br from-[#FFF9E6] to-[#FFF1C5] p-5 rounded-3xl border border-[#FFB800]/20 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
                <span className="text-5xl mb-3.5 select-none filter drop-shadow-sm">{profile.avatar}</span>
                <h4 className="text-lg font-black text-ink">{profile.displayName}</h4>
                <p className="text-xs text-neutral-500 font-mono mt-0.5">{profile.email}</p>
                <div className="bg-white/70 backdrop-blur-xs px-3 py-1 rounded-full text-[10px] font-bold text-safari-green border border-emerald-500/10 mt-3.5 uppercase tracking-wide">
                  TIKETI MEMBER
                </div>
              </div>

              {/* Bio & Details list */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">Bio Description</span>
                  <p className="text-xs text-neutral-700 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-100 italic">
                    "{profile.bio}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100 space-y-1">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">Phone Number</span>
                    <span className="text-xs font-bold text-ink flex items-center space-x-1.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{profile.phone || 'Not set'}</span>
                    </span>
                  </div>
                  <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-100 space-y-1">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">Member Since</span>
                    <span className="text-xs font-bold text-ink flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Controls */}
              <div className="space-y-3 pt-4 border-t border-neutral-100">
                <button
                  onClick={startEditing}
                  className="w-full bg-ink text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-white/80" />
                  <span>Edit Profile Details</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full bg-red-50 hover:bg-red-100/60 text-kenya-red font-bold text-xs py-3.5 rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: EDIT PROFILE */}
          {tab === 'edit-profile' && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-black text-ink tracking-tight">Edit Profile Details</h3>
                <p className="text-xs text-neutral-500">
                  Update your contact details and customize your avatar icon.
                </p>
              </div>

              {/* Avatar Picker */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-ink block">Select Profile Character</label>
                <div className="grid grid-cols-6 gap-2 bg-neutral-50 p-3 rounded-2xl border border-neutral-100 max-h-[140px] overflow-y-auto">
                  {AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setEditAvatar(emoji)}
                      className={`text-2xl p-1.5 rounded-xl transition-all filter hover:scale-115 active:scale-95 cursor-pointer ${
                        editAvatar === emoji
                          ? 'bg-emerald-100 ring-2 ring-safari-green'
                          : 'hover:bg-neutral-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink block">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-sm text-ink placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-safari-green transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink block">Safaricom Phone</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="e.g. 0712345678"
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-3 text-sm text-ink placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-safari-green transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink block">Bio Description</label>
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Short bio description..."
                    rows={3}
                    maxLength={160}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-ink placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-safari-green transition-all resize-none font-sans"
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setTab('profile')}
                    className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-ink font-bold text-xs py-3.5 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-safari-green hover:opacity-95 text-white font-black text-xs py-3.5 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
};
