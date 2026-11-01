import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import {
  UserModel,
  MovieModel,
  TheatreModel,
  ScreenModel,
  ShowtimeModel,
  SeatReservationModel,
  BookingModel,
  IUser,
  IMovie,
  ITheatre,
  IScreen,
  IShowtime,
  ISeatReservation,
  IBooking,
} from '../models/schemas.js';
import { isConnectedToMongoDB } from '../config/db.js';

// In-Memory store fallback
interface InMemoryStore {
  users: Map<string, any>;
  movies: Map<string, any>;
  theatres: Map<string, any>;
  screens: Map<string, any>;
  showtimes: Map<string, any>;
  seatReservations: Map<string, any>; // key: `${showtimeId}_${seatNumber}`
  bookings: Map<string, any>;
}

export const inMemoryStore: InMemoryStore = {
  users: new Map(),
  movies: new Map(),
  theatres: new Map(),
  screens: new Map(),
  showtimes: new Map(),
  seatReservations: new Map(),
  bookings: new Map(),
};

function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

// User Services
export const dbUsers = {
  async findByEmail(email: string): Promise<any> {
    const cleanEmail = email.toLowerCase().trim();
    if (isConnectedToMongoDB) {
      return await UserModel.findOne({ email: cleanEmail }).lean();
    }
    for (const user of inMemoryStore.users.values()) {
      if (user.email.toLowerCase() === cleanEmail) {
        return { ...user };
      }
    }
    return null;
  },

  async findById(id: string): Promise<any> {
    if (isConnectedToMongoDB) {
      return await UserModel.findById(id).lean();
    }
    const user = inMemoryStore.users.get(id);
    return user ? { ...user } : null;
  },

  async create(data: { name: string; email: string; passwordHash: string; role?: 'user' | 'admin'; phone?: string }): Promise<any> {
    const cleanEmail = data.email.toLowerCase().trim();
    if (isConnectedToMongoDB) {
      const created = await UserModel.create({
        name: data.name.trim(),
        email: cleanEmail,
        passwordHash: data.passwordHash,
        role: data.role || 'user',
        phone: data.phone || '',
      });
      return created.toObject();
    }
    // Check unique
    for (const u of inMemoryStore.users.values()) {
      if (u.email.toLowerCase() === cleanEmail) {
        const err = new Error('Email already registered');
        (err as any).code = 11000;
        throw err;
      }
    }
    const id = generateId();
    const newUser = {
      _id: id,
      id,
      name: data.name.trim(),
      email: cleanEmail,
      passwordHash: data.passwordHash,
      role: data.role || 'user',
      phone: data.phone || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryStore.users.set(id, newUser);
    return { ...newUser };
  },

  async update(id: string, updateData: Partial<IUser>): Promise<any> {
    if (isConnectedToMongoDB) {
      return await UserModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean();
    }
    const user = inMemoryStore.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...updateData, updatedAt: new Date() };
    inMemoryStore.users.set(id, updated);
    return { ...updated };
  },

  async findAll(): Promise<any[]> {
    if (isConnectedToMongoDB) {
      return await UserModel.find({}, '-passwordHash').sort({ createdAt: -1 }).lean();
    }
    return Array.from(inMemoryStore.users.values())
      .map(({ passwordHash, ...rest }) => ({ ...rest }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
};

// Movie Services
export const dbMovies = {
  async findAll(filter?: { status?: string; search?: string; genre?: string; language?: string }): Promise<any[]> {
    if (isConnectedToMongoDB) {
      const q: any = {};
      if (filter?.status) q.status = filter.status;
      if (filter?.genre) q.genre = filter.genre;
      if (filter?.language) q.language = filter.language;
      if (filter?.search) {
        q.$or = [
          { title: { $regex: filter.search, $options: 'i' } },
          { description: { $regex: filter.search, $options: 'i' } },
        ];
      }
      return await MovieModel.find(q).sort({ rating: -1 }).lean();
    }

    let results = Array.from(inMemoryStore.movies.values());
    if (filter?.status) {
      results = results.filter((m) => m.status === filter.status);
    }
    if (filter?.genre) {
      results = results.filter((m) => m.genre?.some((g: string) => g.toLowerCase() === filter.genre?.toLowerCase()));
    }
    if (filter?.language) {
      results = results.filter((m) => m.language?.some((l: string) => l.toLowerCase() === filter.language?.toLowerCase()));
    }
    if (filter?.search) {
      const term = filter.search.toLowerCase();
      results = results.filter(
        (m) => m.title.toLowerCase().includes(term) || m.description.toLowerCase().includes(term)
      );
    }
    return results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  },

  async findById(id: string): Promise<any> {
    if (isConnectedToMongoDB) {
      return await MovieModel.findById(id).lean();
    }
    const movie = inMemoryStore.movies.get(id);
    return movie ? { ...movie } : null;
  },

  async create(data: any): Promise<any> {
    if (isConnectedToMongoDB) {
      const created = await MovieModel.create(data);
      return created.toObject();
    }
    const id = generateId();
    const movie = { ...data, _id: id, id, createdAt: new Date() };
    inMemoryStore.movies.set(id, movie);
    return { ...movie };
  },

  async update(id: string, data: any): Promise<any> {
    if (isConnectedToMongoDB) {
      return await MovieModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    }
    const existing = inMemoryStore.movies.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    inMemoryStore.movies.set(id, updated);
    return { ...updated };
  },

  async delete(id: string): Promise<boolean> {
    if (isConnectedToMongoDB) {
      const res = await MovieModel.findByIdAndDelete(id);
      return !!res;
    }
    return inMemoryStore.movies.delete(id);
  },
};

// Theatre Services
export const dbTheatres = {
  async findAll(city?: string): Promise<any[]> {
    if (isConnectedToMongoDB) {
      const q: any = {};
      if (city) q.city = { $regex: new RegExp(`^${city}$`, 'i') };
      return await TheatreModel.find(q).lean();
    }
    let list = Array.from(inMemoryStore.theatres.values());
    if (city) {
      list = list.filter((t) => t.city.toLowerCase() === city.toLowerCase());
    }
    return list;
  },

  async findById(id: string): Promise<any> {
    if (isConnectedToMongoDB) {
      return await TheatreModel.findById(id).lean();
    }
    const theatre = inMemoryStore.theatres.get(id);
    return theatre ? { ...theatre } : null;
  },

  async create(data: any): Promise<any> {
    if (isConnectedToMongoDB) {
      const created = await TheatreModel.create(data);
      return created.toObject();
    }
    const id = generateId();
    const item = { ...data, _id: id, id, createdAt: new Date() };
    inMemoryStore.theatres.set(id, item);
    return { ...item };
  },

  async update(id: string, data: any): Promise<any> {
    if (isConnectedToMongoDB) {
      return await TheatreModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    }
    const existing = inMemoryStore.theatres.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...data, updatedAt: new Date() };
    inMemoryStore.theatres.set(id, updated);
    return { ...updated };
  },

  async delete(id: string): Promise<boolean> {
    if (isConnectedToMongoDB) {
      const res = await TheatreModel.findByIdAndDelete(id);
      return !!res;
    }
    return inMemoryStore.theatres.delete(id);
  },
};

// Screen Services
export const dbScreens = {
  async findByTheatre(theatreId: string): Promise<any[]> {
    if (isConnectedToMongoDB) {
      return await ScreenModel.find({ theatreId }).lean();
    }
    return Array.from(inMemoryStore.screens.values()).filter((s) => s.theatreId === theatreId);
  },

  async findById(id: string): Promise<any> {
    if (isConnectedToMongoDB) {
      return await ScreenModel.findById(id).lean();
    }
    const screen = inMemoryStore.screens.get(id);
    return screen ? { ...screen } : null;
  },

  async create(data: any): Promise<any> {
    if (isConnectedToMongoDB) {
      const created = await ScreenModel.create(data);
      return created.toObject();
    }
    const id = generateId();
    const item = { ...data, _id: id, id, createdAt: new Date() };
    inMemoryStore.screens.set(id, item);
    return { ...item };
  },
};

// Showtime Services
export const dbShowtimes = {
  async findAll(filter?: { movieId?: string; theatreId?: string; date?: string }): Promise<any[]> {
    if (isConnectedToMongoDB) {
      const q: any = {};
      if (filter?.movieId) q.movieId = filter.movieId;
      if (filter?.theatreId) q.theatreId = filter.theatreId;
      if (filter?.date) q.date = filter.date;
      return await ShowtimeModel.find(q).lean();
    }
    let list = Array.from(inMemoryStore.showtimes.values());
    if (filter?.movieId) list = list.filter((s) => s.movieId === filter.movieId);
    if (filter?.theatreId) list = list.filter((s) => s.theatreId === filter.theatreId);
    if (filter?.date) list = list.filter((s) => s.date === filter.date);
    return list;
  },

  async findById(id: string): Promise<any> {
    if (isConnectedToMongoDB) {
      return await ShowtimeModel.findById(id).lean();
    }
    const showtime = inMemoryStore.showtimes.get(id);
    return showtime ? { ...showtime } : null;
  },

  async create(data: any): Promise<any> {
    if (isConnectedToMongoDB) {
      const created = await ShowtimeModel.create(data);
      return created.toObject();
    }
    const id = generateId();
    const item = { ...data, _id: id, id, createdAt: new Date() };
    inMemoryStore.showtimes.set(id, item);
    return { ...item };
  },

  async delete(id: string): Promise<boolean> {
    if (isConnectedToMongoDB) {
      const res = await ShowtimeModel.findByIdAndDelete(id);
      return !!res;
    }
    return inMemoryStore.showtimes.delete(id);
  },
};

// Seat Inventory & Reservations
// 5-minute hold policy (300,000 ms)
export const HOLD_DURATION_MS = 5 * 60 * 1000;

export const dbSeats = {
  // Ensure default seats are generated for a screen/showtime if not yet created
  async getOrCreateSeatsForShowtime(showtime: any, screen: any): Promise<any[]> {
    const showtimeId = showtime._id || showtime.id;
    const now = new Date();

    if (isConnectedToMongoDB) {
      // Clean up expired holds in DB
      await SeatReservationModel.updateMany(
        {
          showtimeId,
          status: 'held',
          holdExpiresAt: { $lt: now },
        },
        {
          $set: { status: 'available' },
          $unset: { userId: 1, holdExpiresAt: 1 },
        }
      );

      let seats = await SeatReservationModel.find({ showtimeId }).sort({ row: 1, col: 1 }).lean();
      if (seats.length === 0) {
        // Generate seats
        const generated = generateSeatMap(showtimeId, showtime.basePrice, screen);
        await SeatReservationModel.insertMany(generated);
        seats = await SeatReservationModel.find({ showtimeId }).sort({ row: 1, col: 1 }).lean();
      }
      return seats;
    }

    // In-Memory implementation
    // 1. Release expired holds
    for (const [key, seat] of inMemoryStore.seatReservations.entries()) {
      if (seat.showtimeId === showtimeId && seat.status === 'held' && seat.holdExpiresAt && new Date(seat.holdExpiresAt) < now) {
        seat.status = 'available';
        delete seat.userId;
        delete seat.holdExpiresAt;
        inMemoryStore.seatReservations.set(key, seat);
      }
    }

    // 2. Check if seats exist
    const showtimeSeats: any[] = [];
    for (const seat of inMemoryStore.seatReservations.values()) {
      if (seat.showtimeId === showtimeId) {
        showtimeSeats.push(seat);
      }
    }

    if (showtimeSeats.length === 0) {
      const generated = generateSeatMap(showtimeId, showtime.basePrice, screen);
      for (const s of generated) {
        const id = generateId();
        const obj = { ...s, _id: id, id };
        inMemoryStore.seatReservations.set(`${showtimeId}_${s.seatNumber}`, obj);
        showtimeSeats.push(obj);
      }
    }

    return showtimeSeats.sort((a, b) => a.row.localeCompare(b.row) || a.col - b.col);
  },

  // Atomic hold operation: reserves seats for 5 minutes for a user
  async holdSeats(showtimeId: string, seatNumbers: string[], userId: string): Promise<{ success: boolean; seats?: any[]; message?: string }> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + HOLD_DURATION_MS);

    if (isConnectedToMongoDB) {
      // First clear expired holds
      await SeatReservationModel.updateMany(
        {
          showtimeId,
          status: 'held',
          holdExpiresAt: { $lt: now },
        },
        {
          $set: { status: 'available' },
          $unset: { userId: 1, holdExpiresAt: 1 },
        }
      );

      // Verify all requested seats are currently 'available' or already held by the same user
      const existing = await SeatReservationModel.find({
        showtimeId,
        seatNumber: { $in: seatNumbers },
      }).lean();

      if (existing.length !== seatNumbers.length) {
        return { success: false, message: 'Some requested seats were not found.' };
      }

      for (const seat of existing) {
        if (seat.status === 'booked') {
          return { success: false, message: `Seat ${seat.seatNumber} is already booked by another patron.` };
        }
        if (seat.status === 'held' && seat.userId !== userId) {
          return { success: false, message: `Seat ${seat.seatNumber} is currently on hold by another customer.` };
        }
      }

      // Atomic update
      await SeatReservationModel.updateMany(
        {
          showtimeId,
          seatNumber: { $in: seatNumbers },
        },
        {
          $set: {
            status: 'held',
            userId,
            holdExpiresAt: expiresAt,
          },
        }
      );

      const updated = await SeatReservationModel.find({
        showtimeId,
        seatNumber: { $in: seatNumbers },
      }).lean();

      return { success: true, seats: updated };
    }

    // In-Memory atomic guard
    // 1. Release expired holds
    for (const [key, seat] of inMemoryStore.seatReservations.entries()) {
      if (seat.showtimeId === showtimeId && seat.status === 'held' && seat.holdExpiresAt && new Date(seat.holdExpiresAt) < now) {
        seat.status = 'available';
        delete seat.userId;
        delete seat.holdExpiresAt;
        inMemoryStore.seatReservations.set(key, seat);
      }
    }

    // 2. Validate availability
    const targets: any[] = [];
    for (const sNum of seatNumbers) {
      const key = `${showtimeId}_${sNum}`;
      const seat = inMemoryStore.seatReservations.get(key);
      if (!seat) {
        return { success: false, message: `Seat ${sNum} does not exist.` };
      }
      if (seat.status === 'booked') {
        return { success: false, message: `Seat ${sNum} is already booked.` };
      }
      if (seat.status === 'held' && seat.userId !== userId) {
        return { success: false, message: `Seat ${sNum} is held by another user. Try another seat.` };
      }
      targets.push(seat);
    }

    // 3. Apply hold atomically
    for (const seat of targets) {
      seat.status = 'held';
      seat.userId = userId;
      seat.holdExpiresAt = expiresAt;
      inMemoryStore.seatReservations.set(`${showtimeId}_${seat.seatNumber}`, seat);
    }

    return { success: true, seats: targets };
  },

  // Release held seats
  async releaseSeats(showtimeId: string, seatNumbers: string[], userId: string): Promise<boolean> {
    if (isConnectedToMongoDB) {
      await SeatReservationModel.updateMany(
        {
          showtimeId,
          seatNumber: { $in: seatNumbers },
          userId,
          status: 'held',
        },
        {
          $set: { status: 'available' },
          $unset: { userId: 1, holdExpiresAt: 1 },
        }
      );
      return true;
    }

    for (const sNum of seatNumbers) {
      const key = `${showtimeId}_${sNum}`;
      const seat = inMemoryStore.seatReservations.get(key);
      if (seat && seat.status === 'held' && seat.userId === userId) {
        seat.status = 'available';
        delete seat.userId;
        delete seat.holdExpiresAt;
        inMemoryStore.seatReservations.set(key, seat);
      }
    }
    return true;
  },

  // Finalize seats to booked upon confirmed payment
  async confirmSeatsBooking(showtimeId: string, seatNumbers: string[], bookingId: string, userId: string): Promise<{ success: boolean; seats?: any[]; message?: string }> {
    const now = new Date();

    if (isConnectedToMongoDB) {
      const existing = await SeatReservationModel.find({
        showtimeId,
        seatNumber: { $in: seatNumbers },
      }).lean();

      for (const seat of existing) {
        if (seat.status === 'booked') {
          return { success: false, message: `Seat ${seat.seatNumber} has already been reserved.` };
        }
        // Verify held by current user or available
        if (seat.status === 'held' && seat.userId !== userId && seat.holdExpiresAt && new Date(seat.holdExpiresAt) > now) {
          return { success: false, message: `Hold expired or seat ${seat.seatNumber} was acquired by another user.` };
        }
      }

      await SeatReservationModel.updateMany(
        {
          showtimeId,
          seatNumber: { $in: seatNumbers },
        },
        {
          $set: {
            status: 'booked',
            userId,
            bookingId,
          },
          $unset: { holdExpiresAt: 1 },
        }
      );

      const bookedSeats = await SeatReservationModel.find({
        showtimeId,
        seatNumber: { $in: seatNumbers },
      }).lean();

      return { success: true, seats: bookedSeats };
    }

    // In-Memory
    const targets: any[] = [];
    for (const sNum of seatNumbers) {
      const key = `${showtimeId}_${sNum}`;
      const seat = inMemoryStore.seatReservations.get(key);
      if (!seat) {
        return { success: false, message: `Seat ${sNum} not found.` };
      }
      if (seat.status === 'booked') {
        return { success: false, message: `Seat ${sNum} is already booked.` };
      }
      if (seat.status === 'held' && seat.userId !== userId && seat.holdExpiresAt && new Date(seat.holdExpiresAt) > now) {
        return { success: false, message: `Hold on seat ${sNum} expired or belongs to someone else.` };
      }
      targets.push(seat);
    }

    for (const seat of targets) {
      seat.status = 'booked';
      seat.userId = userId;
      seat.bookingId = bookingId;
      delete seat.holdExpiresAt;
      inMemoryStore.seatReservations.set(`${showtimeId}_${seat.seatNumber}`, seat);
    }

    return { success: true, seats: targets };
  },

  // Release booked seats upon cancellation
  async releaseBookedSeats(showtimeId: string, seatNumbers: string[]): Promise<void> {
    if (isConnectedToMongoDB) {
      await SeatReservationModel.updateMany(
        {
          showtimeId,
          seatNumber: { $in: seatNumbers },
        },
        {
          $set: { status: 'available' },
          $unset: { userId: 1, holdExpiresAt: 1, bookingId: 1 },
        }
      );
      return;
    }

    for (const sNum of seatNumbers) {
      const key = `${showtimeId}_${sNum}`;
      const seat = inMemoryStore.seatReservations.get(key);
      if (seat) {
        seat.status = 'available';
        delete seat.userId;
        delete seat.holdExpiresAt;
        delete seat.bookingId;
        inMemoryStore.seatReservations.set(key, seat);
      }
    }
  },
};

