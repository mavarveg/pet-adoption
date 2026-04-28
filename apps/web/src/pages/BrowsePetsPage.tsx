import { useState, useEffect, useCallback } from 'react';
import { petsApi, ApiError, type PaginatedPets } from '../lib/api';
import { PetCard } from '../components/PetCard';
import { Spinner } from '../components/Spinner';

const SPECIES = ['', 'dog', 'cat', 'rabbit', 'bird'];
const PAGE_SIZE = 9;

export function BrowsePetsPage() {
  const [data, setData] = useState<PaginatedPets | null>(null);
  const [species, setSpecies] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await petsApi.list({ page, limit: PAGE_SIZE, species: species || undefined });
      setData(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load pets');
    } finally {
      setLoading(false);
    }
  }, [page, species]);

  useEffect(() => { void load(); }, [load]);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Pets available for adoption</h1>
        <div className="ml-auto flex gap-2">
          {SPECIES.map((s) => (
            <button
              key={s || 'all'}
              onClick={() => { setSpecies(s); setPage(1); }}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                species === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <Spinner className="py-20" />
      ) : data && data.data.length === 0 ? (
        <div className="py-20 text-center text-gray-400">No pets found for this filter.</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data?.data.map((pet) => <PetCard key={pet.id} pet={pet} />)}
        </div>
      )}

      {data && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            className="btn-outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            className="btn-outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
