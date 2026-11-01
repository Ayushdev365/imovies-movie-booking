import { Movie, Theatre, Showtime, Seat, Booking, User, AdminStats } from '../types/index.js';

const API_BASE = '/api/v1';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('imovies_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'API request failed');
  }
  return data;
}

export const api = {
  // Auth
  async register(payload: { name: string; email: string; password: string; phone?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; token: string; user: User; message: string }>(res);
  },

  async login(payload: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; token: string; user: User; message: string }>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; user: User }>(res);
  },

  async updateProfile(payload: { name: string; phone?: string }) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; user: User; message: string }>(res);
  },

  // Movies
  async getMovies(params?: { status?: string; search?: string; genre?: string; language?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    if (params?.genre) query.append('genre', params.genre);
    if (params?.language) query.append('language', params.language);

    const res = await fetch(`${API_BASE}/movies?${query.toString()}`);
    return handleResponse<{ success: boolean; count: number; movies: Movie[] }>(res);
  },

  async getMovie(id: string) {
    const res = await fetch(`${API_BASE}/movies/${id}`);
    return handleResponse<{ success: boolean; movie: Movie }>(res);
  },

  async createMovie(payload: Partial<Movie>) {
    const res = await fetch(`${API_BASE}/movies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; movie: Movie; message: string }>(res);
  },

  async updateMovie(id: string, payload: Partial<Movie>) {
    const res = await fetch(`${API_BASE}/movies/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; movie: Movie; message: string }>(res);
  },

  async deleteMovie(id: string) {
    const res = await fetch(`${API_BASE}/movies/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Theatres
  async getTheatres(city?: string) {
    const query = city ? `?city=${encodeURIComponent(city)}` : '';
    const res = await fetch(`${API_BASE}/theatres${query}`);
    return handleResponse<{ success: boolean; count: number; theatres: Theatre[] }>(res);
  },

  async getTheatre(id: string) {
    const res = await fetch(`${API_BASE}/theatres/${id}`);
    return handleResponse<{ success: boolean; theatre: Theatre; screens: any[] }>(res);
  },

  async createTheatre(payload: Partial<Theatre>) {
    const res = await fetch(`${API_BASE}/theatres`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; theatre: Theatre; message: string }>(res);
  },

  async deleteTheatre(id: string) {
    const res = await fetch(`${API_BASE}/theatres/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Showtimes
  async getShowtimes(params?: { movieId?: string; theatreId?: string; date?: string }) {
    const query = new URLSearchParams();
    if (params?.movieId) query.append('movieId', params.movieId);
    if (params?.theatreId) query.append('theatreId', params.theatreId);
    if (params?.date) query.append('date', params.date);

    const res = await fetch(`${API_BASE}/showtimes?${query.toString()}`);
    return handleResponse<{ success: boolean; count: number; showtimes: Showtime[] }>(res);
  },

  async getShowtime(id: string) {
    const res = await fetch(`${API_BASE}/showtimes/${id}`);
    return handleResponse<{ success: boolean; showtime: Showtime }>(res);
  },

  async createShowtime(payload: any) {
    const res = await fetch(`${API_BASE}/showtimes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; showtime: Showtime; message: string }>(res);
  },

  async deleteShowtime(id: string) {
    const res = await fetch(`${API_BASE}/showtimes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Seats & Holds
  async getSeats(showtimeId: string) {
    const res = await fetch(`${API_BASE}/showtimes/${showtimeId}/seats`);
    return handleResponse<{
      success: boolean;
      showtimeId: string;
      stats: { total: number; available: number; held: number; booked: number };
      holdDurationMs: number;
      seats: Seat[];
    }>(res);
  },

  async holdSeats(showtimeId: string, seatNumbers: string[]) {
    const res = await fetch(`${API_BASE}/showtimes/${showtimeId}/hold-seats`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ seatNumbers }),
    });
    return handleResponse<{ success: boolean; message: string; expiresAt: string; holdDurationSeconds: number; seats: Seat[] }>(res);
  },

  async releaseSeats(showtimeId: string, seatNumbers: string[]) {
    const res = await fetch(`${API_BASE}/showtimes/${showtimeId}/release-seats`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ seatNumbers }),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Bookings
  async createBooking(payload: {
    showtimeId: string;
    seatNumbers: string[];
    customerDetails: { name: string; email: string; phone: string };
    paymentMethod: string;
  }) {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; booking: Booking; message: string }>(res);
  },

  async getMyBookings() {
    const res = await fetch(`${API_BASE}/bookings/my`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; count: number; bookings: Booking[] }>(res);
  },

  async getBooking(id: string) {
    const res = await fetch(`${API_BASE}/bookings/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; booking: Booking }>(res);
  },

  async cancelBooking(id: string) {
    const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; message: string; booking: Booking }>(res);
  },

  // Admin
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; stats: AdminStats; recentBookings: Booking[] }>(res);
  },

  async getAdminBookings() {
    const res = await fetch(`${API_BASE}/admin/bookings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; count: number; bookings: any[] }>(res);
  },

  async getAdminUsers() {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<{ success: boolean; count: number; users: User[] }>(res);
  },

  // Health & GitHub
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<{ success: boolean; database: { connectedToAtlas: boolean; statusMessage: string } }>(res);
  },

  async getGithubInfo() {
    const res = await fetch(`${API_BASE}/github/info`);
    return handleResponse<{
      success: boolean;
      repository: string;
      userProfileUrl: string;
      suggestedRepoUrl: string;
      branch: string;
      syncStatus: string;
      stepsToConnect: string[];
    }>(res);
  },
};