// Helper: Generate structured seating plan for a screen
function generateSeatMap(showtimeId: string, basePrice: number, screen?: any) {
  const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const cols = screen?.cols || 12;
  const rows = screen?.rows || 8;

  const seats: any[] = [];

  for (let r = 0; r < rows; r++) {
    const rowChar = rowLabels[r] || String.fromCharCode(65 + r);
    // VIP: Rows A-B, Premium: Rows C-E, Standard: Rows F-H
    let tier: 'VIP' | 'Premium' | 'Standard' = 'Standard';
    let priceMultiplier = 1.0;

    if (r < 2) {
      tier = 'VIP';
      priceMultiplier = 1.6;
    } else if (r < 5) {
      tier = 'Premium';
      priceMultiplier = 1.3;
    } else {
      tier = 'Standard';
      priceMultiplier = 1.0;
    }

    const price = Math.round(basePrice * priceMultiplier);

    for (let c = 1; c <= cols; c++) {
      const seatNumber = `${rowChar}${c}`;
      seats.push({
        showtimeId,
        seatNumber,
        row: rowChar,
        col: c,
        tier,
        price,
        status: 'available',
      });
    }
  }

  return seats;
}

// Booking Services
export const dbBookings = {
  async create(data: any): Promise<any> {
    if (isConnectedToMongoDB) {
      const created = await BookingModel.create(data);
      return created.toObject();
    }
    const id = generateId();
    const booking = { ...data, _id: id, id, bookingDate: new Date() };
    inMemoryStore.bookings.set(id, booking);
    return { ...booking };
  },

  async findById(id: string): Promise<any> {
    if (isConnectedToMongoDB) {
      return await BookingModel.findById(id).lean();
    }
    const b = inMemoryStore.bookings.get(id);
    return b ? { ...b } : null;
  },

  async findByReference(reference: string): Promise<any> {
    if (isConnectedToMongoDB) {
      return await BookingModel.findOne({ bookingReference: reference }).lean();
    }
    for (const b of inMemoryStore.bookings.values()) {
      if (b.bookingReference.toLowerCase() === reference.toLowerCase()) {
        return { ...b };
      }
    }
    return null;
  },

  async findByUser(userId: string): Promise<any[]> {
    if (isConnectedToMongoDB) {
      return await BookingModel.find({ userId }).sort({ bookingDate: -1 }).lean();
    }
    return Array.from(inMemoryStore.bookings.values())
      .filter((b) => b.userId === userId)
      .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
  },

  async findAll(): Promise<any[]> {
    if (isConnectedToMongoDB) {
      return await BookingModel.find().sort({ bookingDate: -1 }).lean();
    }
    return Array.from(inMemoryStore.bookings.values()).sort(
      (a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
    );
  },

  async update(id: string, updateData: any): Promise<any> {
    if (isConnectedToMongoDB) {
      return await BookingModel.findByIdAndUpdate(id, { $set: updateData }, { new: true }).lean();
    }
    const existing = inMemoryStore.bookings.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updateData, updatedAt: new Date() };
    inMemoryStore.bookings.set(id, updated);
    return { ...updated };
  },
};
