import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { Building2, CalendarCheck, Heart, LogIn, ShieldCheck, UserRound } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from './api/authApi';

import RoomsPage from './pages/RoomsPage.jsx';
import RoomDetailPage from './pages/RoomDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import BookingsPage from './pages/BookingsPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminPage from './pages/AdminPage.jsx';

function App() {
  const isAuthenticated = Boolean(localStorage.getItem('accessToken'));
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
  });

  const isAdmin = Boolean(profileQuery.data?.is_staff);

  return (
      <div className="app-shell">
        <header className="topbar">
          <Link to="/" className="brand">
          <span className="brand-mark">
            <Building2 size={22} />
          </span>
            <span>
            <strong>Hotel Complex</strong>
            <small>гостиничный комплекс</small>
          </span>
          </Link>

          <nav className="nav">
            <NavLink to="/" end>
              Номера
            </NavLink>
            <NavLink to="/bookings">
              <CalendarCheck size={18} />
              Брони
            </NavLink>
            <NavLink to="/favorites">
              <Heart size={18} />
              Избранное
            </NavLink>
            <NavLink to="/profile">
              <UserRound size={18} />
              Профиль
            </NavLink>
            {isAdmin && (
                <NavLink to="/admin">
                  <ShieldCheck size={18} />
                  Админ
                </NavLink>
            )}
          </nav>

          <Link className="login-link" to="/login">
            <LogIn size={18} />
            {isAuthenticated ? 'Аккаунт' : 'Войти'}
          </Link>
        </header>

        <main className="main">
          <Routes>
            <Route path="/" element={<RoomsPage />} />
            <Route path="/rooms/:roomId" element={<RoomDetailPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
      </div>
  );
}

export default App;