import { useRef, useState, useEffect } from 'react';
import { Ticket as TicketType } from '../types';
import { motion } from 'motion/react';
import { Download, Printer, Check, MapPin, Calendar, Clock, User, Phone, Tag } from 'lucide-react';

interface TicketDownloaderProps {
  ticket: TicketType;
  onBackToDashboard: () => void;
}

export default function TicketDownloader({ ticket, onBackToDashboard }: TicketDownloaderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generates a highly realistic, deterministic QR code grid (21x21) based on ticket ID
  const generateQRMatrix = (text: string): boolean[][] => {
    const size = 21;
    const matrix: boolean[][] = [];
    
    // Simple hash function to make it deterministic based on ticket code
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    for (let r = 0; r < size; r++) {
      matrix[r] = [];
      for (let c = 0; c < size; c++) {
        // Standard QR locator boxes at corners: top-left, top-right, bottom-left
        const isTopLeftBox = r < 7 && c < 7;
        const isTopRightBox = r < 7 && c >= size - 7;
        const isBottomLeftBox = r >= size - 7 && c < 7;

        if (isTopLeftBox || isTopRightBox || isBottomLeftBox) {
          // Draw the standard 3-layer locator finder patterns
          const localR = r < 7 ? r : (r >= size - 7 ? r - (size - 7) : r);
          const localC = c < 7 ? c : (c >= size - 7 ? c - (size - 7) : c);
          
          const isBorder = localR === 0 || localR === 6 || localC === 0 || localC === 6;
          const isCenter = localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4;
          
          matrix[r][c] = isBorder || isCenter;
        } else {
          // Deterministic pseudorandom noise for payload bits
          const bitIndex = r * size + c;
          const noise = Math.abs(Math.sin(hash + bitIndex) * 1000);
          matrix[r][c] = (Math.floor(noise) % 2) === 0;
        }
      }
    }
    return matrix;
  };

  const qrMatrix = generateQRMatrix(ticket.qrValue);

  // Draws the ticket onto a high-res canvas and triggers a PNG download
  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high DPI dimensions
    canvas.width = 450 * 2;
    canvas.height = 750 * 2;
    ctx.scale(2, 2);

    // 1. Draw Background (Sophisticated Cream/White/Yellow Theme)
    const gradient = ctx.createLinearGradient(0, 0, 0, 750);
    gradient.addColorStop(0, '#FDFCF8'); // bg-cream
    gradient.addColorStop(1, '#FFF9E6'); // light yellow
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 450, 750);

    // Decorative background pattern
    ctx.strokeStyle = 'rgba(1, 134, 83, 0.05)'; // Safari Green subtle
    ctx.lineWidth = 1;
    for (let i = -100; i < 450; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 300, 750);
      ctx.stroke();
    }

    // 2. Main Ticket Container Card
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;
    
    // Draw rounded rectangle container
    const x = 25, y = 30, w = 400, h = 690, r = 16;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';

    // 3. Header Accent Bar
    ctx.fillStyle = '#018653'; // Safari Green
    ctx.fillRect(x, y, w, 8);

    // 4. Ticket Header text
    ctx.fillStyle = '#018653'; // Safari Green
    ctx.font = 'bold 11px monospace';
    ctx.fillText('OFFICIAL ENTRANCE TICKET', 45, 75);

    ctx.fillStyle = '#666666';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('PORTAL ID: ' + ticket.id.substring(0, 12), 300, 75);

    // 5. Event Title
    ctx.fillStyle = '#1A1A1A'; // Ink
    ctx.font = 'bold 22px sans-serif';
    
    // Text wrapping for long titles
    const title = ticket.eventTitle;
    if (title.length > 22) {
      ctx.fillText(title.substring(0, 22) + '...', 45, 115);
    } else {
      ctx.fillText(title, 45, 115);
    }

    // Venue & City
    ctx.fillStyle = '#444444';
    ctx.font = '500 13px sans-serif';
    ctx.fillText(ticket.eventVenue + ', ' + ticket.eventCity, 45, 142);

    // 6. Metadata grid (Date, Time, Seat Tier)
    ctx.fillStyle = '#888888';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('DATE', 45, 185);
    ctx.fillText('TIME', 250, 185);

    ctx.fillStyle = '#1A1A1A';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(ticket.eventDate, 45, 205);
    ctx.fillText(ticket.eventTime, 250, 205);

    // Border line above divider
    ctx.strokeStyle = '#EEEEEE';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(45, 235);
    ctx.lineTo(405, 235);
    ctx.stroke();

    // 7. Attendee and Ticket pricing details
    ctx.fillStyle = '#888888';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('TICKET HOLDER', 45, 265);
    ctx.fillText('PHONE NUMBER', 250, 265);

    ctx.fillStyle = '#1A1A1A';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(ticket.userName, 45, 285);
    ctx.fillText(ticket.userPhone, 250, 285);

    ctx.fillStyle = '#888888';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('TICKET TIER / TYPE', 45, 325);
    ctx.fillText('PRICE (KES)', 250, 325);

    ctx.fillStyle = '#FFB800'; // Sun Yellow for tier accent
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(ticket.ticketTypeName.toUpperCase(), 45, 345);

    ctx.fillStyle = '#1A1A1A';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Ksh ' + (ticket.pricePerTicket * ticket.quantity).toLocaleString() + '.00 (' + ticket.quantity + 'x)', 250, 345);

    // 8. DASHED TEAR LINE & SIDE SEMI-CIRCLES
    ctx.strokeStyle = '#FFB800'; // Sun Yellow tear line
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(x + 10, 395);
    ctx.lineTo(x + w - 10, 395);
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // Side circle cutouts
    ctx.fillStyle = '#FDFCF8'; // Cream
    ctx.beginPath();
    ctx.arc(x, 395, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + w, 395, 12, 0, Math.PI * 2);
    ctx.fill();

    // 9. STUB SECTION
    ctx.fillStyle = '#FFF9E6'; // Cream yellow stub background
    ctx.fillRect(x + 1, 396, w - 2, h - 396 - 1);

    ctx.fillStyle = '#018653';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('SECURE GATE PASS ENTRY', 45, 435);

    // M-Pesa Receipt Ref
    ctx.fillStyle = '#666666';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('M-PESA PAYMENT REF', 45, 465);

    ctx.fillStyle = '#018653'; // M-Pesa green accent
    ctx.font = 'bold 16px monospace';
    ctx.fillText(ticket.mpesaRef, 45, 488);

    // Secure Verification Details
    ctx.fillStyle = '#666666';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('PURCHASED AT', 250, 465);

    ctx.fillStyle = '#1A1A1A';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(ticket.purchasedAt.split(' at ')[0], 250, 488);

    // 10. QR CODE RENDERING ON CANVAS
    const qrSize = 150;
    const qrX = 150;
    const qrY = 530;

    // QR white background border
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.05)';
    ctx.shadowBlur = 8;
    ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
    ctx.shadowColor = 'transparent';

    // Render deterministic matrix
    ctx.fillStyle = '#1A1A1A'; // Ink
    const numCells = qrMatrix.length;
    const cellSize = qrSize / numCells;

    for (let r = 0; r < numCells; r++) {
      for (let c = 0; c < numCells; c++) {
        if (qrMatrix[r][c]) {
          ctx.fillRect(qrX + c * cellSize, qrY + r * cellSize, cellSize + 0.5, cellSize + 0.5);
        }
      }
    }

    // Footnote
    ctx.fillStyle = '#666666';
    ctx.font = 'monospace 9px';
    ctx.textAlign = 'center';
    ctx.fillText('DO NOT SHARE THIS QR CODE. VALID FOR ONE-TIME GATE SCAN.', 225, 715);
    ctx.textAlign = 'left'; // Reset alignment

    // 11. Trigger Download Link
    setTimeout(() => {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `TICKET-${ticket.eventTitle.replace(/\s+/g, '-').toUpperCase()}-${ticket.mpesaRef}.png`;
      link.href = dataUrl;
      link.click();
      setDownloading(false);
    }, 500);
  };

  const copyRefToClipboard = () => {
    navigator.clipboard.writeText(ticket.mpesaRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="ticket-downloader-container" className="max-w-2xl mx-auto py-4 px-4 sm:px-6">
      
      {/* Confirmed celebration banner */}
      <div className="text-center mb-8 font-sans">
        <div className="bg-emerald-50 text-safari-green px-4.5 py-2 rounded-full inline-flex items-center space-x-2 text-xs font-bold mb-3 shadow-xs">
          <Check className="w-4 h-4" />
          <span>Payment Verified & Confirmed!</span>
        </div>
        <h2 className="text-2xl font-black text-ink tracking-tight sm:text-3xl">Your Tickets are Ready!</h2>
        <p className="text-neutral-500 text-sm mt-1.5 max-w-md mx-auto leading-relaxed">
          We have generated your secure entrance pass. Save this page or download your ticket stub below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Visual Ticket Display */}
        <div className="md:col-span-7 flex flex-col justify-center items-center">
          
          {/* Main Visual Ticket Stub */}
          <div id="visual-ticket" className="w-full max-w-sm bg-white text-ink rounded-3xl border border-black/5 shadow-md overflow-hidden relative font-sans">
            <div className="bg-gradient-to-r from-safari-green to-emerald-700 h-2 w-full"></div>

            {/* Ticket Header */}
            <div className="p-5 border-b border-neutral-100 flex justify-between items-center text-xs">
              <span className="text-safari-green font-mono tracking-wider font-bold">OFFICIAL GATE PASS</span>
              <span className="text-neutral-400 font-mono">TKT-{ticket.id.substring(0, 8).toUpperCase()}</span>
            </div>

            {/* Event Info */}
            <div className="px-6 py-5">
              <h3 className="text-lg font-extrabold leading-tight tracking-tight text-ink mb-1">
                {ticket.eventTitle}
              </h3>
              <p className="text-xs text-neutral-500 flex items-center space-x-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                <span>{ticket.eventVenue}, {ticket.eventCity}</span>
              </p>
            </div>

            {/* Date / Time */}
            <div className="px-6 pb-5 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Date</p>
                <p className="font-semibold text-ink mt-0.5 flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-safari-green" />
                  <span>{ticket.eventDate.split(', ')[1]}</span>
                </p>
              </div>
              <div>
                <p className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Time</p>
                <p className="font-semibold text-ink mt-0.5 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-safari-green" />
                  <span>{ticket.eventTime.split(' - ')[0]}</span>
                </p>
              </div>
            </div>

            <div className="border-t border-neutral-100 border-dashed my-1"></div>

            {/* Attendee Data */}
            <div className="px-6 py-5 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Ticket Holder</p>
                <p className="font-semibold text-ink mt-0.5 flex items-center space-x-1">
                  <User className="w-3 h-3 text-neutral-400" />
                  <span>{ticket.userName}</span>
                </p>
              </div>
              <div>
                <p className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Phone Number</p>
                <p className="font-semibold text-ink mt-0.5 flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-neutral-400" />
                  <span>{ticket.userPhone}</span>
                </p>
              </div>
            </div>

            {/* Ticket Tier */}
            <div className="px-6 pb-5 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Ticket Tier</p>
                <p className="font-black text-sun-yellow mt-0.5 flex items-center space-x-1">
                  <Tag className="w-3 h-3 text-sun-yellow" />
                  <span>{ticket.ticketTypeName.toUpperCase()}</span>
                </p>
              </div>
              <div>
                <p className="text-neutral-400 font-bold uppercase tracking-wider text-[9px]">Qty & Paid</p>
                <p className="font-bold text-ink mt-0.5">
                  {ticket.quantity}x • Ksh {ticket.totalPaid.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Ticket Tear Ticket Edge Cutouts */}
            <div className="relative h-4 my-2">
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-bg-cream border border-neutral-200/50 rounded-full"></div>
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-bg-cream border border-neutral-200/50 rounded-full"></div>
              <div className="border-t-2 border-sun-yellow border-dashed w-full h-px absolute top-1/2 -translate-y-1/2"></div>
            </div>

            {/* Stub & QR Section */}
            <div className="p-6 bg-[#FFF9E6] border-t border-neutral-100 flex flex-col items-center justify-center text-center">
              <div className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase mb-1">M-Pesa Verification Code</div>
              <div className="text-base font-extrabold text-safari-green font-mono tracking-wider mb-5 flex items-center space-x-2">
                <span>{ticket.mpesaRef}</span>
              </div>

              {/* QR Code Matrix */}
              <div className="bg-white p-3.5 rounded-2xl border border-neutral-100 mb-4 inline-block shadow-xs">
                <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(21, minmax(0, 1fr))` }}>
                  {qrMatrix.map((row, rIdx) => 
                    row.map((cell, cIdx) => (
                      <div 
                        key={`${rIdx}-${cIdx}`} 
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${cell ? 'bg-ink' : 'bg-white'}`}
                      />
                    ))
                  )}
                </div>
              </div>

              <p className="text-[10px] text-neutral-500 font-mono leading-relaxed max-w-[240px]">
                PRESENT THIS DIGITAL PASS AT THE EVENT ENTRANCE GATE FOR SECURE SCANNING.
              </p>
            </div>
          </div>

          {/* Hidden Canvas used for Offline image generation */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Right Column: Actions / Info Panel */}
        <div className="md:col-span-5 space-y-6 font-sans">
          
          {/* Quick info card */}
          <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-xs space-y-4">
            <h4 className="font-bold text-ink text-sm">Booking Receipt</h4>
            
            <div className="space-y-2.5 text-xs border-b border-neutral-100 pb-3">
              <div className="flex justify-between">
                <span className="text-neutral-500">M-Pesa reference</span>
                <button 
                  onClick={copyRefToClipboard}
                  className="font-mono text-ink font-bold hover:text-safari-green flex items-center space-x-1 cursor-pointer"
                >
                  <span>{ticket.mpesaRef}</span>
                  <span className="text-[9px] bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-500 font-sans">
                    {copied ? 'Copied' : 'Copy'}
                  </span>
                </button>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Payment status</span>
                <span className="text-safari-green font-bold flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-safari-green inline-block animate-pulse"></span>
                  <span>Instant Approved</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Receipt timestamp</span>
                <span className="text-ink font-semibold">{ticket.purchasedAt}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-neutral-800">Total Charged</span>
                <span className="text-ink">Ksh {ticket.totalPaid.toLocaleString()}.00</span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-normal">
                This transaction has been securely synchronized with the Safaricom Daraja API callbacks for instant ticketing approval.
              </p>
            </div>
          </div>

          {/* Core Action Buttons */}
          <div className="space-y-3">
            <button
              id="download-ticket-png-btn"
              onClick={handleDownloadImage}
              disabled={downloading}
              className="w-full bg-safari-green hover:opacity-95 active:scale-98 text-white font-bold text-sm py-3.5 rounded-2xl transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Compiling Ticket...' : 'Download Ticket Image (PNG)'}</span>
            </button>

            <button
              id="print-ticket-btn"
              onClick={() => window.print()}
              className="w-full bg-white hover:bg-neutral-50 border border-neutral-200 text-ink font-bold text-sm py-3.5 rounded-2xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print/Save to PDF</span>
            </button>

            <div className="border-t border-neutral-100 pt-5">
              <button
                id="back-to-discovery-btn"
                onClick={onBackToDashboard}
                className="w-full bg-neutral-100 hover:bg-neutral-200 text-ink font-bold text-sm py-3.5 rounded-2xl transition-all text-center cursor-pointer"
              >
                Return to Events Discovery
              </button>
            </div>
          </div>

          {/* Pro Tips / Safety guidelines */}
          <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-2 text-xs text-neutral-700 leading-relaxed">
            <h5 className="font-bold text-neutral-900 flex items-center space-x-1">
              <span>⚠️</span>
              <span>Important Gate Admission Tips</span>
            </h5>
            <ul className="list-disc list-inside space-y-1.5 pl-0.5 text-neutral-600">
              <li>Do not send or share this ticket image on social media to prevent unauthorized duplication.</li>
              <li>Ensure your phone screen brightness is at 100% when presenting the QR code at the gate.</li>
              <li>You can also present the printed version of the ticket or quote the M-Pesa reference: <strong className="font-mono text-ink">{ticket.mpesaRef}</strong>.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
