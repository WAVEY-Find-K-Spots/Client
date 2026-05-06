import { motion } from 'framer-motion';
import { PlaceholderImage } from '../../../components/base/PlaceholderImage';
import { kSpots } from '../../../mocks/kSpots';

const categoryLabels: Record<string, string> = {
  kdrama: '드라마',
  kmovie: '영화',
  kpop: 'K-POP',
  cafe: '카페',
  restaurant: '맛집',
  kheritage: '문화유산',
  landmark: '랜드마크',
  attraction: '명소',
  shopping: '쇼핑',
};

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

const spotCategories: Record<number, string[]> = {
  1: ['landmark'],
  2: ['kheritage'],
  3: ['shopping', 'kpop'],
  4: ['attraction'],
  5: ['cafe'],
  6: ['restaurant'],
  7: ['attraction'],
  8: ['kpop'],
  9: ['kheritage'],
  10: ['cafe'],
  11: ['restaurant', 'kheritage'],
  12: ['landmark'],
};

export function RecommendedSpots() {
  const handleSpotClick = (spotId: number) => {
    if (window.REACT_APP_NAVIGATE) window.REACT_APP_NAVIGATE(`/spot/${spotId}`);
  };

  return (
    <section className="py-5 sm:py-8 px-4 sm:px-5 bg-gray-50/50">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-end justify-between mb-4 sm:mb-5"
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">인기 장소</h2>
          <p className="text-xs text-gray-500 mt-0.5">이번 주 가장 많이 방문한 곳</p>
        </div>
        <button
          onClick={() => window.REACT_APP_NAVIGATE?.('/map')}
          className="text-teal-600 text-xs font-bold hover:text-teal-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          전체보기
        </button>
      </motion.div>

      {/* 2-column grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {kSpots.slice(0, 6).map((spot, index) => {
          const cats = spotCategories[spot.id] || [spot.category];
          const primaryColor = categoryColors[cats[0]] || '#6366f1';
          return (
            <motion.div
              key={spot.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              onClick={() => handleSpotClick(spot.id)}
              className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.97]"
            >
              {/* Image */}
              <div className="relative w-full" style={{ height: 'clamp(120px, 26vw, 180px)' }}>
                <PlaceholderImage
                  alt={spot.name}
                  className="w-full h-full"
                  iconClassName="text-2xl sm:text-3xl opacity-30"
                  label={spot.name}
                />
                {/* Rank */}
                <div className="absolute top-2.5 left-2.5 w-7 h-7 bg-black/70 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <span className="text-white text-[10px] font-extrabold">{index + 1}</span>
                </div>
                {/* Rating */}
                <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                  <i className="ri-star-fill text-yellow-400 text-[10px] w-3 h-3 flex items-center justify-center" />
                  <span className="text-white text-[10px] font-bold">{spot.rating}</span>
                </div>
                {/* Color strip */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-[3px]"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4">
                <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-0.5">{spot.name}</h3>
                <p className="text-[10px] text-gray-400 line-clamp-1 mb-2">{spot.district}</p>
                <div className="flex flex-wrap gap-1">
                  {cats.slice(0, 2).map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center px-1.5 py-[2px] rounded-md text-[9px] font-bold text-white"
                      style={{ backgroundColor: categoryColors[cat] || '#6366f1' }}
                    >
                      {categoryLabels[cat] || cat}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
