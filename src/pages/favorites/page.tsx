import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { BottomNav } from '../../components/feature/BottomNav';
import { StatusBar } from '../../components/feature/StatusBar';
import { PlaceholderImage } from '../../components/base/PlaceholderImage';
import { kSpots } from '../../mocks/kSpots';

const categoryColors: Record<string, string> = {
  kdrama: 'from-pink-500/20 to-pink-600/5',
  kmovie: 'from-violet-500/20 to-violet-600/5',
  kpop: 'from-teal-500/20 to-teal-600/5',
  cafe: 'from-amber-500/20 to-amber-600/5',
  restaurant: 'from-orange-500/20 to-orange-600/5',
  kheritage: 'from-emerald-500/20 to-emerald-600/5',
  landmark: 'from-sky-500/20 to-sky-600/5',
  attraction: 'from-cyan-500/20 to-cyan-600/5',
};

const categoryAccent: Record<string, string> = {
  kdrama: '#ec4899',
  kmovie: '#8b5cf6',
  kpop: '#14b8a6',
  cafe: '#f59e0b',
  restaurant: '#f97316',
  kheritage: '#10b981',
  landmark: '#6366f1',
  attraction: '#06b6d4',
};

const categoryLabels: Record<string, string> = {
  kdrama: 'K-드라마',
  kmovie: 'K-영화',
  kpop: 'K-POP',
  cafe: '카페',
  restaurant: '맛집',
  kheritage: '문화유산',
  landmark: '랜드마크',
  attraction: '명소',
};

