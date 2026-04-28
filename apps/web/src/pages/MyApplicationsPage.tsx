import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { applicationsApi, ApiError, type Application } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/Spinner';

const STATUS_STYLES: Record<Application['status'], string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export function MyApplicationsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    applicationsApi.mine(token)
      .then(setApps)
      .catch((err: unknown) => setError(err instanceof ApiError ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [token, navigate]);

  if (loading) return <Spinner className="py-32" />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Applications</h1>

      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {apps.length === 0 ? (
        <div className="py-20 text-center text-gray-400">
          No applications yet.{' '}
          <Link to="/" className="text-brand-600 underline">Browse pets</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <div key={app.id} className="card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    to={`/pets/${app.petId}`}
                    className="font-semibold text-gray-900 hover:text-brand-600 transition-colors"
                  >
                    {app.petName}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">
                    {app.petSpecies} · Applied {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                  {app.message && (
                    <p className="mt-2 text-sm text-gray-500">"{app.message}"</p>
                  )}
                </div>
                <span className={`badge shrink-0 ${STATUS_STYLES[app.status]}`}>{app.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
