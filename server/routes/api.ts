import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import {
  dbUsers,
  dbMovies,
  dbTheatres,
  dbScreens,
  dbShowtimes,
  dbSeats,
  dbBookings,
  HOLD_DURATION_MS,
} from '../services/dbService.js';
import { authenticate, requireAdmin, generateToken, AuthRequest } from '../middleware/auth.js';
import { isConnectedToMongoDB, dbStatusMessage } from '../config/db.js';

export const apiRouter = Router();

// ==========================================
// 1. HEALTH & SYSTEM STATUS
// ==========================================
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'online',
    timestamp: new Date().toISOString(),
    database: {
      connectedToAtlas: isConnectedToMongoDB,
      statusMessage: dbStatusMessage,
    },
  });
});

// GitHub Integration Info Endpoint
apiRouter.get('/github/info', (req: Request, res: Response) => {
  res.json({
    success: true,
    repository: 'imovies-movie-booking',
    userProfileUrl: 'https://github.com/Ayushdev365',
    suggestedRepoUrl: 'https://github.com/Ayushdev365/imovies-movie-booking.git',
    branch: 'main',
    syncStatus: 'Local Git repository initialized on branch main with production cinema booking architecture.',
    stepsToConnect: [
      '1. Create a repository named "imovies-movie-booking" on https://github.com/new',
      '2. Link remote: git remote add origin https://github.com/Ayushdev365/imovies-movie-booking.git',
      '3. Stage and commit: git add . && git commit -m "feat: complete IMovies cinema booking platform"',
      '4. Push code: git push -u origin main',
    ],
  });
});

// Download Full Project as ZIP archive for easy local git pushing
apiRouter.get('/download-project', (req: Request, res: Response) => {
  const zipPath = '/tmp/imovies-movie-booking.zip';

  try {
    const pythonScript = `
import zipfile, os
exclude_dirs = {'node_modules', 'dist', '.git', '.aistudio'}
exclude_files = {'.env'}
with zipfile.ZipFile('${zipPath}', 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for file in files:
            if file not in exclude_files and not file.endswith('.zip'):
                filepath = os.path.join(root, file)
                arcname = os.path.relpath(filepath, '.')
                zipf.write(filepath, arcname)
`;
    execSync(`python3 -c "${pythonScript.replace(/"/g, '\\"')}"`, { cwd: process.cwd() });
    res.download(zipPath, 'imovies-movie-booking.zip');
  } catch (err: any) {
    console.error('Failed to create project zip:', err);
    res.status(500).json({ error: 'Failed to package project zip archive' });
  }
});

// ==========================================
// 2. AUTHENTICATION & PROFILE
// ==========================================
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
      return;
    }

    const existing = await dbUsers.findByEmail(email);
    if (existing) {
      res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await dbUsers.create({
      name,
      email,
      passwordHash,
      phone: phone || '',
      role: 'user',
    });

    const token = generateToken({
      id: user._id || user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: err.message || 'Server error during registration.' });
  }
});

apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required.' });
      return;
    }

    const user = await dbUsers.findByEmail(email);
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      res.status(401).json({ success: false, error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({
      id: user._id || user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Server error during login.' });
  }
});

apiRouter.get('/auth/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await dbUsers.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/auth/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone } = req.body;
    const updated = await dbUsers.update(req.user!.id, { name, phone });

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updated._id || updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        phone: updated.phone,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. MOVIES
// ==========================================
apiRouter.get('/movies', async (req: Request, res: Response) => {
  try {
    const { status, search, genre, language } = req.query as {
      status?: string;
      search?: string;
      genre?: string;
      language?: string;
    };

    const movies = await dbMovies.findAll({ status, search, genre, language });
    res.json({ success: true, count: movies.length, movies });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/movies/:id', async (req: Request, res: Response) => {
  try {
    const movie = await dbMovies.findById(req.params.id);
    if (!movie) {
      res.status(404).json({ success: false, error: 'Movie not found.' });
      return;
    }
    res.json({ success: true, movie });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/movies', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, posterUrl, backdropUrl, genre, language, duration, releaseDate, rating, cast, director, status, trailerUrl, ageRating } = req.body;

    if (!title || !description || !posterUrl || !duration) {
      res.status(400).json({ success: false, error: 'Title, description, poster URL, and duration are required.' });
      return;
    }

    const movie = await dbMovies.create({
      title,
      description,
      posterUrl,
      backdropUrl: backdropUrl || posterUrl,
      genre: Array.isArray(genre) ? genre : genre ? [genre] : ['Action'],
      language: Array.isArray(language) ? language : language ? [language] : ['English'],
      duration: Number(duration),
      releaseDate: releaseDate || new Date().toISOString().split('T')[0],
      rating: Number(rating) || 8.0,
      cast: Array.isArray(cast) ? cast : cast ? cast.split(',').map((s: string) => s.trim()) : [],
      director: director || 'Director',
      status: status || 'now_showing',
      trailerUrl: trailerUrl || '',
      ageRating: ageRating || 'PG-13',
    });

    res.status(201).json({ success: true, message: 'Movie created successfully.', movie });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/movies/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await dbMovies.update(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Movie not found.' });
      return;
    }
    res.json({ success: true, message: 'Movie updated successfully.', movie: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/movies/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await dbMovies.delete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Movie not found.' });
      return;
    }
    res.json({ success: true, message: 'Movie deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. THEATRES & SCREENS
// ==========================================
apiRouter.get('/theatres', async (req: Request, res: Response) => {
  try {
    const { city } = req.query as { city?: string };
    const theatres = await dbTheatres.findAll(city);
    res.json({ success: true, count: theatres.length, theatres });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/theatres/:id', async (req: Request, res: Response) => {
  try {
    const theatre = await dbTheatres.findById(req.params.id);
    if (!theatre) {
      res.status(404).json({ success: false, error: 'Theatre not found.' });
      return;
    }
    const screens = await dbScreens.findByTheatre(theatre._id || theatre.id);
    res.json({ success: true, theatre, screens });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/theatres', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { name, city, address, facilities, phone, screensCount } = req.body;

    if (!name || !city || !address) {
      res.status(400).json({ success: false, error: 'Name, city, and address are required.' });
      return;
    }

    const theatre = await dbTheatres.create({
      name,
      city,
      address,
      facilities: Array.isArray(facilities) ? facilities : ['IMAX', 'Dolby Atmos'],
      phone: phone || '',
      screensCount: Number(screensCount) || 1,
    });

    // Default screen
    await dbScreens.create({
      theatreId: theatre._id || theatre.id,
      name: `${name} - Screen 1 (Standard)`,
      screenType: 'Standard 2D',
      rows: 8,
      cols: 12,
      totalSeats: 96,
      seatingTierConfig: [
        { tier: 'VIP', rows: ['A', 'B'], priceMultiplier: 1.5 },
        { tier: 'Premium', rows: ['C', 'D', 'E'], priceMultiplier: 1.2 },
        { tier: 'Standard', rows: ['F', 'G', 'H'], priceMultiplier: 1.0 },
      ],
    });

    res.status(201).json({ success: true, message: 'Theatre created successfully.', theatre });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.put('/theatres/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const updated = await dbTheatres.update(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Theatre not found.' });
      return;
    }
    res.json({ success: true, message: 'Theatre updated successfully.', theatre: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/theatres/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await dbTheatres.delete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Theatre not found.' });
      return;
    }
    res.json({ success: true, message: 'Theatre deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/theatres/:id/screens', async (req: Request, res: Response) => {
  try {
    const screens = await dbScreens.findByTheatre(req.params.id);
    res.json({ success: true, screens });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/screens', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { theatreId, name, screenType, rows, cols } = req.body;
    if (!theatreId || !name) {
      res.status(400).json({ success: false, error: 'theatreId and name are required.' });
      return;
    }

    const r = Number(rows) || 8;
    const c = Number(cols) || 12;

    const screen = await dbScreens.create({
      theatreId,
      name,
      screenType: screenType || 'Standard 2D',
      rows: r,
      cols: c,
      totalSeats: r * c,
      seatingTierConfig: [
        { tier: 'VIP', rows: ['A', 'B'], priceMultiplier: 1.6 },
        { tier: 'Premium', rows: ['C', 'D', 'E'], priceMultiplier: 1.3 },
        { tier: 'Standard', rows: ['F', 'G', 'H'], priceMultiplier: 1.0 },
      ],
    });

    res.status(201).json({ success: true, screen });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. SHOWTIMES
// ==========================================
apiRouter.get('/showtimes', async (req: Request, res: Response) => {
  try {
    const { movieId, theatreId, date } = req.query as {
      movieId?: string;
      theatreId?: string;
      date?: string;
    };

    const showtimes = await dbShowtimes.findAll({ movieId, theatreId, date });

    // Populate metadata for easier consumption
    const enriched = await Promise.all(
      showtimes.map(async (st) => {
        const movie = await dbMovies.findById(st.movieId);
        const theatre = await dbTheatres.findById(st.theatreId);
        const screen = await dbScreens.findById(st.screenId);
        return {
          ...st,
          movie: movie ? { id: movie._id || movie.id, title: movie.title, posterUrl: movie.posterUrl, duration: movie.duration, rating: movie.rating } : null,
          theatre: theatre ? { id: theatre._id || theatre.id, name: theatre.name, city: theatre.city, address: theatre.address } : null,
          screen: screen ? { id: screen._id || screen.id, name: screen.name, screenType: screen.screenType } : null,
        };
      })
    );

    res.json({ success: true, count: enriched.length, showtimes: enriched });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/showtimes/:id', async (req: Request, res: Response) => {
  try {
    const st = await dbShowtimes.findById(req.params.id);
    if (!st) {
      res.status(404).json({ success: false, error: 'Showtime not found.' });
      return;
    }
    const movie = await dbMovies.findById(st.movieId);
    const theatre = await dbTheatres.findById(st.theatreId);
    const screen = await dbScreens.findById(st.screenId);

    res.json({
      success: true,
      showtime: {
        ...st,
        movie,
        theatre,
        screen,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/showtimes', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { movieId, theatreId, screenId, startTime, endTime, date, basePrice, screenType } = req.body;

    if (!movieId || !theatreId || !startTime || !date || !basePrice) {
      res.status(400).json({ success: false, error: 'Movie, theatre, date, startTime, and basePrice are required.' });
      return;
    }

    let actualScreenId = screenId;
    if (!actualScreenId) {
      const screens = await dbScreens.findByTheatre(theatreId);
      actualScreenId = screens[0] ? (screens[0]._id || screens[0].id) : 'default-screen';
    }

    const showtime = await dbShowtimes.create({
      movieId,
      theatreId,
      screenId: actualScreenId,
      startTime,
      endTime: endTime || '23:00',
      date,
      basePrice: Number(basePrice),
      screenType: screenType || 'Standard 2D',
    });

    res.status(201).json({ success: true, message: 'Showtime scheduled successfully.', showtime });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/showtimes/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await dbShowtimes.delete(req.params.id);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Showtime not found.' });
      return;
    }
    res.json({ success: true, message: 'Showtime deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. SEAT INVENTORY & ATOMIC RESERVATIONS
// ==========================================
apiRouter.get('/showtimes/:id/seats', async (req: Request, res: Response) => {
  try {
    const showtime = await dbShowtimes.findById(req.params.id);
    if (!showtime) {
      res.status(404).json({ success: false, error: 'Showtime not found.' });
      return;
    }

    const screen = await dbScreens.findById(showtime.screenId);
    const seats = await dbSeats.getOrCreateSeatsForShowtime(showtime, screen);

    // Summary statistics
    const total = seats.length;
    const booked = seats.filter((s) => s.status === 'booked').length;
    const held = seats.filter((s) => s.status === 'held').length;
    const available = seats.filter((s) => s.status === 'available').length;

    res.json({
      success: true,
      showtimeId: showtime._id || showtime.id,
      stats: { total, available, held, booked },
      holdDurationMs: HOLD_DURATION_MS,
      seats,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Atomic Hold Endpoint (Locks seats for 5 mins for current user)
apiRouter.post('/showtimes/:id/hold-seats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { seatNumbers } = req.body;
    if (!Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      res.status(400).json({ success: false, error: 'seatNumbers array is required.' });
      return;
    }

    if (seatNumbers.length > 8) {
      res.status(400).json({ success: false, error: 'Maximum 8 seats can be reserved per booking.' });
      return;
    }

    const result = await dbSeats.holdSeats(req.params.id, seatNumbers, req.user!.id);
    if (!result.success) {
      res.status(409).json({ success: false, error: result.message || 'Seat hold conflict.' });
      return;
    }

    res.json({
      success: true,
      message: 'Seats held successfully for 5 minutes.',
      expiresAt: new Date(Date.now() + HOLD_DURATION_MS).toISOString(),
      holdDurationSeconds: 300,
      seats: result.seats,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Release held seats
apiRouter.post('/showtimes/:id/release-seats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { seatNumbers } = req.body;
    if (!Array.isArray(seatNumbers)) {
      res.status(400).json({ success: false, error: 'seatNumbers array is required.' });
      return;
    }

    await dbSeats.releaseSeats(req.params.id, seatNumbers, req.user!.id);
    res.json({ success: true, message: 'Seats released.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. BOOKINGS & CHECKOUT
// ==========================================
apiRouter.post('/bookings', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { showtimeId, seatNumbers, customerDetails, paymentMethod } = req.body;

    if (!showtimeId || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
      res.status(400).json({ success: false, error: 'showtimeId and seatNumbers are required.' });
      return;
    }

    const showtime = await dbShowtimes.findById(showtimeId);
    if (!showtime) {
      res.status(404).json({ success: false, error: 'Showtime not found.' });
      return;
    }

    const screen = await dbScreens.findById(showtime.screenId);
    const movie = await dbMovies.findById(showtime.movieId);
    const theatre = await dbTheatres.findById(showtime.theatreId);

    // Get current inventory to verify server pricing & availability
    const allSeats = await dbSeats.getOrCreateSeatsForShowtime(showtime, screen);
    const chosenSeats = allSeats.filter((s) => seatNumbers.includes(s.seatNumber));

    if (chosenSeats.length !== seatNumbers.length) {
      res.status(400).json({ success: false, error: 'One or more requested seats are invalid.' });
      return;
    }

    // Server-side calculation of pricing (NEVER trust frontend pricing!)
    const ticketSubtotal = chosenSeats.reduce((acc, s) => acc + s.price, 0);
    const convenienceFee = +(seatNumbers.length * 1.75).toFixed(2);
    const tax = +(ticketSubtotal * 0.08).toFixed(2);
    const grandTotal = +(ticketSubtotal + convenienceFee + tax).toFixed(2);

    // Generate unique human-readable booking reference e.g. IMV-2026-XXXXX
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const bookingReference = `IMV-${new Date().getFullYear()}-${randomHex}`;
    const transactionId = `TXN-SIM-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

    // Create Booking record
    const booking = await dbBookings.create({
      bookingReference,
      userId: req.user!.id,
      showtimeId,
      movieId: showtime.movieId,
      theatreId: showtime.theatreId,
      screenId: showtime.screenId,
      seats: chosenSeats.map((s) => ({
        seatNumber: s.seatNumber,
        tier: s.tier,
        price: s.price,
      })),
      ticketSubtotal,
      convenienceFee,
      tax,
      grandTotal,
      paymentStatus: 'completed',
      bookingStatus: 'confirmed',
      paymentMethod: paymentMethod || 'Development Simulated Card (Visa **** 4242)',
      transactionId,
      customerDetails: {
        name: customerDetails?.name || req.user!.name,
        email: customerDetails?.email || req.user!.email,
        phone: customerDetails?.phone || '',
      },
      bookingDate: new Date(),
    });

    // Confirm seats booking atomically
    const seatConfirmResult = await dbSeats.confirmSeatsBooking(
      showtimeId,
      seatNumbers,
      booking._id || booking.id,
      req.user!.id
    );

    if (!seatConfirmResult.success) {
      // Revert booking status if seat conflict occurred
      await dbBookings.update(booking._id || booking.id, {
        bookingStatus: 'cancelled',
        paymentStatus: 'refunded',
      });
      res.status(409).json({ success: false, error: seatConfirmResult.message || 'Seat lock expired during checkout. Please select seats again.' });
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Tickets reserved and booking confirmed successfully!',
      booking: {
        ...booking,
        movie: movie ? { title: movie.title, posterUrl: movie.posterUrl, duration: movie.duration, ageRating: movie.ageRating } : null,
        theatre: theatre ? { name: theatre.name, city: theatre.city, address: theatre.address } : null,
        showtime: { date: showtime.date, startTime: showtime.startTime, screenType: showtime.screenType },
      },
    });
  } catch (err: any) {
    console.error('Booking creation error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to process booking.' });
  }
});

apiRouter.get('/bookings/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await dbBookings.findByUser(req.user!.id);

    const enriched = await Promise.all(
      bookings.map(async (b) => {
        const movie = await dbMovies.findById(b.movieId);
        const theatre = await dbTheatres.findById(b.theatreId);
        const showtime = await dbShowtimes.findById(b.showtimeId);
        return {
          ...b,
          movie: movie ? { id: movie._id || movie.id, title: movie.title, posterUrl: movie.posterUrl, duration: movie.duration } : null,
          theatre: theatre ? { id: theatre._id || theatre.id, name: theatre.name, city: theatre.city, address: theatre.address } : null,
          showtime: showtime ? { id: showtime._id || showtime.id, date: showtime.date, startTime: showtime.startTime, screenType: showtime.screenType } : null,
        };
      })
    );

    res.json({ success: true, count: enriched.length, bookings: enriched });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/bookings/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const booking = await dbBookings.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ success: false, error: 'Booking not found.' });
      return;
    }

    // Only owner or admin can view
    if (booking.userId !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Unauthorized to view this booking.' });
      return;
    }

    const movie = await dbMovies.findById(booking.movieId);
    const theatre = await dbTheatres.findById(booking.theatreId);
    const showtime = await dbShowtimes.findById(booking.showtimeId);

    res.json({
      success: true,
      booking: {
        ...booking,
        movie,
        theatre,
        showtime,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Cancel booking
apiRouter.post('/bookings/:id/cancel', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const booking = await dbBookings.findById(req.params.id);
    if (!booking) {
      res.status(404).json({ success: false, error: 'Booking not found.' });
      return;
    }

    if (booking.userId !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, error: 'Unauthorized to cancel this booking.' });
      return;
    }

    if (booking.bookingStatus === 'cancelled') {
      res.status(400).json({ success: false, error: 'This booking is already cancelled.' });
      return;
    }

    // Release seats back to available inventory
    const seatNumbers = booking.seats.map((s: any) => s.seatNumber);
    await dbSeats.releaseBookedSeats(booking.showtimeId, seatNumbers);

    // Update booking status
    const updated = await dbBookings.update(booking._id || booking.id, {
      bookingStatus: 'cancelled',
      paymentStatus: 'refunded',
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Simulated refund processed to original payment method.',
      booking: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 8. ADMIN DASHBOARD & MANAGEMENT
// ==========================================
apiRouter.get('/admin/stats', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [movies, theatres, showtimes, users, bookings] = await Promise.all([
      dbMovies.findAll(),
      dbTheatres.findAll(),
      dbShowtimes.findAll(),
      dbUsers.findAll(),
      dbBookings.findAll(),
    ]);

    const confirmedBookings = bookings.filter((b) => b.bookingStatus === 'confirmed');
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.grandTotal || 0), 0);
    const totalTicketsSold = confirmedBookings.reduce((sum, b) => sum + (b.seats?.length || 0), 0);

    res.json({
      success: true,
      stats: {
        totalRevenue: +totalRevenue.toFixed(2),
        totalBookings: bookings.length,
        confirmedBookings: confirmedBookings.length,
        cancelledBookings: bookings.length - confirmedBookings.length,
        totalTicketsSold,
        activeMovies: movies.filter((m) => m.status === 'now_showing').length,
        upcomingMovies: movies.filter((m) => m.status === 'upcoming').length,
        totalTheatres: theatres.length,
        totalShowtimes: showtimes.length,
        totalUsers: users.length,
      },
      recentBookings: bookings.slice(0, 5),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/admin/bookings', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await dbBookings.findAll();
    const enriched = await Promise.all(
      bookings.map(async (b) => {
        const movie = await dbMovies.findById(b.movieId);
        const theatre = await dbTheatres.findById(b.theatreId);
        return {
          ...b,
          movieTitle: movie?.title || 'Unknown Movie',
          theatreName: theatre?.name || 'Unknown Theatre',
        };
      })
    );
    res.json({ success: true, count: enriched.length, bookings: enriched });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/admin/users', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const users = await dbUsers.findAll();
    res.json({ success: true, count: users.length, users });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