interface CustomRoute {
  id: number;
  name: string;
  description: string;
  spots: typeof kSpots;
  color: string;
}

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState<'spots' | 'routes'>('spots');
  const [savedSpots, setSavedSpots] = useState(kSpots.slice(0, 6));
  const [customRoutes, setCustomRoutes] = useState<CustomRoute[]>([
    {
      id: 1,
      name: '서울 핵심 투어',
      description: '서울의 상징적 명소를 하루에',
      spots: kSpots.slice(0, 4),
      color: '#14b8a6',
    },
    {
      id: 2,
      name: 'K-드라마 성지순례',
      description: '드라마 속 그 장소로',
      spots: kSpots.filter((s) => s.categories?.includes('K-DRAMA')).slice(0, 3),
      color: '#ec4899',
    },
  ]);
  const [editingRoute, setEditingRoute] = useState<CustomRoute | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [showRouteMap, setShowRouteMap] = useState<CustomRoute | null>(null);
  const [removingSpotId, setRemovingSpotId] = useState<number | null>(null);

  const handleRemoveSpot = (spotId: number) => {
    setRemovingSpotId(spotId);
    setTimeout(() => {
      setSavedSpots((prev) => prev.filter((s) => s.id !== spotId));
      setRemovingSpotId(null);
    }, 300);
  };

  const handleCreateRoute = () => {
    if (window.REACT_APP_NAVIGATE) {
      window.REACT_APP_NAVIGATE('/route-create');
    }
  };

  const handleDeleteRoute = (routeId: number) => {
    setCustomRoutes((prev) => prev.filter((r) => r.id !== routeId));
  };

  const handleReorderSpots = (routeId: number, newOrder: typeof kSpots) => {
    setCustomRoutes((prev) =>
      prev.map((r) => (r.id === routeId ? { ...r, spots: newOrder } : r)),
    );
    if (editingRoute && editingRoute.id === routeId) {
      setEditingRoute({ ...editingRoute, spots: newOrder });
    }
  };

  const handleRemoveSpotFromRoute = (routeId: number, spotId: number) => {
    setCustomRoutes((prev) =>
      prev.map((r) => (r.id === routeId ? { ...r, spots: r.spots.filter((s) => s.id !== spotId) } : r)),
    );
    if (editingRoute && editingRoute.id === routeId) {
      setEditingRoute({
        ...editingRoute,
        spots: editingRoute.spots.filter((s) => s.id !== spotId),
      });
    }
  };

  const totalSaved = savedSpots.length;
  const totalRoutes = customRoutes.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-28 sm:pb-36">
      <StatusBar />

      {/* Header */}
      <div className="relative bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 px-4 sm:px-6 pt-14 sm:pt-16 pb-6 sm:pb-8 overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-4 right-4 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/20 blur-2xl"
          />
          <div
            className="absolute bottom-0 left-0 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-white/10 blur-3xl"
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">내 저장소</h1>
              <p className="text-teal-100 text-xs sm:text-sm mt-1">나만의 K-Spot 컬렉션</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <i className="ri-bookmark-fill text-white text-xl sm:text-2xl w-6 h-6 flex items-center justify-center" />
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-2.5 sm:gap-3">
            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5">
              <p className="text-teal-100 text-[10px] sm:text-xs font-medium">찜한 장소</p>
              <p className="text-white text-xl sm:text-2xl font-extrabold">{totalSaved}</p>
            </div>
            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5">
              <p className="text-teal-100 text-[10px] sm:text-xs font-medium">나의 루트</p>
              <p className="text-white text-xl sm:text-2xl font-extrabold">{totalRoutes}</p>
            </div>
            <div className="flex-1 bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5">
              <p className="text-teal-100 text-[10px] sm:text-xs font-medium">다녀온 곳</p>
              <p className="text-white text-xl sm:text-2xl font-extrabold">3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Control */}
      <div className="px-4 sm:px-6 -mt-4 sm:-mt-5 relative z-20">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-1 flex">
          <button
            onClick={() => setActiveTab('spots')}
            className={`flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 sm:gap-2 ${
              activeTab === 'spots'
                ? 'bg-teal-500 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="ri-heart-3-fill w-4 h-4 flex items-center justify-center" />
            찜한 장소
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 sm:gap-2 ${
              activeTab === 'routes'
                ? 'bg-teal-500 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <i className="ri-route-fill w-4 h-4 flex items-center justify-center" />
            나의 루트
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-4 sm:py-6">
        <AnimatePresence mode="wait">
          {/* Saved Spots Tab */}
          {activeTab === 'spots' && (
            <motion.div
              key="spots"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {savedSpots.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 sm:py-20">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 sm:mb-5">
                    <i className="ri-heart-line text-3xl sm:text-4xl text-gray-400 w-10 h-10 flex items-center justify-center" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">아직 찜한 장소가 없어요</h2>
                  <p className="text-sm text-gray-500 mb-5 sm:mb-7">관심 있는 장소를 저장하고 나만의 리스트를 만들어보세요</p>
                  <button
                    onClick={() => window.REACT_APP_NAVIGATE?.('/map')}
                    className="px-6 sm:px-8 py-3 sm:py-3.5 bg-teal-500 text-white text-sm font-bold rounded-full cursor-pointer whitespace-nowrap shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all active:scale-95"
                  >
                    K-Spots 둘러보기
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {savedSpots.map((spot, index) => (
                    <motion.div
                      key={spot.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{
                        opacity: removingSpotId === spot.id ? 0 : 1,
                        scale: removingSpotId === spot.id ? 0.8 : 1,
                        x: removingSpotId === spot.id ? -120 : 0,
                      }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => window.REACT_APP_NAVIGATE?.(`/spot/${spot.id}`)}
                      className={`relative bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group active:scale-95`}
                    >
                      {/* Image area with gradient bg */}
                      <div
                        className={`relative h-28 sm:h-36 bg-gradient-to-br ${
                          categoryColors[spot.category] || 'from-gray-200 to-gray-300'
                        } flex items-center justify-center overflow-hidden`}
                      >
                        <PlaceholderImage
                          alt={spot.name}
                          className="w-full h-full absolute inset-0"
                          iconClassName="text-2xl sm:text-3xl opacity-40"
                        />
                        {/* Category badge */}
                        <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                          <span
                            className="inline-block px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold text-white shadow-sm"
                            style={{ backgroundColor: categoryAccent[spot.category] || '#6366f1' }}
                          >
                            {categoryLabels[spot.category] || spot.category}
                          </span>
                        </div>
                        {/* Remove button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveSpot(spot.id);
                          }}
                          className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                        >
                          <i className="ri-close-line text-white text-sm sm:text-base w-4 h-4 flex items-center justify-center" />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="p-2.5 sm:p-3.5">
                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1 mb-0.5 sm:mb-1">
                          {spot.name}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1 mb-1.5 sm:mb-2">
                          {spot.location}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <i className="ri-star-fill text-yellow-400 text-[10px] sm:text-xs w-3 h-3 flex items-center justify-center" />
                            <span className="text-[10px] sm:text-xs font-bold text-gray-800">
                              {spot.rating}
                            </span>
                            <span className="text-[10px] sm:text-xs text-gray-400">
                              ({spot.reviews.toLocaleString()})
                            </span>
                          </div>
                          <span className="text-[10px] sm:text-xs font-medium text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-md">
                            {spot.district}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Routes Tab */}
          {activeTab === 'routes' && (
            <motion.div
              key="routes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Create Route CTA */}
              <button
                onClick={handleCreateRoute}
                className="w-full mb-4 sm:mb-5 py-3.5 sm:py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl sm:rounded-2xl text-sm font-bold cursor-pointer whitespace-nowrap shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="ri-add-line text-white text-base sm:text-lg w-5 h-5 flex items-center justify-center" />
                </div>
                새 루트 만들기
              </button>

              {customRoutes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 sm:py-16">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-4 sm:mb-5">
                    <i className="ri-route-line text-3xl sm:text-4xl text-gray-400 w-10 h-10 flex items-center justify-center" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">아직 루트가 없어요</h2>
                  <p className="text-sm text-gray-500 mb-5 sm:mb-7">나만의 여행 루트를 만들어 효율적으로 둘러보세요</p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-5">
                  {customRoutes.map((route, routeIdx) => (
                    <motion.div
                      key={route.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: routeIdx * 0.1 }}
                      className="bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {/* Route Header */}
                      <div
                        className="relative p-3.5 sm:p-5"
                        style={{ backgroundColor: `${route.color}08` }}
                      >
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div
                              className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${route.color}15` }}
                            >
                              <i
                                className="ri-route-fill text-lg sm:text-xl w-5 h-5 flex items-center justify-center"
                                style={{ color: route.color }}
                              />
                            </div>
                            <div>
                              <h3 className="text-sm sm:text-base font-bold text-gray-900">{route.name}</h3>
                              <p className="text-[10px] sm:text-xs text-gray-500">{route.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <button
                              onClick={() =>
                                setEditingRoute(editingRoute?.id === route.id ? null : route)
                              }
                              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                                editingRoute?.id === route.id
                                  ? 'bg-teal-500 text-white shadow-sm'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <i
                                className={`${editingRoute?.id === route.id ? 'ri-check-line' : 'ri-edit-line'} text-xs sm:text-sm w-4 h-4 flex items-center justify-center`}
                              />
                            </button>
                            <button
                              onClick={() => handleDeleteRoute(route.id)}
                              className="w-8 h-8 sm:w-9 sm:h-9 bg-red-50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-red-100 transition-colors"
                            >
                              <i className="ri-delete-bin-line text-red-500 text-xs sm:text-sm w-4 h-4 flex items-center justify-center" />
                            </button>
                          </div>
                        </div>

                        {/* Route Timeline Preview */}
                        {editingRoute?.id !== route.id && (
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                            {route.spots.slice(0, 5).map((spot, idx) => (
                              <div key={spot.id} className="flex items-center gap-1.5 sm:gap-2">
                                <div className="relative flex-shrink-0">
                                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl overflow-hidden bg-gray-100">
                                    <PlaceholderImage
                                      alt={spot.name}
                                      className="w-full h-full"
                                      iconClassName="text-xs sm:text-sm opacity-50"
                                    />
                                  </div>
                                  <div
                                    className="absolute -top-1 -left-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-white text-[8px] sm:text-[10px] font-bold shadow-sm"
                                    style={{ backgroundColor: route.color }}
                                  >
                                    {idx + 1}
                                  </div>
                                </div>
                                {idx < Math.min(route.spots.length, 5) - 1 && (
                                  <div className="flex items-center flex-shrink-0">
                                    <div className="w-3 sm:w-4 h-0.5 bg-gray-200" />
                                    <i className="ri-arrow-right-s-line text-gray-300 text-xs sm:text-sm w-3 h-3 flex items-center justify-center" />
                                  </div>
                                )}
                              </div>
                            ))}
                            {route.spots.length > 5 && (
                              <div
                                className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-bold flex-shrink-0"
                                style={{ backgroundColor: `${route.color}15`, color: route.color }}
                              >
                                +{route.spots.length - 5}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Spot count & View button */}
                        {editingRoute?.id !== route.id && (
                          <div className="flex items-center justify-between mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-gray-100">
                            <span className="text-[10px] sm:text-xs text-gray-500">
                              총 <span className="font-bold text-gray-800">{route.spots.length}</span>개 장소
                            </span>
                            <button
                              onClick={() => setShowRouteMap(route)}
                              className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold cursor-pointer whitespace-nowrap transition-all"
                              style={{
                                backgroundColor: `${route.color}12`,
                                color: route.color,
                              }}
                            >
                              <i className="ri-map-pin-line w-3 h-3 flex items-center justify-center" />
                              지도에서 보기
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Editable Spot List */}
                      {editingRoute?.id === route.id && (
                        <div className="p-2.5 sm:p-3.5">
                          <p className="text-[10px] sm:text-xs text-gray-500 mb-2 sm:mb-3 font-medium">
                            순서를 변경하려면 드래그하세요
                          </p>
                          <Reorder.Group
                            axis="y"
                            values={route.spots}
                            onReorder={(newOrder) => handleReorderSpots(route.id, newOrder)}
                            className="space-y-1.5 sm:space-y-2"
                          >
                            {route.spots.map((spot, index) => (
                              <Reorder.Item
                                key={spot.id}
                                value={spot}
                                className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-gray-50 rounded-xl cursor-grab active:cursor-grabbing"
                              >
                                <div
                                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-[10px] sm:text-sm font-bold flex-shrink-0"
                                  style={{ backgroundColor: route.color }}
                                >
                                  {index + 1}
                                </div>
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                  <PlaceholderImage
                                    alt={spot.name}
                                    className="w-full h-full"
                                    iconClassName="text-xs sm:text-sm opacity-50"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">
                                    {spot.name}
                                  </p>
                                  <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1">
                                    {spot.location}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveSpotFromRoute(route.id, spot.id);
                                  }}
                                  className="w-7 h-7 sm:w-8 sm:h-8 bg-red-50 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-100 transition-colors flex-shrink-0"
                                >
                                  <i className="ri-delete-bin-line text-red-500 text-[10px] sm:text-xs w-4 h-4 flex items-center justify-center" />
                                </button>
                                <i className="ri-draggable text-gray-400 text-base sm:text-lg flex-shrink-0 w-4 h-4 flex items-center justify-center" />
                              </Reorder.Item>
                            ))}
                          </Reorder.Group>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Route Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center pb-28 sm:pb-36"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              className="w-full bg-white rounded-t-2xl sm:rounded-t-3xl p-5 sm:p-7"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-8 sm:w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5 sm:mb-7" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">새 루트 만들기</h2>
              <input
                type="text"
                value={newRouteName}
                onChange={(e) => setNewRouteName(e.target.value)}
                placeholder="루트 이름을 입력하세요..."
                className="w-full px-3.5 sm:px-4 py-3 sm:py-3.5 bg-gray-100 rounded-xl sm:rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 mb-4 sm:mb-5"
              />
              <div className="flex gap-2.5 sm:gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 sm:py-3.5 bg-gray-100 text-gray-700 rounded-xl sm:rounded-2xl text-sm font-bold cursor-pointer whitespace-nowrap"
                >
                  취소
                </button>
                <button
                  onClick={handleCreateRoute}
                  className="flex-1 py-3 sm:py-3.5 bg-teal-500 text-white rounded-xl sm:rounded-2xl text-sm font-bold cursor-pointer whitespace-nowrap"
                >
                  만들기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Route Map Modal */}
      <AnimatePresence>
        {showRouteMap && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50"
            onClick={() => setShowRouteMap(null)}
          >
            <div className="relative w-full h-full">
              {/* Header */}
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent z-10 p-4 sm:p-5 pt-14 sm:pt-16">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-white text-base sm:text-lg font-bold">{showRouteMap.name}</h2>
                    <p className="text-white/80 text-xs sm:text-sm">{showRouteMap.spots.length}개 장소</p>
                  </div>
                  <button
                    onClick={() => setShowRouteMap(null)}
                    className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer"
                  >
                    <i className="ri-close-line text-white text-lg sm:text-xl w-5 h-5 flex items-center justify-center" />
                  </button>
                </div>
              </div>

              {/* Map */}
              <div className="w-full h-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d101912.38420686948!2d126.89714157421876!3d37.55098196562655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca28b61c565cd%3A0x858aedb4e4ea83eb!2sSeoul%2C%20South%20Korea!5e0!3m2!1sko!2skr!4v1699999999999!5m2!1sko!2skr"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Route Map"
                />
              </div>

              {/* Route Spots List */}
              <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl sm:rounded-t-3xl p-4 sm:p-5 max-h-[40vh] overflow-y-auto">
                <div className="w-8 sm:w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3 sm:mb-4" />
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3">경유지</h3>
                <div className="space-y-1.5 sm:space-y-2">
                  {showRouteMap.spots.map((spot, index) => (
                    <div
                      key={spot.id}
                      className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 bg-gray-50 rounded-xl"
                    >
                      <div
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-[10px] sm:text-sm font-bold flex-shrink-0"
                        style={{ backgroundColor: showRouteMap.color }}
                      >
                        {index + 1}
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        <PlaceholderImage
                          alt={spot.name}
                          className="w-full h-full"
                          iconClassName="text-xs sm:text-sm opacity-50"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">
                          {spot.name}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1">
                          {spot.location}
                        </p>
                      </div>
                      {index < showRouteMap.spots.length - 1 && (
                        <i className="ri-arrow-down-line text-gray-300 flex-shrink-0 w-4 h-4 flex items-center justify-center" />
                      )}
                    </div>
                  ))}
                </div>

                <button className="w-full mt-3 sm:mt-4 py-3 sm:py-3.5 text-white rounded-xl sm:rounded-2xl text-sm font-bold cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 shadow-lg"
                  style={{ backgroundColor: showRouteMap.color }}
                >
                  <i className="ri-navigation-line w-4 h-4 flex items-center justify-center" />
                  길 안내 시작
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}