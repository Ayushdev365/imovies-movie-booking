import { describe, it, expect, beforeAll } from 'vitest';
import express from 'express';
import request from 'supertest';
import { apiRouter } from '../server/routes/api.js';
import { seedDatabase } from '../server/utils/seed.js';

const app = express();
app.use(express.json());
app.use('/api/v1', apiRouter);

describe('IMovies API Suite', () => {
  let userToken: string;
  let adminToken: string;
  let sampleShowtimeId: string;
  let sampleSeats: string[] = [];
  let createdBookingId: string;

  beforeAll(async () => {
    await seedDatabase();
  });

  it('Health Check returns DB status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.database).toBeDefined();
  });

  it('Admin login returns JWT token and admin role', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@imovies.com', password: 'Admin@12345' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('admin');
    adminToken = res.body.token;
  });

  it('User registration creates account and returns token', async () => {
    const uniqueEmail = `testpatron_${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Jane Doe',
        email: uniqueEmail,
        password: 'Password@123',
        phone: '+1 (555) 392-1049',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.name).toBe('Jane Doe');
    userToken = res.body.token;
  });

  it('Retrieves movies catalog with filters', async () => {
    const res = await request(app).get('/api/v1/movies?status=now_showing');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.movies.length).toBeGreaterThan(0);
  });

  it('Retrieves theatres and showtimes', async () => {
    const theatresRes = await request(app).get('/api/v1/theatres');
    expect(theatresRes.status).toBe(200);
    expect(theatresRes.body.theatres.length).toBeGreaterThan(0);

    const showtimesRes = await request(app).get('/api/v1/showtimes');
    expect(showtimesRes.status).toBe(200);
    expect(showtimesRes.body.showtimes.length).toBeGreaterThan(0);
    sampleShowtimeId = showtimesRes.body.showtimes[0]._id || showtimesRes.body.showtimes[0].id;
  });

  it('Retrieves seat map for a showtime with independent availability', async () => {
    const res = await request(app).get(`/api/v1/showtimes/${sampleShowtimeId}/seats`);
    expect(res.status).toBe(200);
    expect(res.body.seats.length).toBeGreaterThan(0);
    expect(res.body.stats).toBeDefined();

    // Pick 2 available seats
    const available = res.body.seats.filter((s: any) => s.status === 'available');
    sampleSeats = [available[0].seatNumber, available[1].seatNumber];
    expect(sampleSeats.length).toBe(2);
  });

  it('Atomically holds seats for 5 minutes', async () => {
    const res = await request(app)
      .post(`/api/v1/showtimes/${sampleShowtimeId}/hold-seats`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ seatNumbers: sampleSeats });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.expiresAt).toBeDefined();
  });

  it('Prevents another user from holding the same seats (Conflict rejection)', async () => {
    // Another user tries to hold the same seats
    const otherUserEmail = `other_${Date.now()}@example.com`;
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Bob', email: otherUserEmail, password: 'Password@123' });

    const otherToken = regRes.body.token;

    const res = await request(app)
      .post(`/api/v1/showtimes/${sampleShowtimeId}/hold-seats`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ seatNumbers: [sampleSeats[0]] });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('Confirms booking, issues unique reference, and verifies price on server', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        showtimeId: sampleShowtimeId,
        seatNumbers: sampleSeats,
        customerDetails: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '+1 555-1234',
        },
        paymentMethod: 'Simulation Card (Visa **** 4242)',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.bookingReference).toMatch(/^IMV-/);
    expect(res.body.booking.grandTotal).toBeGreaterThan(0);
    createdBookingId = res.body.booking._id || res.body.booking.id;
  });

  it('Lists customer bookings in My Bookings history', async () => {
    const res = await request(app)
      .get('/api/v1/bookings/my')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.bookings.some((b: any) => (b._id || b.id) === createdBookingId)).toBe(true);
  });

  it('Cancels booking, releases seats, and marks status as cancelled/refunded', async () => {
    const res = await request(app)
      .post(`/api/v1/bookings/${createdBookingId}/cancel`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.booking.bookingStatus).toBe('cancelled');
    expect(res.body.booking.paymentStatus).toBe('refunded');

    // Verify seats are released back to available
    const seatRes = await request(app).get(`/api/v1/showtimes/${sampleShowtimeId}/seats`);
    const targetSeat = seatRes.body.seats.find((s: any) => s.seatNumber === sampleSeats[0]);
    expect(targetSeat.status).toBe('available');
  });

  it('Protects Admin Dashboard metrics from unprivileged users', async () => {
    const unauthRes = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${userToken}`);

    expect(unauthRes.status).toBe(403);

    const adminRes = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(adminRes.status).toBe(200);
    expect(adminRes.body.stats.totalBookings).toBeGreaterThan(0);
  });
});
