import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    phone: { type: String, default: '' },
  },
  { timestamps: true }
);

// Movie Schema
export interface IMovie extends Document {
  title: string;
  description: string;
  posterUrl: string;
  backdropUrl: string;
  genre: string[];
  language: string[];
  duration: number; // in minutes
  releaseDate: string;
  rating: number; // e.g. 8.7
  cast: string[];
  director: string;
  status: 'now_showing' | 'upcoming';
  trailerUrl?: string;
  ageRating?: string;
}

export const MovieSchema = new Schema<IMovie>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    posterUrl: { type: String, required: true },
    backdropUrl: { type: String, required: true },
    genre: [{ type: String }],
    language: [{ type: String }],
    duration: { type: Number, required: true },
    releaseDate: { type: String, required: true },
    rating: { type: Number, default: 8.0 },
    cast: [{ type: String }],
    director: { type: String, required: true },
    status: { type: String, enum: ['now_showing', 'upcoming'], default: 'now_showing' },
    trailerUrl: { type: String },
    ageRating: { type: String, default: 'PG-13' },
  },
  { timestamps: true }
);

// Theatre Schema
export interface ITheatre extends Document {
  name: string;
  city: string;
  address: string;
  facilities: string[];
  phone: string;
  screensCount: number;
}

export const TheatreSchema = new Schema<ITheatre>(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    facilities: [{ type: String }],
    phone: { type: String, default: '' },
    screensCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Screen Schema
export interface IScreen extends Document {
  theatreId: string;
  name: string; // e.g. "Screen 1 - IMAX Laser"
  screenType: 'IMAX' | '4DX' | 'Dolby Atmos' | 'Standard 2D';
  rows: number;
  cols: number;
  totalSeats: number;
  seatingTierConfig: {
    tier: 'VIP' | 'Premium' | 'Standard';
    rows: string[];
    priceMultiplier: number;
  }[];
}

export const ScreenSchema = new Schema<IScreen>(
  {
    theatreId: { type: String, required: true },
    name: { type: String, required: true },
    screenType: { type: String, enum: ['IMAX', '4DX', 'Dolby Atmos', 'Standard 2D'], default: 'Standard 2D' },
    rows: { type: Number, required: true },
    cols: { type: Number, required: true },
    totalSeats: { type: Number, required: true },
    seatingTierConfig: [
      {
        tier: { type: String, enum: ['VIP', 'Premium', 'Standard'] },
        rows: [{ type: String }],
        priceMultiplier: { type: Number, default: 1.0 },
      },
    ],
  },
  { timestamps: true }
);

// Showtime Schema
export interface IShowtime extends Document {
  movieId: string;
  theatreId: string;
  screenId: string;
  startTime: string; // e.g. "14:30"
  endTime: string;   // e.g. "17:15"
  date: string;      // "YYYY-MM-DD"
  basePrice: number;
  screenType: string;
}

export const ShowtimeSchema = new Schema<IShowtime>(
  {
    movieId: { type: String, required: true, index: true },
    theatreId: { type: String, required: true, index: true },
    screenId: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    date: { type: String, required: true, index: true },
    basePrice: { type: Number, required: true },
    screenType: { type: String, default: 'Standard 2D' },
  },
  { timestamps: true }
);

// SeatReservation / Inventory Schema
export interface ISeatReservation extends Document {
  showtimeId: string;
  seatNumber: string; // e.g. "A1", "C4"
  row: string;
  col: number;
  tier: 'VIP' | 'Premium' | 'Standard';
  price: number;
  status: 'available' | 'held' | 'booked';
  userId?: string;
  holdExpiresAt?: Date;
  bookingId?: string;
}

export const SeatReservationSchema = new Schema<ISeatReservation>(
  {
    showtimeId: { type: String, required: true, index: true },
    seatNumber: { type: String, required: true },
    row: { type: String, required: true },
    col: { type: Number, required: true },
    tier: { type: String, enum: ['VIP', 'Premium', 'Standard'], default: 'Standard' },
    price: { type: Number, required: true },
    status: { type: String, enum: ['available', 'held', 'booked'], default: 'available' },
    userId: { type: String },
    holdExpiresAt: { type: Date },
    bookingId: { type: String },
  },
  { timestamps: true }
);
SeatReservationSchema.index({ showtimeId: 1, seatNumber: 1 }, { unique: true });

// Booking Schema
export interface IBooking extends Document {
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
  bookingDate: Date;
}

export const BookingSchema = new Schema<IBooking>(
  {
    bookingReference: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    showtimeId: { type: String, required: true },
    movieId: { type: String, required: true },
    theatreId: { type: String, required: true },
    screenId: { type: String, required: true },
    seats: [
      {
        seatNumber: { type: String, required: true },
        tier: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    ticketSubtotal: { type: Number, required: true },
    convenienceFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['completed', 'pending', 'failed', 'refunded'], default: 'completed' },
    bookingStatus: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
    paymentMethod: { type: String, default: 'Simulation Card' },
    transactionId: { type: String, required: true },
    customerDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, default: '' },
    },
    bookingDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Mongoose Models
export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const MovieModel = mongoose.models.Movie || mongoose.model<IMovie>('Movie', MovieSchema);
export const TheatreModel = mongoose.models.Theatre || mongoose.model<ITheatre>('Theatre', TheatreSchema);
export const ScreenModel = mongoose.models.Screen || mongoose.model<IScreen>('Screen', ScreenSchema);
export const ShowtimeModel = mongoose.models.Showtime || mongoose.model<IShowtime>('Showtime', ShowtimeSchema);
export const SeatReservationModel = mongoose.models.SeatReservation || mongoose.model<ISeatReservation>('SeatReservation', SeatReservationSchema);
export const BookingModel = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
