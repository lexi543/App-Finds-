export interface Event {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  date: string;
  time: string;
  venue: string;
  city: 'Nairobi' | 'Mombasa' | 'Kisumu' | 'Nakuru' | 'Eldoret';
  category: 'Concerts' | 'Festivals' | 'Sports' | 'Comedy' | 'Tech';
  image: string;
  organizer: string;
  pricing: {
    name: string;
    price: number;
    description: string;
    available: number;
  }[];
  tags: string[];
  isPopular?: boolean;
}

export interface Ticket {
  id: string;
  userId?: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  eventCity: string;
  ticketTypeName: string;
  quantity: number;
  pricePerTicket: number;
  totalPaid: number;
  mpesaRef: string;
  purchasedAt: string;
  userName: string;
  userPhone: string;
  qrValue: string;
}

export interface MpesaTransaction {
  merchantRequestID: string;
  checkoutRequestID: string;
  amount: number;
  phoneNumber: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  mpesaReceiptNumber?: string;
  createdAt: string;
}
