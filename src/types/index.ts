export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  createdAt?: string;
}

export interface Movie {
  id: string;
  _id?: string;
  title: string;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  genre: string[];
  language: string[];
  duration: number; // minutes
  releaseDate: string;
  rating: number;
  cast: string[];
  director: string;
  status: 'now_showing' | 'upcoming';
  trailerUrl?: string;
  ageRating?: string;
}

export interface Theatre {
  id: string;
  _id?: string;
  name: string;
  city: string;
  address: string;
  facilities: string[];
  phone?: string;
  screensCount: number;
}

export interface Screen {
  id: string;
  _id?: string;
  theatreId: string;
  name: string;
  screenType: 'IMAX' | '4DX' | 'Dolby Atmos' | 'Standard 2D';
  rows: number;
  cols: number;
  totalSeats: number;
}

export interface Showtime {
  id: string;
  _id?: string;
  movieId: string;
  theatreId: string;
  screenId: string;
  startTime: string;
  endTime: string;
  date: string;
  basePrice: number;
  screenType: string;
  movie?: {
    id: string;
    title: string;
    posterUrl: string;
    duration: number;
    rating: number;
  };
  theatre?: {
    id: string;
    name: string;
    city: string;
    address: string;
  };
  screen?: {
    id: string;
    name: string;
    screenType: string;
  };
}

export interface Seat {
  id: string;
  _id?: string;
  showtimeId: string;
  seatNumber: string;
  row: string;
  col: number;
  tier: 'VIP' | 'Premium' | 'Standard';
  price: number;
  status: 'available' | 'held' | 'booked';
  userId?: string;
  holdExpiresAt?: string;
}

export interface Booking {
  id: string;
  _id?: string;
  bookingReference: string;
  userId: string;
  showtimeId: string;
  movieId: string;
  theatreId: string;
  screenId: string;
  seats: {
    seatNumber: string;
    tier: 'VIP' | 'Premium' | 'Standard';
    price: number;
  }[];
  ticketSubtotal: number;
  convenienceFee: number;
  tax: number;
  grandTotal: number;
  paymentStatus: 'completed' | 'pending' | 'failed' | 'refunded';
  bookingStatus: 'confirmed' | 'cancelled';
  paymentMethod: string;
  transactionId: string;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  bookingDate: string;
  movie?: {
    title: string;
    posterUrl: string;
    duration: number;
    ageRating?: string;
  };
  theatre?: {
    name: string;
    city: string;
    address: string;
  };
  showtime?: {
    date: string;
    startTime: string;
    screenType: string;
  };
}

export interface AdminStats {
  totalRevenue: number;
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalTicketsSold: number;
  activeMovies: number;
  upcomingMovies: number;
  totalTheatres: number;
  totalShowtimes: number;
  totalUsers: number;
}
