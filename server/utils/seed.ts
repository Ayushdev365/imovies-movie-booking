import bcrypt from 'bcryptjs';
import {
  dbUsers,
  dbMovies,
  dbTheatres,
  dbScreens,
  dbShowtimes,
  dbSeats,
  dbBookings,
} from '../services/dbService.js';

export async function seedDatabase(): Promise<void> {
  const existingMovies = await dbMovies.findAll();
  if (existingMovies && existingMovies.length > 0) {
    console.log('[Seed] Database already seeded with movies.');
    return;
  }

  console.log('[Seed] Populating initial IMovies database...');

  // 1. Create Default Users (Admin & User)
  const passwordHashAdmin = await bcrypt.hash('Admin@12345', 10);
  const passwordHashUser = await bcrypt.hash('User@12345', 10);

  const admin = await dbUsers.create({
    name: 'Ayush Admin',
    email: 'admin@imovies.com',
    passwordHash: passwordHashAdmin,
    role: 'admin',
    phone: '+1 (555) 019-2834',
  });

  const demoUser = await dbUsers.create({
    name: 'Alex Mercer',
    email: 'user@imovies.com',
    passwordHash: passwordHashUser,
    role: 'user',
    phone: '+1 (555) 482-9912',
  });

  console.log('[Seed] Users seeded: admin@imovies.com & user@imovies.com');

  // 2. Create Theatres
  const theatresData = [
    {
      name: 'IMovies Grand IMAX Palace',
      city: 'New York',
      address: '1540 Broadway, Times Square, New York, NY 10036',
      facilities: ['IMAX Laser 4K', 'Dolby Atmos', 'VIP Recliners', 'Gourmet Dine-In', 'Valet Parking'],
      phone: '+1 (212) 555-0143',
      screensCount: 3,
    },
    {
      name: 'IMovies Sunset Dolby Cinema',
      city: 'Los Angeles',
      address: '6801 Hollywood Blvd, Hollywood, Los Angeles, CA 90028',
      facilities: ['Dolby Cinema', 'Laser Projection', 'Heated Recliner Loungers', 'Cocktail Bar'],
      phone: '+1 (323) 555-0189',
      screensCount: 3,
    },
    {
      name: 'IMovies Millennium Cineplex',
      city: 'Chicago',
      address: '600 E Grand Ave, Navy Pier, Chicago, IL 60611',
      facilities: ['4DX Motion Seats', 'Dolby Atmos', 'Premium Sound', 'Cafeteria'],
      phone: '+1 (312) 555-0177',
      screensCount: 2,
    },
    {
      name: 'IMovies Leicester Square Flagship',
      city: 'London',
      address: 'Leicester Square, West End, London WC2H 7NA',
      facilities: ['IMAX Dual Laser', 'Royal Balcony', 'Dine-In Luxury', 'Champagne Bar'],
      phone: '+44 20 7946 0912',
      screensCount: 2,
    },
  ];

  const createdTheatres = [];
  for (const t of theatresData) {
    const theatre = await dbTheatres.create(t);
    createdTheatres.push(theatre);
  }

  // 3. Create Screens for Theatres
  const createdScreens = [];
  for (const theatre of createdTheatres) {
    const s1 = await dbScreens.create({
      theatreId: theatre._id || theatre.id,
      name: `${theatre.name} - Screen 1 (IMAX Laser)`,
      screenType: 'IMAX',
      rows: 8,
      cols: 12,
      totalSeats: 96,
      seatingTierConfig: [
        { tier: 'VIP', rows: ['A', 'B'], priceMultiplier: 1.6 },
        { tier: 'Premium', rows: ['C', 'D', 'E'], priceMultiplier: 1.3 },
        { tier: 'Standard', rows: ['F', 'G', 'H'], priceMultiplier: 1.0 },
      ],
    });
    const s2 = await dbScreens.create({
      theatreId: theatre._id || theatre.id,
      name: `${theatre.name} - Screen 2 (Dolby Atmos)`,
      screenType: 'Dolby Atmos',
      rows: 8,
      cols: 12,
      totalSeats: 96,
      seatingTierConfig: [
        { tier: 'VIP', rows: ['A', 'B'], priceMultiplier: 1.5 },
        { tier: 'Premium', rows: ['C', 'D', 'E'], priceMultiplier: 1.25 },
        { tier: 'Standard', rows: ['F', 'G', 'H'], priceMultiplier: 1.0 },
      ],
    });
    createdScreens.push(s1, s2);
  }

  // 4. Create Blockbuster Movies with high-res Unsplash cinematic photos
  const moviesData = [
    {
      title: 'Dune: Part Two',
      description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between love and the fate of the known universe.',
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
      genre: ['Sci-Fi', 'Adventure', 'Action'],
      language: ['English'],
      duration: 166,
      releaseDate: '2024-03-01',
      rating: 8.8,
      cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem', 'Austin Butler'],
      director: 'Denis Villeneuve',
      status: 'now_showing',
      ageRating: 'PG-13',
      trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    },
    {
      title: 'Oppenheimer',
      description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
      posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=800&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=1600&auto=format&fit=crop',
      genre: ['Biography', 'Drama', 'History'],
      language: ['English'],
      duration: 180,
      releaseDate: '2023-07-21',
      rating: 8.9,
      cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
      director: 'Christopher Nolan',
      status: 'now_showing',
      ageRating: 'R',
      trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    },
    {
      title: 'Interstellar: 10th Anniversary IMAX Re-Release',
      description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.',
      posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1600&auto=format&fit=crop',
      genre: ['Sci-Fi', 'Adventure', 'Drama'],
      language: ['English'],
      duration: 169,
      releaseDate: '2024-11-01',
      rating: 9.1,
      cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
      director: 'Christopher Nolan',
      status: 'now_showing',
      ageRating: 'PG-13',
    },
    {
      title: 'Gladiator II',
      description: 'Years after witnessing the death of Maximus at the hands of his uncle, Lucius must enter the Colosseum after his home is conquered by the tyrannical Emperors who now lead Rome.',
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=1600&auto=format&fit=crop',
      genre: ['Action', 'Adventure', 'Drama'],
      language: ['English'],
      duration: 148,
      releaseDate: '2024-11-22',
      rating: 8.4,
      cast: ['Paul Mescal', 'Pedro Pascal', 'Denzel Washington', 'Connie Nielsen'],
      director: 'Ridley Scott',
      status: 'now_showing',
      ageRating: 'R',
    },
    {
      title: 'The Batman: Part II',
      description: 'The Dark Knight continues his relentless crusade through Gotham City underbelly, untangling corruption reaching into the highest chambers of the metropolis.',
      posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=800&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?q=80&w=1600&auto=format&fit=crop',
      genre: ['Action', 'Crime', 'Mystery'],
      language: ['English'],
      duration: 165,
      releaseDate: '2026-10-02',
      rating: 8.7,
      cast: ['Robert Pattinson', 'Zoë Kravitz', 'Colin Farrell', 'Andy Serkis'],
      director: 'Matt Reeves',
      status: 'upcoming',
      ageRating: 'PG-13',
    },
    {
      title: 'Spider-Man: Beyond the Spider-Verse',
      description: 'Miles Morales embarks on an emotional multidimensional battle to rewrite his own destiny and save all universes from collapse.',
      posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=800&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1600&auto=format&fit=crop',
      genre: ['Animation', 'Action', 'Adventure', 'Sci-Fi'],
      language: ['English'],
      duration: 140,
      releaseDate: '2026-12-18',
      rating: 9.0,
      cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Daniel Kaluuya'],
      director: 'Joaquim Dos Santos, Kemp Powers',
      status: 'upcoming',
      ageRating: 'PG',
    },
    {
      title: 'Avatar: Fire and Ash',
      description: 'Jake Sully and Neytiri encounter a new, aggressive tribe of Na\'vi known as the Ash People who dwell around volcanic biomes on Pandora.',
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
      backdropUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop',
      genre: ['Sci-Fi', 'Adventure', 'Fantasy'],
      language: ['English'],
      duration: 190,
      releaseDate: '2026-12-25',
      rating: 8.6,
      cast: ['Sam Worthington', 'Zoe Saldana', 'Sigourney Weaver', 'Stephen Lang'],
      director: 'James Cameron',
      status: 'upcoming',
      ageRating: 'PG-13',
    },
  ];

  const createdMovies = [];
  for (const m of moviesData) {
    const movie = await dbMovies.create(m);
    createdMovies.push(movie);
  }

  // 5. Generate Showtimes for current dates
  const today = new Date();
  const dateStrings: string[] = [];
  for (let d = 0; d < 7; d++) {
    const target = new Date(today);
    target.setDate(today.getDate() + d);
    dateStrings.push(target.toISOString().split('T')[0]);
  }

  const timeSlots = [
    { start: '10:30', end: '13:15' },
    { start: '14:00', end: '16:45' },
    { start: '17:30', end: '20:15' },
    { start: '21:00', end: '23:45' },
  ];

  const nowShowingMovies = createdMovies.filter((m) => m.status === 'now_showing');
  const createdShowtimes = [];

  for (const dateStr of dateStrings.slice(0, 4)) {
    for (const movie of nowShowingMovies) {
      for (const theatre of createdTheatres.slice(0, 2)) {
        const screens = createdScreens.filter((s) => s.theatreId === (theatre._id || theatre.id));
        const selectedScreen = screens[0] || createdScreens[0];

        // 2 slots per movie per day per theatre
        for (let i = 0; i < 2; i++) {
          const slot = timeSlots[i % timeSlots.length];
          const st = await dbShowtimes.create({
            movieId: movie._id || movie.id,
            theatreId: theatre._id || theatre.id,
            screenId: selectedScreen._id || selectedScreen.id,
            startTime: slot.start,
            endTime: slot.end,
            date: dateStr,
            basePrice: selectedScreen.screenType === 'IMAX' ? 18.5 : 14.0,
            screenType: selectedScreen.screenType,
          });
          createdShowtimes.push(st);
        }
      }
    }
  }

  // 6. Pre-generate seats for the first 3 showtimes and add a sample booking for Alex Mercer
  if (createdShowtimes.length > 0) {
    const sampleShowtime = createdShowtimes[0];
    const screen = createdScreens.find((s) => (s._id || s.id) === sampleShowtime.screenId) || createdScreens[0];
    const seats = await dbSeats.getOrCreateSeatsForShowtime(sampleShowtime, screen);

    // Book 2 seats for demoUser
    const sampleBookingRef = 'IMV-2026-89421';
    const sampleSeats = [seats[14], seats[15]]; // e.g. B3, B4
    const ticketSubtotal = sampleSeats.reduce((acc, s) => acc + s.price, 0);
    const convenienceFee = 3.5;
    const tax = +(ticketSubtotal * 0.08).toFixed(2);
    const grandTotal = +(ticketSubtotal + convenienceFee + tax).toFixed(2);

    const booking = await dbBookings.create({
      bookingReference: sampleBookingRef,
      userId: demoUser._id || demoUser.id,
      showtimeId: sampleShowtime._id || sampleShowtime.id,
      movieId: sampleShowtime.movieId,
      theatreId: sampleShowtime.theatreId,
      screenId: sampleShowtime.screenId,
      seats: sampleSeats.map((s) => ({
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
      paymentMethod: 'Simulation Card (Visa **** 4242)',
      transactionId: 'TXN-SIM-78912401',
      customerDetails: {
        name: demoUser.name,
        email: demoUser.email,
        phone: demoUser.phone,
      },
      bookingDate: new Date(),
    });

    await dbSeats.confirmSeatsBooking(
      sampleShowtime._id || sampleShowtime.id,
      sampleSeats.map((s) => s.seatNumber),
      booking._id || booking.id,
      demoUser._id || demoUser.id
    );

    console.log(`[Seed] Sample booking created: ${sampleBookingRef} for user ${demoUser.email}`);
  }

  console.log('[Seed] Database populated successfully with full cinema catalog.');
}
