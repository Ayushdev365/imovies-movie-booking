import React, { createContext, useContext, useState, useEffect } from 'react';
import { Movie, Theatre, Showtime, Seat } from '../types/index.js';
import { api } from '../services/api.js';

interface BookingContextType {
  selectedMovie: Movie | null;
  selectedTheatre: Theatre | null;
  selectedShowtime: Showtime | null;
  selectedSeats: Seat[];
  holdExpiresAt: Date | null;
  secondsRemaining: number;
  setSelectedMovie: (movie: Movie | null) => void;
  setSelectedTheatre: (theatre: Theatre | null) => void;
  setSelectedShowtime: (showtime: Showtime | null) => void;
  setSelectedSeats: (seats: Seat[]) => void;
  toggleSeatSelection: (seat: Seat) => void;
  setSeatHold: (seats: Seat[], expiresAtStr: string) => void;
  clearBookingFlow: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedTheatre, setSelectedTheatre] = useState<Theatre | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [holdExpiresAt, setHoldExpiresAt] = useState<Date | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  // Timer countdown
  useEffect(() => {
    if (!holdExpiresAt) {
      setSecondsRemaining(0);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((holdExpiresAt.getTime() - now) / 1000));
      setSecondsRemaining(diff);

      if (diff <= 0) {
        clearInterval(interval);
        // Hold expired
        setHoldExpiresAt(null);
        setSelectedSeats([]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [holdExpiresAt]);

  const toggleSeatSelection = (seat: Seat) => {
    const isSelected = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter((s) => s.seatNumber !== seat.seatNumber));
    } else {
      if (selectedSeats.length >= 8) {
        alert('You can select a maximum of 8 seats per booking transaction.');
        return;
      }
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const setSeatHold = (seats: Seat[], expiresAtStr: string) => {
    setSelectedSeats(seats);
    setHoldExpiresAt(new Date(expiresAtStr));
  };

  const clearBookingFlow = () => {
    // Release seats on server if active hold exists
    if (selectedShowtime && selectedSeats.length > 0) {
      const showtimeId = selectedShowtime._id || selectedShowtime.id;
      api.releaseSeats(showtimeId, selectedSeats.map((s) => s.seatNumber)).catch(() => {});
    }
    setSelectedMovie(null);
    setSelectedTheatre(null);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setHoldExpiresAt(null);
    setSecondsRemaining(0);
  };

  return (
    <BookingContext.Provider
      value={{
        selectedMovie,
        selectedTheatre,
        selectedShowtime,
        selectedSeats,
        holdExpiresAt,
        secondsRemaining,
        setSelectedMovie,
        setSelectedTheatre,
        setSelectedShowtime,
        setSelectedSeats,
        toggleSeatSelection,
        setSeatHold,
        clearBookingFlow,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
