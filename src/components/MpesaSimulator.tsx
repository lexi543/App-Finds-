import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, CheckCircle, AlertCircle, RefreshCw, Smartphone, Key, Info, HelpCircle } from 'lucide-react';

interface MpesaSimulatorProps {
  amount: number;
  onPaymentSuccess: (mpesaRef: string, phone: string) => void;
  onCancel: () => void;
}

export default function MpesaSimulator({ amount, onPaymentSuccess, onCancel }: MpesaSimulatorProps) {
  const [phoneNumber, setPhoneNumber] = useState('0712345678');
  const [error, setError] = useState('');
  const [paymentStep, setPaymentStep] = useState<'input' | 'stk-sent' | 'stk-popup' | 'processing' | 'success'>('input');
  const [mpesaPin, setMpesaPin] = useState('');
  const [countdown, setCountdown] = useState(15);
  const [simulatedRef, setSimulatedRef] = useState('');
  const [showSms, setShowSms] = useState(false);
  const [manualReceipt, setManualReceipt] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'stk' | 'manual'>('stk');

  // Generate a random M-Pesa Reference like QHG893HJDS
  const generateMpesaRef = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    // Safaricom codes: e.g., T, R, S, Q, K + letters/digits
    const prefixes = ['S', 'T', 'R', 'Q'];
    result += prefixes[Math.floor(Math.random() * prefixes.length)];
    for (let i = 0; i < 9; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  useEffect(() => {
    if (paymentStep === 'stk-sent') {
      const timer = setTimeout(() => {
        setPaymentStep('stk-popup');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [paymentStep]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (paymentStep === 'stk-popup' && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && paymentStep === 'stk-popup') {
      setPaymentStep('input');
      setError('M-Pesa STK Push timed out. Please try again.');
      setCountdown(15);
    }
    return () => clearInterval(interval);
  }, [paymentStep, countdown]);

  const validatePhone = (phone: string) => {
    // Kenyan format: 07xxxxxxxx, 01xxxxxxxx, +2547xxxxxxxx, +2541xxxxxxxx, 2547xxxxxxxx, 2541xxxxxxxx
    const cleaned = phone.replace(/\s+/g, '');
    const regex = /^(?:\+254|254|0)?([71][0-9]{8})$/;
    return regex.test(cleaned);
  };

  const formatCleanPhone = (phone: string) => {
    const cleaned = phone.replace(/\s+/g, '');
    const match = cleaned.match(/^(?:\+254|254|0)?([71][0-9]{8})$/);
    if (match) {
      return `0${match[1]}`;
    }
    return phone;
  };

  const handleInitiateSTK = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePhone(phoneNumber)) {
      setError('Please enter a valid Safaricom number (e.g. 07xxxxxxxx or 01xxxxxxxx)');
      return;
    }

    setPaymentStep('stk-sent');
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mpesaPin.length !== 4 && mpesaPin.length !== 5) {
      alert('M-Pesa PIN is usually 4 or 5 digits.');
      return;
    }

    setPaymentStep('processing');
    const ref = generateMpesaRef();
    setSimulatedRef(ref);

    // Simulate Network delay for transaction callback
    setTimeout(() => {
      setPaymentStep('success');
      setShowSms(true);
      // Trigger actual transaction success
      setTimeout(() => {
        onPaymentSuccess(ref, formatCleanPhone(phoneNumber));
      }, 3500); // give time for the user to see the Safaricom SMS
    }, 2500);
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualReceipt.trim() || manualReceipt.length < 8) {
      setError('Please enter a valid 10-character M-Pesa transaction code.');
      return;
    }
    setPaymentStep('processing');
    const cleanRef = manualReceipt.trim().toUpperCase();
    setTimeout(() => {
      setPaymentStep('success');
      setShowSms(true);
      setTimeout(() => {
        onPaymentSuccess(cleanRef, 'Manual Verification');
      }, 3500);
    }, 2000);
  };

  const formattedNumber = formatCleanPhone(phoneNumber);

  return (
    <div id="mpesa-simulator-container" className="bg-white rounded-[24px] border border-black/5 shadow-md overflow-hidden max-w-md w-full mx-auto relative">
      
      {/* Dynamic Safaricom SMS Notification Slide down */}
      <AnimatePresence>
        {showSms && (
          <motion.div
            initial={{ y: -120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -120, opacity: 0 }}
            className="absolute top-2 left-2 right-2 z-50 bg-ink text-white p-4 rounded-2xl shadow-2xl border border-neutral-800 text-xs font-mono"
            style={{ pointerEvents: 'auto' }}
          >
            <div className="flex justify-between items-center mb-1 text-[10px] text-neutral-400 font-sans">
              <span className="font-semibold text-safari-green">MPESA (Safaricom)</span>
              <span>Just now</span>
            </div>
            <p className="leading-relaxed">
              <strong className="text-white">{simulatedRef}</strong> Confirmed. Ksh {amount.toLocaleString()}.00 sent to <strong className="text-white">KENYAN TICKETS</strong> on {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. M-PESA balance is Ksh 14,830.00. Transaction cost Ksh 0.00.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-gradient-to-r from-safari-green to-[#015e3a] px-6 py-5 text-white flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-white/10 p-2 rounded-xl">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-sans font-bold tracking-tight text-lg text-white">M-Pesa Checkout</h3>
            <p className="text-[11px] text-emerald-100 font-mono tracking-wider">SAFARICOM GATEWAY SIMULATOR</p>
          </div>
        </div>
        <button 
          onClick={onCancel}
          className="text-white/80 hover:text-white font-sans text-xs bg-black/20 hover:bg-black/30 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* Selector Tabs */}
      {paymentStep === 'input' && (
        <div className="flex border-b border-neutral-100 bg-neutral-50 p-1">
          <button
            onClick={() => { setPaymentMethod('stk'); setError(''); }}
            className={`flex-1 py-3 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
              paymentMethod === 'stk'
                ? 'bg-white text-ink shadow-xs border border-neutral-200/50'
                : 'text-neutral-500 hover:text-ink'
            }`}
          >
            M-Pesa STK Push
          </button>
          <button
            onClick={() => { setPaymentMethod('manual'); setError(''); }}
            className={`flex-1 py-3 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
              paymentMethod === 'manual'
                ? 'bg-white text-ink shadow-xs border border-neutral-200/50'
                : 'text-neutral-500 hover:text-ink'
            }`}
          >
            Paybill / Till
          </button>
        </div>
      )}

      {/* Body Content */}
      <div className="p-6">
        
        {/* Step 1: Inputting Details */}
        {paymentStep === 'input' && paymentMethod === 'stk' && (
          <form onSubmit={handleInitiateSTK} className="space-y-5">
            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl flex items-start space-x-3 text-xs text-neutral-700">
              <Info className="w-4.5 h-4.5 text-safari-green flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed font-sans">
                Enter your Safaricom number. We will send an <strong className="text-ink font-bold">STK Push prompt</strong> directly to your phone. Simply enter your M-Pesa PIN when prompted to complete the KES <strong className="text-safari-green font-extrabold">{amount.toLocaleString()}</strong> purchase securely.
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="phoneNumber" className="text-xs font-bold text-ink block font-sans">
                Safaricom Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-mono text-sm font-medium">
                  +254
                </span>
                <input
                  id="phoneNumber"
                  type="text"
                  placeholder="712345678"
                  value={phoneNumber.replace(/^\+254|^254/, '')}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-16 pr-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-safari-green focus:border-transparent transition-all"
                  required
                />
              </div>
              <span className="text-[10px] text-neutral-400 font-sans block mt-1">
                Supported formats: 07xxxxxxxx, 01xxxxxxxx or 254xxxxxxxxx
              </span>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl flex items-center space-x-2 font-sans">
                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              id="initiate-stk-btn"
              type="submit"
              className="w-full bg-safari-green hover:opacity-95 active:scale-98 text-white font-sans font-bold text-sm py-4 rounded-2xl transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>Lipa na M-Pesa (Ksh {amount.toLocaleString()})</span>
            </button>
          </form>
        )}

        {/* Manual Method Instructions */}
        {paymentStep === 'input' && paymentMethod === 'manual' && (
          <form onSubmit={handleManualVerify} className="space-y-5 font-sans">
            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-xs space-y-3 text-neutral-700">
                <p className="font-bold text-ink border-b border-neutral-100 pb-2 flex items-center space-x-1.5 text-xs">
                  <span className="bg-safari-green text-white w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px]">1</span>
                  <span>How to Pay via Paybill:</span>
                </p>
                <ol className="list-decimal list-inside space-y-2 leading-relaxed pl-1">
                  <li>Go to your M-Pesa Menu or open the <strong className="text-safari-green font-bold">M-PESA App</strong></li>
                  <li>Select <strong className="text-ink font-bold">Lipa Na M-Pesa</strong> then <strong className="text-ink font-bold">Paybill</strong></li>
                  <li>Enter Business No: <strong className="text-ink font-bold bg-neutral-200 px-1.5 py-0.5 rounded">303030</strong></li>
                  <li>Enter Account No: <strong className="text-ink font-bold bg-neutral-200 px-1.5 py-0.5 rounded">TICKETS</strong></li>
                  <li>Enter Amount: <strong className="text-ink font-bold">Ksh {amount.toLocaleString()}</strong></li>
                  <li>Enter your M-Pesa PIN and authorize payment</li>
                </ol>
              </div>

              <div className="space-y-2">
                <label htmlFor="manualReceipt" className="text-xs font-bold text-ink block">
                  Step 2: Enter M-Pesa Receipt Code
                </label>
                <input
                  id="manualReceipt"
                  type="text"
                  placeholder="E.g. QHG893HJDS"
                  value={manualReceipt}
                  onChange={(e) => setManualReceipt(e.target.value)}
                  className="w-full px-4 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl font-mono text-sm text-center tracking-widest placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-safari-green focus:border-transparent transition-all uppercase"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              id="verify-payment-btn"
              type="submit"
              className="w-full bg-safari-green hover:opacity-95 active:scale-98 text-white font-bold text-sm py-4 rounded-2xl transition-all shadow-sm cursor-pointer"
            >
              Verify Payment Receipt
            </button>
          </form>
        )}

        {/* Step 2: STK Sent Animation */}
        {paymentStep === 'stk-sent' && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-neutral-100 border-t-safari-green rounded-full animate-spin"></div>
              <Phone className="w-6 h-6 text-safari-green absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-sans font-bold text-ink text-base">Initiating STK Push...</h4>
              <p className="font-sans text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                We are sending a Lipa na M-Pesa transaction popup to <span className="font-semibold font-mono text-ink">{formattedNumber}</span>. Please keep your phone unlocked.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Replica SIM Toolkit Prompt Dialog */}
        {paymentStep === 'stk-popup' && (
          <div className="py-2 flex flex-col items-center justify-center">
            
            {/* The SIM Toolkit Overlay Emulator */}
            <div className="w-full max-w-sm bg-neutral-100 rounded-2xl border-2 border-neutral-300 shadow-2xl overflow-hidden font-mono text-sm text-neutral-800 mb-4 animate-bounce">
              <div className="bg-ink text-white px-4 py-2.5 flex justify-between items-center text-xs font-bold">
                <span>SIM Tool Kit</span>
                <span className="text-white bg-safari-green px-1.5 py-0.5 rounded text-[10px]">M-PESA</span>
              </div>
              
              <form onSubmit={handlePinSubmit} className="p-5 space-y-4 text-center">
                <div className="text-left space-y-1 text-xs text-neutral-700 font-sans leading-relaxed">
                  <p className="font-mono text-sm font-bold text-ink">Lipa na M-PESA</p>
                  <p>Pay KES <strong className="font-mono text-ink">{amount.toLocaleString()}.00</strong> to</p>
                  <p className="font-bold text-ink">KENYAN TICKETS</p>
                  <p className="text-[10px] text-neutral-400">Enter M-Pesa PIN:</p>
                </div>

                <div className="relative max-w-[150px] mx-auto">
                  <Key className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    placeholder="PIN"
                    maxLength={5}
                    value={mpesaPin}
                    onChange={(e) => setMpesaPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-300 rounded text-center tracking-widest text-lg font-bold focus:outline-none focus:border-neutral-500"
                    autoFocus
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 font-sans text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStep('input');
                      setError('STK Push transaction cancelled by user.');
                    }}
                    className="py-2.5 bg-neutral-200 hover:bg-neutral-300 active:scale-95 rounded text-neutral-700 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 bg-safari-green hover:opacity-90 active:scale-95 text-white font-bold rounded cursor-pointer"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>

            <p className="font-sans text-[11px] text-neutral-400 flex items-center space-x-1 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Prompt will expire in {countdown} seconds...</span>
            </p>
          </div>
        )}

        {/* Step 4: Processing Verification */}
        {paymentStep === 'processing' && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 font-sans">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-green-100 border-t-safari-green rounded-full animate-spin"></div>
              <RefreshCw className="w-6 h-6 text-safari-green absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 animate-spin-reverse" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-bold text-ink text-base">Verifying M-Pesa Callback...</h4>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                Waiting for Safaricom confirmation. Your reference number <span className="font-mono text-ink font-semibold">{simulatedRef || manualReceipt.toUpperCase()}</span> is being verified. Do not close this page.
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Success State */}
        {paymentStep === 'success' && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 font-sans">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-10 h-10 text-safari-green" />
            </motion.div>
            <div className="space-y-2">
              <h4 className="font-bold text-ink text-lg">Lipa Na M-Pesa Successful!</h4>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                Transaction <strong className="font-mono text-ink">{simulatedRef || manualReceipt.toUpperCase()}</strong> confirmed. We are generating your downloadable secure tickets now.
              </p>
              <div className="inline-flex items-center space-x-1.5 bg-emerald-50 px-3 py-1.5 rounded-full text-xs text-safari-green font-bold uppercase tracking-wider">
                <span>Preparing ticket wallet...</span>
                <RefreshCw className="w-3 h-3 animate-spin" />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
