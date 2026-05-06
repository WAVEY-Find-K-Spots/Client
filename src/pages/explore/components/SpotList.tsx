
import { kSpots } from '../../../mocks/kSpots';
import { SpotCard } from './SpotCard';

interface SpotListProps {
  selectedCategory: string;
  searchQuery: string;
  onSpotSelect: (spotId: number) => void;
}

export function SpotList({ selectedCategory, searchQuery, onSpotSelect }: SpotListProps) {
  const filteredSpots = kSpots.filter((spot) => {
    const matchesCategory =
      selectedCategory === 'all' || spot.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (spot.description && spot.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-gray-900">
          <span className="text-teal-500">{filteredSpots.length}</span>개의 K-Spots
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSpots.map((spot) => (
          <SpotCard
            key={spot.id}
            spot={spot}
            onMapView={() => onSpotSelect(spot.id)}
          />
        ))}
      </div>

      {filteredSpots.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-search-line text-2xl text-gray-400"></i>
          </div>
          <p className="text-gray-500 text-sm font-medium">검색 결과가 없습니다</p>
          <p className="text-gray-400 text-xs mt-1">다른 키워드로 검색해보세요</p>
        </div>
      )}
    </div>
  );
}
