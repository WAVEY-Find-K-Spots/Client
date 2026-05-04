import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from '../../components/feature/BottomNav';
import { PlaceholderImage } from '../../components/base/PlaceholderImage';
import { kSpots } from '../../mocks/kSpots';
import { useGeolocation } from '../../hooks/useGeolocation';

const categoryLabels: Record<string, string> = {
  kdrama: '드라마',
  kmovie: '영화',
  kpop: 'K-POP',
  cafe: '카페',
  restaurant: '맛집',
  kheritage: '문화유산',
};

const spotCategories: Record<number, string[]> = {
  1: ['kdrama'],
  2: ['kdrama', 'kheritage'],
  3: ['kpop'],
  4: ['kmovie'],
  5: ['cafe'],
  6: ['restaurant'],
  7: ['kdrama'],
  8: ['kpop'],
  9: ['kdrama', 'kheritage'],
  10: ['cafe'],
  11: ['restaurant', 'kheritage'],
  12: ['landmark'],
};

const contentFilters = [
  { id: 'kdrama', label: 'K-드라마', icon: 'ri-tv-line' },
  { id: 'kmovie', label: 'K-영화', icon: 'ri-movie-line' },
  { id: 'kpop', label: 'K-POP', icon: 'ri-music-line' },
  { id: 'kheritage', label: '문화유산', icon: 'ri-ancient-gate-line' },
];

const typeFilters = [
  { id: 'restaurant', label: '맛집', icon: 'ri-restaurant-line' },
  { id: 'cafe', label: '카페', icon: 'ri-cup-line' },
  { id: 'accommodation', label: '숙소', icon: 'ri-hotel-line' },
  { id: 'convenience', label: '편의점', icon: 'ri-store-line' },
  { id: 'shopping', label: '쇼핑', icon: 'ri-shopping-bag-line' },
  { id: 'attraction', label: '명소', icon: 'ri-landscape-line' },
  { id: 'photobooth', label: '포토', icon: 'ri-camera-line' },
  { id: 'landmark', label: '랜드마크', icon: 'ri-building-line' },
];

const categoryColors: Record<string, string> = {
  kdrama: '#ec4899',
  kmovie: '#8b5cf6',
  kpop: '#14b8a6',
  cafe: '#f59e0b',
  restaurant: '#f97316',
  kheritage: '#10b981',
  landmark: '#6366f1',
  attraction: '#06b6d4',
  shopping: '#ec4899',
};

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

const SEOUL_BOUNDS = {
  north: 37.70,
  south: 37.45,
  east: 127.20,
  west: 126.70,
};

function getMarkerPosition(lat: number, lng: number) {
  const x = ((lng - SEOUL_BOUNDS.west) / (SEOUL_BOUNDS.east - SEOUL_BOUNDS.west)) * 100;
  const y = ((SEOUL_BOUNDS.north - lat) / (SEOUL_BOUNDS.north - SEOUL_BOUNDS.south)) * 100;
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
}

