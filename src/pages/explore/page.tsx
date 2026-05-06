import { useState } from 'react';
import { Navbar } from '../home/components/Navbar';
import { MapView } from './components/MapView';
import { SpotList } from './components/SpotList';
import { FilterBar } from './components/FilterBar';
import { BottomNav } from '../../components/feature/BottomNav';
import { StatusBar } from '../../components/feature/StatusBar';

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);

  const handleSpotSelect = (spotId: number) => {
    setSelectedSpotId(spotId);
    setViewMode('map');
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      <StatusBar />
      <Navbar />
      <div className="pt-16">
        <FilterBar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        {viewMode === 'map' ? (
          <MapView 
            selectedCategory={selectedCategory} 
            searchQuery={searchQuery} 
            selectedSpotId={selectedSpotId}
            onClearSelection={() => setSelectedSpotId(null)}
          />
        ) : (
          <SpotList 
            selectedCategory={selectedCategory} 
            searchQuery={searchQuery}
            onSpotSelect={handleSpotSelect}
          />
        )}
      </div>
      <BottomNav />
    </div>
  );
}