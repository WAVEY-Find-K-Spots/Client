import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { PlaceholderImage } from '../../../components/base/PlaceholderImage';

const trendingSpots = [
  { rank: 1, nameKo: '경복궁', change: 'up', id: 1 },
  { rank: 2, nameKo: 'N서울타워', change: 'same', id: 2 },
  { rank: 3, nameKo: '북촌한옥마을', change: 'up', id: 3 },
  { rank: 4, nameKo: '홍대거리', change: 'down', id: 4 },
  { rank: 5, nameKo: '명동', change: 'up', id: 5 },
];

export function Hero() {
  const [currentRankIndex, setCurrentRankIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentRankIndex((prev) => (prev + 1) % trendingSpots.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const navigate = () => {
    if (window.REACT_APP_NAVIGATE) window.REACT_APP_NAVIGATE('/map');
  };

  const handleTrendingClick = (spotId: number) => {
    if (window.REACT_APP_NAVIGATE) {
      window.scrollTo(0, 0);
      window.REACT_APP_NAVIGATE(`/spot/${spotId}`);
    }
  };

  return (
    <section className="px-4 sm:px-5 pt-3 pb-4 sm:pb-6">
      {/* Trending Ranking Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-3 bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-2.5">
          <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg">
            <i className="ri-fire-fill text-white text-[10px] w-3 h-3 flex items-center justify-center" />
            <span className="text-[9px] font-bold text-white uppercase tracking-wider">실시간 인기</span>
          </div>
        </div>

        <div
          className="relative h-7 overflow-hidden cursor-pointer"
          onClick={() => handleTrendingClick(trendingSpots[currentRankIndex].id)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRankIndex}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2.5"
            >
              <div className="flex items-center justify-center w-6 h-6 bg-gray-900 rounded-lg flex-shrink-0">
                <span className="text-[10px] font-bold text-white">{trendingSpots[currentRankIndex].rank}</span>
              </div>
              <h2 className="text-sm font-bold text-gray-900 flex-1 truncate">
                {trendingSpots[currentRankIndex].nameKo}
              </h2>
              <div className="flex items-center flex-shrink-0">
                {trendingSpots[currentRankIndex].change === 'up' && (
                  <i className="ri-arrow-up-s-fill text-teal-500 text-lg w-5 h-5 flex items-center justify-center" />
                )}
                {trendingSpots[currentRankIndex].change === 'down' && (
                  <i className="ri-arrow-down-s-fill text-red-500 text-lg w-5 h-5 flex items-center justify-center" />
                )}
                {trendingSpots[currentRankIndex].change === 'same' && (
                  <i className="ri-subtract-line text-gray-400 text-lg w-5 h-5 flex items-center justify-center" />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-1 mt-2">
          {trendingSpots.map((_, index) => (
            <div
              key={index}
              className={`h-[3px] rounded-full transition-all duration-300 ${
                index === currentRankIndex ? 'w-3 bg-teal-500' : 'w-1.5 bg-gray-200'
              }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={navigate}
        className="relative rounded-3xl overflow-hidden cursor-pointer group active:scale-[0.98] transition-transform"
        style={{ height: 'clamp(260px, 48vh, 340px)' }}
      >
        <PlaceholderImage
          alt="서울 랜드마크"
          className="w-full h-full"
          iconClassName="text-5xl opacity-30"
          label="Hero 배경 이미지"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5">
          <i className="ri-sun-line text-white text-sm w-4 h-4 flex items-center justify-center" />
          <span className="text-white text-[11px] font-medium">맑음 18°C</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1 tracking-tight">
            오늘의 추천
          </h2>
          <p className="text-sm text-white/80 mb-3">
            현재 시간에 가장 잘 어울리는 K-Spot
          </p>
          <button className="inline-flex items-center gap-2 bg-white text-gray-900 px-5 py-2.5 rounded-full font-bold text-sm hover:bg-gray-100 transition-colors whitespace-nowrap">
            지금 둘러보기
            <i className="ri-arrow-right-line w-4 h-4 flex items-center justify-center" />
          </button>
        </div>
      </motion.div>
    </section>
  );
}
