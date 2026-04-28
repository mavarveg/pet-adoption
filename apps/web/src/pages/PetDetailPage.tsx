import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { petsApi, applicationsApi, ApiError, type Pet } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/Spinner';

const STATUS_STYLES: Record<Pet['status'], string> = {
  available: 'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  adopted:   'bg-gray-100 text-gray-500',
};

export function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const [success, setSuccess] = useState('');
  const [appError, setAppError] = useState('');

  useEffect(() => {
    if (!id) return;
    petsApi.getById(id)
      .then(setPet)
      .catch(() => setError('Pet not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!token || !id) { navigate('/login'); return; }
    setApplying(true);
    setAppError('');
    setSuccess('');
    try {
      await applicationsApi.submit(token, { petId: id, message: message || undefined });
      setSuccess('Application submitted! We\'ll review it soon. 🐾');
      setPet((p) => p ? { ...p, status: 'pending' } : p);
    } catch (err) {
      setAppError(err instanceof ApiError ? err.message : 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <Spinner className="py-32" />;
  if (error || !pet) return (
    <div className="py-20 text-center text-gray-400">
      {error || 'Pet not found.'}{' '}
      <Link to="/" className="text-brand-600 underline">Go back</Link>
    </div>
  );

  const SPECIES_EMOJI: Record<string, string> = { dog: '🐶', cat: '🐱', rabbit: '🐰' };
  const emoji = SPECIES_EMOJI[pet.species.toLowerCase()] ?? '🐾';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600">
        ← Back to listings
      </Link>

      <div className="card overflow-hidden">
        <div className="flex h-56 items-center justify-center bg-gradient-to-br from-brand-50 to-pink-100 text-8xl">
          {pet.imageUrl ? (
            <img src={pet.imageUrl} alt={pet.name} className="h-full w-full object-cover" />
          ) : emoji}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
              <p className="mt-1 capitalize text-gray-500">
                {pet.species}{pet.breed ? ` · ${pet.breed}` : ''}
                {pet.age != null ? ` · ${pet.age} years old` : ''}
              </p>
            </div>
            <span className={`badge text-sm ${STATUS_STYLES[pet.status]}`}>{pet.status}</span>
          </div>

          {pet.description && (
            <p className="mt-4 leading-relaxed text-gray-700">{pet.description}</p>
          )}

          {pet.status === 'available' && (
            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              {!user ? (
                <p className="text-sm text-gray-600">
                  <Link to="/login" className="font-medium text-brand-600 hover:underline">Sign in</Link>{' '}
                  to submit an adoption application.
                </p>
              ) : user.role === 'staff' ? (
                <p className="text-sm text-gray-500">Staff members cannot submit applications.</p>
              ) : (
                <>
                  <h3 className="mb-2 font-semibold text-gray-800">Apply to adopt {pet.name}</h3>
                  <textarea
                    className="input mb-3 h-24 resize-none"
                    placeholder="Tell us a bit about yourself and why you'd like to adopt this pet…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  {appError && <p className="mb-2 text-sm text-red-600">{appError}</p>}
                  {success && <p className="mb-2 text-sm text-green-600">{success}</p>}
                  <button className="btn-primary" onClick={handleApply} disabled={applying}>
                    {applying ? 'Submitting…' : 'Submit Application'}
                  </button>
                </>
              )}
            </div>
          )}

          {pet.status !== 'available' && (
            <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
              This pet is currently <strong>{pet.status}</strong> and not accepting new applications.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