export default function MapPage() {
  const { location, loading: geoLoading, error: geoError, getLocation, startWatching } = useGeolocation();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'reviews'>('distance');
  const [sheetHeight, setSheetHeight] = useState<'collapsed' | 'half' | 'full'>('half');
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId],
    );
  };

  const clearFilters = () => setSelectedFilters([]);

  const spotsWithDist = useMemo(() => {
    return kSpots.map((spot) => {
      const dist = location && spot.lat && spot.lng
        ? getDistance(location.lat, location.lng, spot.lat, spot.lng)
        : Infinity;
      return { ...spot, distance: dist };
    });
  }, [location]);

  const filteredSpots = useMemo(() => {
    let list = spotsWithDist.filter((spot) => {
      if (selectedFilters.length === 0) return true;
      const spotCats = spotCategories[spot.id] || [spot.category];
      return selectedFilters.some((filter) => spotCats.includes(filter));
    });
    if (sortBy === 'distance') list = list.sort((a, b) => a.distance - b.distance);
    else if (sortBy === 'rating') list = list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'reviews') list = list.sort((a, b) => b.reviews - a.reviews);
    return list;
  }, [spotsWithDist, selectedFilters, sortBy]);

  const handleDragStart = useCallback((clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
  }, []);

  const handleDragMove = useCallback((clientY: number) => {
    if (!isDragging) return;
    const diff = startY - clientY;
    if (diff > 50 && sheetHeight === 'collapsed') setSheetHeight('half');
    else if (diff > 100 && sheetHeight === 'half') setSheetHeight('full');
    else if (diff < -50 && sheetHeight === 'full') setSheetHeight('half');
    else if (diff < -50 && sheetHeight === 'half') setSheetHeight('collapsed');
  }, [isDragging, startY, sheetHeight]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => handleDragStart(e.touches[0].clientY);
  const handleTouchMove = (e: React.TouchEvent) => handleDragMove(e.touches[0].clientY);
  const handleTouchEnd = () => handleDragEnd();

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientY);
  };
  const handleMouseMove = (e: React.MouseEvent) => handleDragMove(e.clientY);
  const handleMouseUp = () => handleDragEnd();

  useEffect(() => {
    if (!isDragging) return;
    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientY);
    const onMouseUp = () => handleDragEnd();
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  const getSheetStyle = () => {
    switch (sheetHeight) {
      case 'full': return 'h-[85vh]';
      case 'half': return 'h-[52vh]';
      default: return 'h-[140px] sm:h-[160px]';
    }
  };

  const handleSpotClick = useCallback((spot: (typeof kSpots)[0]) => {
    if (window.REACT_APP_NAVIGATE) window.REACT_APP_NAVIGATE(`/spot/${spot.id}`);
  }, []);

  const handleMarkerClick = (spot: (typeof kSpots)[0]) => {
    setActiveMarker(spot.id);
    setSelectedSpotId(spot.id);
    setSheetHeight('half');
  };

  const selectedSpot = selectedSpotId ? kSpots.find((s) => s.id === selectedSpotId) : null;

  const getSpotPrimaryColor = (spot: (typeof kSpots)[0]) => {
    const cats = spotCategories[spot.id] || [spot.category];
    return categoryColors[cats[0]] || '#6366f1';
  };

  const mapSrc = useMemo(() => {
    if (location) {
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d16000!2d${location.lng}!3d${location.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${encodeURIComponent('\ub0b4 \uc704\uce58')}!5e0!3m2!1sko!2skr!4v1700000000000!5m2!1sko!2skr`;
    }
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d101912.38420686948!2d126.89714157421876!3d37.55098196562655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca28b61c565cd%3A0x858aedb4e4ea83eb!2sSeoul%2C%20South%20Korea!5e0!3m2!1sko!2skr!4v1699999999999!5m2!1sko!2skr`;
  }, [location]);

  const sheetPeekCount = Math.min(filteredSpots.length, 2);

  return (
    <div className="min-h-screen bg-gray-50 pb-28 sm:pb-36">
      {/* Status Bar - glassmorphism */}
      <div className="fixed top-0 left-0 right-0 h-11 bg-white/80 backdrop-blur-md z-[60] flex items-center justify-between px-4 sm:px-6 border-b border-gray-100/50">
        <span className="text-gray-900 text-xs sm:text-sm font-semibold">9:41</span>
        <div className="flex items-center gap-1">
          <i className="ri-signal-wifi-fill text-gray-900 text-xs sm:text-sm w-3 h-3 flex items-center justify-center" />
          <i className="ri-wifi-fill text-gray-900 text-xs sm:text-sm w-3 h-3 flex items-center justify-center" />
          <i className="ri-battery-fill text-gray-900 text-xs sm:text-sm w-3 h-3 flex items-center justify-center" />
        </div>
      </div>

      {/* Full Screen Map */}
      <div className="fixed inset-0 pt-11">
        <iframe
          src={mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="K-Spot Map"
        />

        {/* Marker Overlays */}
        <div className="absolute inset-0 pointer-events-none">
          {filteredSpots.map((spot) => {
            const pos = getMarkerPosition(spot.lat, spot.lng);
            const isActive = activeMarker === spot.id;
            const color = getSpotPrimaryColor(spot);
            return (
              <button
                key={spot.id}
                onClick={() => handleMarkerClick(spot)}
                className="absolute pointer-events-auto cursor-pointer group"
                style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -100%)' }}
              >
                <div className="relative flex flex-col items-center">
                  <motion.div
                    animate={isActive ? { scale: 1.15 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className={`flex items-center justify-center rounded-full shadow-lg ${
                      isActive ? 'w-10 h-10 sm:w-11 sm:h-11' : 'w-8 h-8 sm:w-9 sm:h-9'
                    }`}
                    style={{
                      backgroundColor: color,
                      border: isActive ? '3px solid white' : '2px solid white',
                      boxShadow: isActive ? `0 4px 20px ${color}50` : '0 2px 8px rgba(0,0,0,0.25)',
                    }}
                  >
                    <i className="ri-map-pin-fill text-white text-sm sm:text-base w-4 h-4 flex items-center justify-center" />
                  </motion.div>
                  <div
                    className="w-0 h-0 -mt-1"
                    style={{
                      borderLeft: isActive ? '6px solid transparent' : '5px solid transparent',
                      borderRight: isActive ? '6px solid transparent' : '5px solid transparent',
                      borderTop: isActive ? `8px solid ${color}` : `6px solid ${color}`,
                    }}
                  />
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-10 sm:-top-11 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold whitespace-nowrap shadow-xl"
                    >
                      {spot.name}
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                    </motion.div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed top-14 right-3 sm:right-4 z-40 flex flex-col gap-2 sm:gap-2.5">
        <button
          onClick={() => { getLocation(); startWatching(); }}
          disabled={geoLoading}
          className="w-11 h-11 sm:w-12 sm:h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all active:scale-90 hover:shadow-xl"
        >
          {geoLoading ? (
            <i className="ri-loader-4-line text-teal-500 text-lg sm:text-xl animate-spin w-5 h-5 flex items-center justify-center" />
          ) : (
            <i className="ri-crosshair-2-line text-teal-500 text-lg sm:text-xl w-5 h-5 flex items-center justify-center" />
          )}
        </button>
      </div>

      <div className="fixed top-14 left-3 sm:left-4 z-40">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full shadow-lg transition-all cursor-pointer whitespace-nowrap ${
            selectedFilters.length > 0
              ? 'bg-teal-500 text-white'
              : 'bg-white text-gray-800 hover:bg-gray-50'
          }`}
        >
          <i className="ri-equalizer-line text-base sm:text-lg w-4 h-4 flex items-center justify-center" />
          <span className="text-xs sm:text-sm font-bold">필터</span>
          {selectedFilters.length > 0 && (
            <span className="w-5 h-5 sm:w-5.5 sm:h-5.5 bg-white/20 text-white rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center ml-0.5">
              {selectedFilters.length}
            </span>
          )}
        </button>
      </div>

      {/* Geo Error Toast */}
      <AnimatePresence>
        {geoError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 left-3 right-3 sm:left-4 sm:right-4 z-40"
          >
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-2 shadow-sm">
              <i className="ri-error-warning-line text-red-500 text-base sm:text-lg w-4 h-4 flex items-center justify-center" />
              <p className="text-xs sm:text-sm text-red-700 flex-1">{geoError}</p>
              <button
                onClick={getLocation}
                className="text-xs font-bold text-red-600 cursor-pointer whitespace-nowrap px-2.5 py-1 bg-red-100 rounded-lg active:scale-95 transition-transform"
              >
                다시 시도
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Spot Quick Info */}
      <AnimatePresence>
        {selectedSpot && sheetHeight === 'collapsed' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed top-24 sm:top-28 left-3 right-3 sm:left-4 sm:right-4 z-40"
          >
            <div
              className="bg-white rounded-2xl shadow-xl p-3 sm:p-4 flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => handleSpotClick(selectedSpot)}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                <PlaceholderImage alt={selectedSpot.name} className="w-full h-full" iconClassName="text-xl sm:text-2xl" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 truncate">{selectedSpot.name}</h3>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">{selectedSpot.location}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setActiveMarker(null); setSelectedSpotId(null); }}
                className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors flex-shrink-0"
              >
                <i className="ri-close-line text-gray-500 text-sm sm:text-base w-4 h-4 flex items-center justify-center" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-[45]"
            onClick={() => setShowFilters(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="absolute top-24 sm:top-28 left-3 right-3 sm:left-4 sm:right-4 bg-white rounded-2xl shadow-2xl p-4 sm:p-5 max-h-[70vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <h3 className="text-base sm:text-lg font-bold text-gray-900">필터</h3>
                <div className="flex items-center gap-2">
                  {selectedFilters.length > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer whitespace-nowrap font-medium"
                    >
                      전체 해제
                    </button>
                  )}
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <i className="ri-close-line text-gray-600 text-sm sm:text-base w-4 h-4 flex items-center justify-center" />
                  </button>
                </div>
              </div>

              <div className="mb-4 sm:mb-5">
                <p className="text-[11px] sm:text-xs text-gray-400 mb-2 sm:mb-3 font-bold uppercase tracking-wider">
                  콘텐츠 타입
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {contentFilters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => toggleFilter(filter.id)}
                      className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedFilters.includes(filter.id)
                          ? 'bg-gray-900 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <i className={`${filter.icon} text-xs sm:text-sm w-3 h-3 flex items-center justify-center`} />
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4 sm:mb-5">
                <p className="text-[11px] sm:text-xs text-gray-400 mb-2 sm:mb-3 font-bold uppercase tracking-wider">
                  장소 타입
                </p>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {typeFilters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => toggleFilter(filter.id)}
                      className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedFilters.includes(filter.id)
                          ? 'bg-teal-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <i className={`${filter.icon} text-xs sm:text-sm w-3 h-3 flex items-center justify-center`} />
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowFilters(false)}
                className="w-full py-3 sm:py-3.5 bg-gray-900 text-white rounded-xl sm:rounded-2xl text-sm font-bold cursor-pointer whitespace-nowrap active:scale-[0.98] transition-transform"
              >
                {filteredSpots.length}개 결과 보기
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`fixed bottom-20 left-0 right-0 bg-white rounded-t-3xl sm:rounded-t-[2rem] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] z-30 transition-all duration-300 ease-out ${getSheetStyle()}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center pt-3 sm:pt-3.5 pb-2 sm:pb-2.5 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="w-10 sm:w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        {/* Sheet Header */}
        <div className="px-4 sm:px-5 pb-2.5 sm:pb-3 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">주변 스팟</h2>
              <span className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded-lg text-[11px] sm:text-xs font-bold">
                {filteredSpots.length}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Sort Pills */}
              <div className="flex items-center bg-gray-100 rounded-full p-0.5">
                <button
                  onClick={() => setSortBy('distance')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    sortBy === 'distance'
                      ? 'bg-white text-teal-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  가까운순
                </button>
                <button
                  onClick={() => setSortBy('rating')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    sortBy === 'rating'
                      ? 'bg-white text-teal-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  평점순
                </button>
                <button
                  onClick={() => setSortBy('reviews')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    sortBy === 'reviews'
                      ? 'bg-white text-teal-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  인기순
                </button>
              </div>
              <button
                onClick={() => setSheetHeight(sheetHeight === 'collapsed' ? 'half' : 'collapsed')}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
              >
                <i className={`text-gray-500 text-sm w-4 h-4 flex items-center justify-center ${sheetHeight === 'collapsed' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Spot List */}
        <div className="overflow-y-auto h-[calc(100%-68px)] px-3.5 sm:px-4 py-3 sm:py-4">
          <div className="space-y-2.5 sm:space-y-3">
            {filteredSpots.map((spot) => {
              const spotCats = spotCategories[spot.id] || [spot.category];
              const isSelected = selectedSpotId === spot.id;
              const hasDist = spot.distance !== Infinity;
              const primaryColor = categoryColors[spotCats[0]] || '#6366f1';
              return (
                <motion.button
                  key={spot.id}
                  layout
                  onClick={() => handleSpotClick(spot)}
                  className={`w-full flex items-center gap-3 sm:gap-3.5 p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-teal-50 ring-2 ring-teal-200'
                      : 'bg-white border border-gray-100 hover:border-gray-200 hover:shadow-sm'
                  }`}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Thumbnail with colored edge */}
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <PlaceholderImage alt={spot.name} className="w-full h-full" iconClassName="text-xl sm:text-2xl" />
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 sm:w-1.5"
                      style={{ backgroundColor: primaryColor }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {spotCats.slice(0, 2).map((cat) => (
                        <span
                          key={cat}
                          className="inline-block px-1.5 py-[2px] rounded-md text-[9px] sm:text-[10px] font-bold text-white"
                          style={{ backgroundColor: categoryColors[cat] || '#6366f1' }}
                        >
                          {categoryLabels[cat] || cat}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-[13px] sm:text-sm font-bold text-gray-900 line-clamp-1">{spot.name}</h3>
                    <p className="text-[10px] sm:text-xs text-gray-400 line-clamp-1 mt-0.5">{spot.location}</p>
                    <div className="flex items-center gap-2 mt-1 sm:mt-1.5">
                      <div className="flex items-center gap-0.5">
                        <i className="ri-star-fill text-yellow-400 text-[10px] sm:text-xs w-3 h-3 flex items-center justify-center" />
                        <span className="text-[10px] sm:text-xs font-bold text-gray-800">{spot.rating}</span>
                      </div>
                      <span className="text-[10px] text-gray-300">|</span>
                      <span className="text-[10px] sm:text-xs text-gray-500">리뷰 {spot.reviews.toLocaleString()}</span>
                      {hasDist && (
                        <>
                          <span className="text-[10px] text-gray-300">|</span>
                          <span className="text-[10px] sm:text-xs font-bold text-teal-600 bg-teal-50 px-1.5 py-[1px] rounded">
                            {formatDistance(spot.distance)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}12` }}
                    >
                      <i className="ri-arrow-right-s-line text-sm sm:text-base w-4 h-4 flex items-center justify-center" style={{ color: primaryColor }} />
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {filteredSpots.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <i className="ri-map-pin-line text-2xl text-gray-300 w-6 h-6 flex items-center justify-center" />
              </div>
              <p className="text-sm text-gray-500 font-medium">필터 조건에 맞는 장소가 없습니다</p>
              <button
                onClick={clearFilters}
                className="mt-3 px-4 py-2 bg-gray-900 text-white rounded-full text-xs font-bold cursor-pointer active:scale-95 transition-transform"
              >
                필터 초기화
              </button>
            </div>
          )}

          {/* Peek hint when collapsed */}
          {sheetHeight === 'collapsed' && filteredSpots.length > sheetPeekCount && (
            <div className="text-center pt-2 pb-1">
              <p className="text-[10px] text-gray-400">위로 당겨 {filteredSpots.length - sheetPeekCount}개 더 보기</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}