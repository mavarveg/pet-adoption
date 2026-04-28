import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { petsApi, applicationsApi, ApiError, type Pet, type Application } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/Spinner';

type Tab = 'pets' | 'applications';

function AddPetModal({ token, onClose, onCreated }: {
  token: string;
  onClose: () => void;
  onCreated: (pet: Pet) => void;
}) {
  const [form, setForm] = useState({ name: '', species: '', breed: '', age: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const pet = await petsApi.create(token, {
        name: form.name,
        species: form.species,
        breed: form.breed || undefined,
        age: form.age ? parseInt(form.age, 10) : undefined,
        description: form.description || undefined,
      } as Partial<Pet>);
      onCreated(pet);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create pet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="card w-full max-w-md p-6">
        <h2 className="mb-4 text-xl font-bold">Add New Pet</h2>
        {error && <div className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input className="input" placeholder="Name *" value={form.name} onChange={set('name')} required />
          <input className="input" placeholder="Species * (dog, cat, rabbit…)" value={form.species} onChange={set('species')} required />
          <input className="input" placeholder="Breed" value={form.breed} onChange={set('breed')} />
          <input className="input" type="number" placeholder="Age (years)" value={form.age} onChange={set('age')} min={0} max={30} />
          <textarea className="input h-20 resize-none" placeholder="Description" value={form.description} onChange={set('description')} />
          <div className="flex gap-2 pt-2">
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Adding…' : 'Add Pet'}
            </button>
            <button type="button" className="btn-outline flex-1" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function StaffDashboardPage() {
  const { token, isStaff } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('pets');
  const [pets, setPets] = useState<Pet[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !isStaff) { navigate('/'); }
  }, [token, isStaff, navigate]);

  const loadPets = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await petsApi.list({ page: 1, limit: 50 });
      setPets(res.data);
    } finally { setLoading(false); }
  }, [token]);

  const loadApps = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const list = await applicationsApi.all(token);
      setApps(list);
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    if (tab === 'pets') void loadPets();
    else void loadApps();
  }, [tab, loadPets, loadApps]);

  const handleApprove = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    try {
      await applicationsApi.approve(token, id);
      setApps((prev) => prev.map((a) => a.id === id ? { ...a, status: 'approved' } : a));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Error');
    } finally { setActionLoading(null); }
  };

  const handleReject = async (id: string) => {
    if (!token) return;
    setActionLoading(id);
    try {
      await applicationsApi.reject(token, id);
      setApps((prev) => prev.map((a) => a.id === id ? { ...a, status: 'rejected' } : a));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Error');
    } finally { setActionLoading(null); }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
        {tab === 'pets' && (
          <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add Pet</button>
        )}
      </div>

      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {(['pets', 'applications'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <Spinner className="py-20" /> : tab === 'pets' ? (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Species</th>
                <th className="px-4 py-3 text-left">Breed</th>
                <th className="px-4 py-3 text-left">Age</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pets.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 capitalize">{p.species}</td>
                  <td className="px-4 py-3 text-gray-500">{p.breed ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{p.age != null ? `${p.age}y` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${
                      p.status === 'available' ? 'bg-green-100 text-green-700' :
                      p.status === 'pending'   ? 'bg-yellow-100 text-yellow-700' :
                                                 'bg-gray-100 text-gray-500'
                    }`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.length === 0 ? (
            <div className="py-20 text-center text-gray-400">No applications found.</div>
          ) : apps.map((app) => (
            <div key={app.id} className="card flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{app.petName}</p>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">
                  {app.petSpecies} · Applied {new Date(app.createdAt).toLocaleDateString()}
                </p>
                {app.message && (
                  <p className="mt-1.5 text-sm text-gray-500 truncate">"{app.message}"</p>
                )}
              </div>
              <span className={`badge shrink-0 ${
                app.status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
                app.status === 'approved' ? 'bg-green-100 text-green-700' :
                                            'bg-red-100 text-red-700'
              }`}>{app.status}</span>
              {app.status === 'pending' && token && (
                <div className="flex gap-2 shrink-0">
                  <button
                    className="btn-primary text-xs"
                    disabled={actionLoading === app.id}
                    onClick={() => handleApprove(app.id)}
                  >Approve</button>
                  <button
                    className="btn-danger text-xs"
                    disabled={actionLoading === app.id}
                    onClick={() => handleReject(app.id)}
                  >Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdd && token && (
        <AddPetModal
          token={token}
          onClose={() => setShowAdd(false)}
          onCreated={(pet) => { setPets((p) => [pet, ...p]); setShowAdd(false); }}
        />
      )}
    </div>
  );
}
