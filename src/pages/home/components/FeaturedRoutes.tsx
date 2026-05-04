import { motion } from 'framer-motion';
import { PlaceholderImage } from '../../../components/base/PlaceholderImage';

const routes = [
  {
    id: 1,
    titleKo: 'K-드라마 성지순례',
    spots: 5,
    duration: '4~5시간',
    color: '#ec4899',
  },
  {
    id: 2,
    titleKo: '서울 맛집 투어',
    spots: 6,
    duration: '3~4시간',
    color: '#f97316',
  },
  {
    id: 3,
    titleKo: 'K-POP 팬 여행',
    spots: 7,
    duration: '5~6시간',
    color: '#14b8a6',
  },
  {
    id: 4,
    titleKo: '한국 문화유산',
    spots: 4,
    duration: '3~4시간',
    color: '#8b5cf6',
  },
];

export function FeaturedRoutes() {
  const handleRouteClick = (routeId: number) => {
    if (window.REACT_APP_NAVIGATE) {
      window.scrollTo(0, 0);
      window.REACT_APP_NAVIGATE(`/route-detail/${routeId}`);
    }
  };

  const handleViewAll = () => {
    if (window.REACT_APP_NAVIGATE) {
      window.REACT_APP_NAVIGATE('/route-detail/1?viewAll=true');
    }
  };

  return (
    <section className="py-5 sm:py-8 px-4 sm:px-5">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-end justify-between mb-4 sm:mb-5"
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">추천 코스</h2>
          <p className="text-xs text-gray-500 mt-0.5">현지 전문가가 큐레이션한 투어</p>
        </div>
        <button
          onClick={handleViewAll}
          className="text-teal-600 text-xs font-bold hover:text-teal-700 transition-colors cursor-pointer whitespace-nowrap"
        >
          전체보기
        </button>
      </motion.div>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {routes.map((route, index) => (
          <motion.div
            key={route.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            onClick={() => handleRouteClick(route.id)}
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer active:scale-[0.97] transition-transform"
            style={{ height: 'clamp(180px, 38vw, 260px)' }}
          >
            <PlaceholderImage
              alt={route.titleKo}
              className="w-full h-full"
              iconClassName="text-3xl opacity-25"
              label={route.titleKo}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Color accent stripe */}
            <div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ backgroundColor: route.color }}
            />

            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
              <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1 mb-1">
                {route.titleKo}
              </h3>
              <div className="flex items-center gap-2.5 text-white/80">
                <div className="flex items-center gap-1">
                  <i className="ri-map-pin-line text-[10px] sm:text-xs w-3 h-3 flex items-center justify-center" />
                  <span className="text-[10px] sm:text-xs font-medium">{route.spots}개 장소</span>
                </div>
                <div className="flex items-center gap-1">
                  <i className="ri-time-line text-[10px] sm:text-xs w-3 h-3 flex items-center justify-center" />
                  <span className="text-[10px] sm:text-xs font-medium">{route.duration}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
