import { Event } from '../types';

export const KENYAN_EVENTS: Event[] = [
  {
    id: 'nairobi-solfest-2026',
    title: 'Nairobi SolFest Live',
    description: 'The ultimate celebration of African music, culture, and artistic expression, headlined by Sauti Sol and top regional stars.',
    longDescription: 'Solfest returns to the heart of Nairobi for its biggest edition yet! Experience 12 hours of non-stop live music, authentic Kenyan street food, interactive art installations, and a vibrant community of music lovers. This mobile-first, cashless event celebrates local heritage with modern sounds. Fully integrated with M-Pesa ticket validation at the gates.',
    date: 'Saturday, August 15, 2026',
    time: '2:00 PM - 2:00 AM',
    venue: 'Ngong Racecourse, Waterfront',
    city: 'Nairobi',
    category: 'Concerts',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80',
    organizer: 'Sol Generation Records',
    pricing: [
      { name: 'Early Bird', price: 1500, description: 'Limited standard admission tickets available before July', available: 50 },
      { name: 'Gate / Regular', price: 2500, description: 'Standard admission at the gate, subject to capacity', available: 500 },
      { name: 'VIP Lounge', price: 6000, description: 'Dedicated fast track gate, VIP lounge access, 2 free drinks', available: 150 },
      { name: 'Golden Circle VVIP', price: 12000, description: 'Front-row stage access, premium catering, and meet-and-greet', available: 40 }
    ],
    tags: ['Music', 'Live Band', 'Afrobeats', 'Sauti Sol'],
    isPopular: true
  },
  {
    id: 'mombasa-cultural-carnival-2026',
    title: 'Mombasa Cultural Carnival',
    description: 'Immerse yourself in Swahili heritage, coastal cuisine, traditional taarab rhythms, and spectacular beach dhow races.',
    longDescription: 'The Mombasa Cultural Carnival brings the Indian Ocean coastline to life! Enjoy a weekend full of Swahili street food (Biryani, Shawarma, Viazi Karai), traditional dances, henna artistry, beach soccer, and the famous evening dhow racing. Bring your family for an unforgettable coastal experience under the stars.',
    date: 'Friday, October 16, 2026',
    time: '10:00 AM - 10:00 PM',
    venue: 'Mama Ngina Waterfront Park',
    city: 'Mombasa',
    category: 'Festivals',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80',
    organizer: 'Mombasa County Tourism Board',
    pricing: [
      { name: 'Regular Pass', price: 1000, description: 'Access to all cultural displays, stalls, and main beach stage', available: 1000 },
      { name: 'VIP Coastal Experience', price: 3000, description: 'Elevated seaside seating, Swahili buffet, and private cash bar', available: 100 },
      { name: 'Kids Day Pass (Under 12)', price: 400, description: 'Access to children play zones and face-painting stations', available: 300 }
    ],
    tags: ['Swahili', 'Coastal', 'Food Festival', 'Family'],
    isPopular: true
  },
  {
    id: 'kisumu-lakeside-fish-festival-2026',
    title: 'Lakeside Fish & Food Expo',
    description: 'Celebrate the rich culinary heritage of the lake basin with fresh tilapia, traditional Luo music (Ohangla), and boat racing.',
    longDescription: 'Welcome to Kisumu\'s premier food and cultural expo! The Lakeside Fish & Food Expo highlights the best of Nyanza\'s cuisine, from deep-fried tilapia to local delicacies. Accompanied by live Ohangla bands, Benga guitar artists, traditional Luo dancers, and competitive boat regattas on Lake Victoria.',
    date: 'Sunday, September 6, 2026',
    time: '11:00 AM - 9:00 PM',
    venue: 'Dunga Hill Camp',
    city: 'Kisumu',
    category: 'Festivals',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
    organizer: 'Lake Basin Development Group',
    pricing: [
      { name: 'Regular Entry', price: 800, description: 'General access to the food stalls and musical performances', available: 600 },
      { name: 'Lakeside VIP Cabana', price: 2500, description: 'Exclusive lakeside view seating, complimentary fish platter & drink', available: 50 }
    ],
    tags: ['Lakeside', 'Fish', 'Ohangla', 'Culture'],
    isPopular: false
  },
  {
    id: 'nairobi-comedy-gala-2026',
    title: 'The Great Nairobi Comedy Gala',
    description: 'An evening of tears and laughter featuring Kenya\'s funniest stand-up comedians and regional acts.',
    longDescription: 'Prepare for rib-cracking laughter as Kenya\'s comedy royalty takes the stage! From satirical commentary on Nairobi life to witty cultural stories, this gala showcases elite stand-up comedy. Safe, secure parking, and fully stocked bar options are available at the theatre.',
    date: 'Friday, July 24, 2026',
    time: '6:30 PM - 11:00 PM',
    venue: 'Kenya National Theatre',
    city: 'Nairobi',
    category: 'Comedy',
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eed262?auto=format&fit=crop&w=800&q=80',
    organizer: 'Savannah Laughs Ltd',
    pricing: [
      { name: 'Regular Gallery', price: 1200, description: 'Standard gallery row seating', available: 200 },
      { name: 'VIP Stalls', price: 2500, description: 'Front rows comfortable seating + free evening drink', available: 80 },
      { name: 'VVIP Sofa Row', price: 4500, description: 'Front-row luxury sofa lounge, premium service & gift hamper', available: 20 }
    ],
    tags: ['Comedy', 'Standup', 'Nairobi Jokes', 'Theater'],
    isPopular: true
  },
  {
    id: 'rift-valley-esports-championship-2026',
    title: 'Rift Valley Esports Arena',
    description: 'The premier esports tournament in Nakuru, featuring FIFA, Tekken, and Call of Duty matchups for Kenya\'s top gaming talent.',
    longDescription: 'Get ready for intense digital combat in Nakuru! The Rift Valley Esports Arena brings together gaming enthusiasts, professional tournament brackets, cosplayers, and hardware exhibitors. Watch elite local gamers battle for a KES 500,000 prize pool, broadcasted live on massive LED screens.',
    date: 'Saturday, November 14, 2026',
    time: '9:00 AM - 7:00 PM',
    venue: 'Nakuru Players Theatre',
    city: 'Nakuru',
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    organizer: 'ProGamers Kenya & Safaricom Esports',
    pricing: [
      { name: 'Spectator Pass', price: 500, description: 'General entry to spectator stands and vendor exhibition booths', available: 400 },
      { name: 'Player Competitor Registration', price: 1500, description: 'Guarantees direct entry into 1 tournament bracket', available: 64 },
      { name: 'VIP Gamer Pass', price: 2000, description: 'Spectator entry, free esports t-shirt, and private play zone access', available: 50 }
    ],
    tags: ['Gaming', 'Esports', 'FIFA', 'Tournament'],
    isPopular: false
  },
  {
    id: 'savannah-innovators-summit-2026',
    title: 'Savannah Innovators Tech Summit',
    description: 'Silicon Savannah\'s leading technology forum for startups, venture capital, AI developments, and fintech founders.',
    longDescription: 'Connect with the minds shaping Africa\'s tech landscape. The Savannah Innovators Summit gathers 500+ founders, investors, engineers, and product designers for high-impact panels, demo-day pitches, and intensive networking blocks. Special focus on mobile payments, AI for local commerce, and green-energy tech.',
    date: 'Thursday & Friday, September 17-18, 2026',
    time: '8:00 AM - 5:00 PM Daily',
    venue: 'KICC, Tsavo Ballroom',
    city: 'Nairobi',
    category: 'Tech',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    organizer: 'Sili-Savannah Network',
    pricing: [
      { name: 'Startup Delegate Pass', price: 3500, description: 'Access to main talks, exhibition floor, and networking app', available: 200 },
      { name: 'Corporate Pass', price: 8500, description: 'Includes executive lunches, workshop rooms, and list of VC contacts', available: 80 },
      { name: 'Student Hackathon Pass', price: 1000, description: 'Requires valid student ID. Valid for Hackathon track only', available: 50 }
    ],
    tags: ['Tech', 'Fintech', 'AI', 'Silicon Savannah', 'Networking'],
    isPopular: true
  },
  {
    id: 'eldoret-champions-marathon-fan-zone-2026',
    title: 'Eldoret Champions Fan Fest',
    description: 'The home of running! Watch the world-famous Eldoret Marathon live at the ultimate fan zone with local athletes.',
    longDescription: 'Eldoret is globally known as the "City of Champions." Experience the adrenaline of the marathon with thousands of fans at the ultimate town-square fan zone. Giant high-definition screens, live athletics commentary, acoustic Kalenjin folk songs, sports gear exhibitions, and meet-and-greets with world record holders!',
    date: 'Sunday, November 29, 2026',
    time: '6:00 AM - 4:00 PM',
    venue: 'Eldoret Sports Club',
    city: 'Eldoret',
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80',
    organizer: 'Athletics Kenya North Rift',
    pricing: [
      { name: 'Fan Zone Entry', price: 300, description: 'Access to the stadium fan screens, food stalls, and music stages', available: 1500 },
      { name: 'VIP Athletes Club House', price: 1500, description: 'Seated breakfast, high-definition private viewing screens, and athlete autograph lounge', available: 80 }
    ],
    tags: ['Athletics', 'Marathon', 'Running', 'Eldoret'],
    isPopular: false
  }
];
