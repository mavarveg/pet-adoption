import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, isStaff, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-brand-600">
          🐾 PetAdopt
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-gray-500 sm:block">
                Hi, <span className="font-medium text-gray-800">{user.name}</span>
                {isStaff && (
                  <span className="ml-1 badge bg-brand-100 text-brand-700">staff</span>
                )}
              </span>
              {!isStaff && (
                <Link to="/my-applications" className="text-sm font-medium text-gray-600 hover:text-brand-600">
                  My Applications
                </Link>
              )}
              {isStaff && (
                <Link to="/staff" className="text-sm font-medium text-gray-600 hover:text-brand-600">
                  Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="btn-outline text-xs">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline text-sm">Login</Link>
              <Link to="/register" className="btn-primary text-sm">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
