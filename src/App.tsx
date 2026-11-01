import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { BookingProvider } from './context/BookingContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { GitHubModal } from './components/GitHubModal.js';

// Pages
import { HomePage } from './pages/HomePage.js';
import { MoviesPage } from './pages/MoviesPage.js';
import { MovieDetailsPage } from './pages/MovieDetailsPage.js';
import { SearchResultsPage } from './pages/SearchResultsPage.js';
import { TheatreSelectionPage } from './pages/TheatreSelectionPage.js';
import { ShowtimeSelectionPage } from './pages/ShowtimeSelectionPage.js';
import { SeatSelectionPage } from './pages/SeatSelectionPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { BookingConfirmationPage } from './pages/BookingConfirmationPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { UserProfilePage } from './pages/UserProfilePage.js';
import { MyBookingsPage } from './pages/MyBookingsPage.js';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';
import { MovieManagementPage } from './pages/admin/MovieManagementPage.js';
import { TheatreManagementPage } from './pages/admin/TheatreManagementPage.js';
import { ShowtimeManagementPage } from './pages/admin/ShowtimeManagementPage.js';
import { BookingManagementPage } from './pages/admin/BookingManagementPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';
import { GitHubSyncPage } from './pages/GitHubSyncPage.js';

function MainRouter() {
  const { user } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [routeState, setRouteState] = useState<any>({});
  const [githubModalOpen, setGithubModalOpen] = useState<boolean>(false);

  const navigate = (path: string, state?: any) => {
    setCurrentPath(path);
    if (state !== undefined) {
      setRouteState(state);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Render current page based on path
  const renderPage = () => {
    // 1. Home
    if (currentPath === '/') {
      return <HomePage navigate={navigate} />;
    }

    // 2. Movies
    if (currentPath === '/movies') {
      return <MoviesPage navigate={navigate} initialFilter={routeState?.filter} />;
    }

    // 3. Movie Details
    if (currentPath.startsWith('/movies/')) {
      const movieId = currentPath.replace('/movies/', '');
      return <MovieDetailsPage movieId={movieId} navigate={navigate} />;
    }

    // 4. Search Results
    if (currentPath === '/search') {
      return <SearchResultsPage query={routeState?.q || ''} navigate={navigate} />;
    }

    // 5. Theatre Selection
    if (currentPath === '/theatres') {
      return <TheatreSelectionPage navigate={navigate} selectedTheatreId={routeState?.theatreId} />;
    }

    // 6. Showtime Selection
    if (currentPath === '/showtimes') {
      return <ShowtimeSelectionPage movieId={routeState?.movieId} navigate={navigate} />;
    }

    // 7. Interactive Seat Selection
    if (currentPath === '/seats') {
      return <SeatSelectionPage showtimeId={routeState?.showtimeId} navigate={navigate} />;
    }

    // 8. Checkout
    if (currentPath === '/checkout') {
      return <CheckoutPage navigate={navigate} bookingState={routeState} />;
    }

    // 9. Booking Confirmation
    if (currentPath === '/confirmation') {
      return <BookingConfirmationPage booking={routeState?.booking} navigate={navigate} />;
    }

    // 10. Login
    if (currentPath === '/login') {
      return <LoginPage navigate={navigate} redirectTo={routeState?.redirectTo} />;
    }

    // 11. Registration
    if (currentPath === '/register') {
      return <RegisterPage navigate={navigate} />;
    }

    // 12. User Profile
    if (currentPath === '/profile') {
      return <UserProfilePage navigate={navigate} />;
    }

    // 13. My Bookings
    if (currentPath === '/my-bookings') {
      return <MyBookingsPage navigate={navigate} />;
    }

    // 14. Admin Dashboard
    if (currentPath === '/admin') {
      if (user && user.role !== 'admin') {
        return (
          <div className="max-w-md mx-auto py-20 text-center space-y-3">
            <h2 className="text-xl font-bold text-white">Administrative Access Required</h2>
            <p className="text-xs text-zinc-400">Please sign in with administrator credentials.</p>
            <button onClick={() => navigate('/login')} className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-semibold">
              Sign In as Admin
            </button>
          </div>
        );
      }
      return <AdminDashboardPage navigate={navigate} />;
    }

    // 15. Movie Management
    if (currentPath === '/admin/movies') {
      return <MovieManagementPage navigate={navigate} />;
    }

    // 16. Theatre Management
    if (currentPath === '/admin/theatres') {
      return <TheatreManagementPage navigate={navigate} />;
    }

    // 17. Showtime Management
    if (currentPath === '/admin/showtimes') {
      return <ShowtimeManagementPage navigate={navigate} />;
    }

    // 18. Booking Management
    if (currentPath === '/admin/bookings') {
      return <BookingManagementPage navigate={navigate} />;
    }

    // Dedicated GitHub Integration Page
    if (currentPath === '/github-sync') {
      return <GitHubSyncPage navigate={navigate} />;
    }

    // 19. 404 Page
    return <NotFoundPage navigate={navigate} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0c] text-zinc-100 selection:bg-red-600 selection:text-white font-sans antialiased">
      {/* Navbar */}
      <Navbar
        currentPath={currentPath}
        navigate={navigate}
        onOpenGithubModal={() => setGithubModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        {renderPage()}
      </main>

      {/* Footer */}
      <Footer
        navigate={navigate}
        onOpenGithubModal={() => setGithubModalOpen(true)}
      />

      {/* GitHub Integration Modal */}
      <GitHubModal
        isOpen={githubModalOpen}
        onClose={() => setGithubModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <MainRouter />
      </BookingProvider>
    </AuthProvider>
  );
}
