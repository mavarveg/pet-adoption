import { Link } from 'react-router-dom';
import type { Pet } from '../lib/api';

const STATUS_STYLES: Record<Pet['status'], string> = {
  available: 'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  adopted:   'bg-gray-100 text-gray-500',
};

const SPECIES_EMOJI: Record<string, string> = {
  dog: '🐶', cat: '🐱', rabbit: '🐰', bird: '🐦', fish: '🐠',
};

export function PetCard({ pet }: { pet: Pet }) {
  const emoji = SPECIES_EMOJI[pet.species.toLowerCase()] ?? '🐾';

  return (
    <Link to={`/pets/${pet.id}`} className="card block overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex h-36 items-center justify-center bg-gradient-to-br from-brand-50 to-pink-100 text-6xl">
        {pet.imageUrl ? (
          <img src={pet.imageUrl} alt={pet.name} className="h-full w-full object-cover" />
        ) : (
          emoji
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{pet.name}</h3>
            <p className="text-sm capitalize text-gray-500">
              {pet.species}{pet.breed ? ` · ${pet.breed}` : ''}
              {pet.age != null ? ` · ${pet.age}y` : ''}
            </p>
          </div>
          <span className={`badge ${STATUS_STYLES[pet.status]}`}>{pet.status}</span>
        </div>
        {pet.description && (
          <p className="mt-2 line-clamp-2 text-xs text-gray-500">{pet.description}</p>
        )}
      </div>
    </Link>
  );
}
