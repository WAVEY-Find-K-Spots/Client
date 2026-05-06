interface FilterBarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'map' | 'list';
  onViewModeChange: (mode: 'map' | 'list') => void;
}

export function FilterBar({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: FilterBarProps) {
  const categories = [
    { id: 'all', label: '전체', icon: 'ri-apps-line' },
    { id: 'restaurant', label: '맛집', icon: 'ri-restaurant-line' },
    { id: 'cafe', label: '카페', icon: 'ri-cup-line' },
    { id: 'accommodation', label: '숙소', icon: 'ri-hotel-line' },
    { id: 'convenience', label: '편의점', icon: 'ri-store-line' },
    { id: 'shopping', label: '쇼핑', icon: 'ri-shopping-bag-line' },
    { id: 'attraction', label: '명소', icon: 'ri-landscape-line' },
    { id: 'photobooth', label: '포토', icon: 'ri-camera-line' },
    { id: 'landmark', label: '랜드마크', icon: 'ri-building-line' },
  ];

  return (
    <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
      <div className="px-4 py-3">
        {/* Search Bar */}
        <div className="mb-3">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm w-4 h-4 flex items-center justify-center"></i>
            <input
              type="text"
              placeholder="장소, 콘텐츠 검색..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-colors"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-95 cursor-pointer ${
                selectedCategory === category.id
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              <i className={`${category.icon} text-sm w-4 h-4 flex items-center justify-center`}></i>
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-center mt-3">
          <div className="inline-flex bg-gray-50 rounded-xl p-0.5 border border-gray-100">
            <button
              onClick={() => onViewModeChange('map')}
              className={`px-6 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                viewMode === 'map'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-100'
                  : 'text-gray-500'
              }`}
            >
              <i className="ri-map-pin-line mr-1.5 w-4 h-4 inline-flex items-center justify-center"></i>
              지도
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`px-6 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-100'
                  : 'text-gray-500'
              }`}
            >
              <i className="ri-list-check mr-1.5 w-4 h-4 inline-flex items-center justify-center"></i>
              리스트
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
