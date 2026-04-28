import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi, ApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { accessToken, user } = await authApi.login({ email, password });
      login(accessToken, user);
      navigate(user.role === 'staff' ? '/staff' : '/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="card w-full max-w-md p-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Welcome back</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          No account?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline">
            Sign up
          </Link>
        </p>

        <div className="mt-6 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
          <p className="font-medium">Seed credentials</p>
          <p>Staff: staff@petadopt.io / staffpass123</p>
          <p>User: alice@example.com / userpass123</p>
        </div>
      </div>
    </div>
  );
}
