import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BottomNav } from '../../components/feature/BottomNav';
import { StatusBar } from '../../components/feature/StatusBar';
import { PlaceholderImage } from '../../components/base/PlaceholderImage';

const routes = [
  {
    id: 1,
    title: 'K-Drama Classics',
    titleKo: '클래식 드라마 투어',
    description: 'Visit iconic locations from legendary Korean dramas like Goblin, Crash Landing on You, and more. Experience the magic of K-Drama filming spots.',
    descriptionKo: '도깨비, 사랑의 불시착 등 전설적인 한국 드라마의 상징적인 장소들을 방문하세요.',
    spots: 5,
    duration: '4-5 hours',
    distance: '12.5 km',
    spotsList: [
      { id: 1, name: 'Goblin Bridge', nameKo: '도깨비 다리', duration: '30 min' },
      { id: 2, name: 'Crash Landing Cafe', nameKo: '사랑의 불시착 카페', duration: '45 min' },
      { id: 3, name: 'Itaewon Class Street', nameKo: '이태원 클라쓰 거리', duration: '40 min' },
      { id: 4, name: 'Reply 1988 Alley', nameKo: '응답하라 1988 골목', duration: '35 min' },
      { id: 5, name: 'Vincenzo Building', nameKo: '빈센조 빌딩', duration: '30 min' },
    ]
  },
  {
    id: 2,
    title: 'Seoul Foodie Trail',
    titleKo: '서울 맛집 투어',
    description: "Taste your way through Seoul's best street food and restaurants. From traditional markets to trendy cafes.",
    descriptionKo: '서울 최고의 길거리 음식과 레스토랑을 맛보세요.',
    spots: 6,
    duration: '3-4 hours',
    distance: '8.2 km',
    spotsList: [
      { id: 1, name: 'Gwangjang Market', nameKo: '광장시장', duration: '60 min' },
      { id: 2, name: 'Myeongdong Street Food', nameKo: '명동 길거리 음식', duration: '45 min' },
      { id: 3, name: 'Tongin Market', nameKo: '통인시장', duration: '50 min' },
      { id: 4, name: 'Ikseon-dong Cafes', nameKo: '익선동 카페', duration: '40 min' },
      { id: 5, name: 'Noryangjin Fish Market', nameKo: '노량진 수산시장', duration: '45 min' },
      { id: 6, name: 'Hongdae Dessert Street', nameKo: '홍대 디저트 거리', duration: '30 min' },
    ]
  },
  {
    id: 3,
    title: 'K-Pop Star Journey',
    titleKo: 'K-팝 스타 여행',
    description: 'Follow the footsteps of your favorite K-Pop idols. Visit entertainment agencies, music video locations, and fan hotspots.',
    descriptionKo: '좋아하는 K-팝 아이돌의 발자취를 따라가세요.',
    spots: 7,
    duration: '5-6 hours',
    distance: '15.3 km',
    spotsList: [
      { id: 1, name: 'HYBE Insight', nameKo: '하이브 인사이트', duration: '90 min' },
      { id: 2, name: 'SM Entertainment', nameKo: 'SM 엔터테인먼트', duration: '30 min' },
      { id: 3, name: 'JYP Entertainment', nameKo: 'JYP 엔터테인먼트', duration: '30 min' },
      { id: 4, name: 'Gangnam K-Star Road', nameKo: '강남 K스타 로드', duration: '45 min' },
      { id: 5, name: 'MBC World', nameKo: 'MBC 월드', duration: '60 min' },
      { id: 6, name: 'Hongdae Busking Street', nameKo: '홍대 버스킹 거리', duration: '40 min' },
      { id: 7, name: 'Apgujeong Rodeo', nameKo: '압구정 로데오', duration: '45 min' },
    ]
  },
  {
    id: 4,
    title: 'Heritage & Tradition',
    titleKo: '전통 문화유산',
    description: "Explore Korea's rich cultural heritage and history. Visit ancient palaces, traditional villages, and UNESCO World Heritage sites.",
    descriptionKo: '한국의 풍부한 문화유산과 역사를 탐험하세요.',
    spots: 4,
    duration: '3-4 hours',
    distance: '6.8 km',
    spotsList: [
      { id: 1, name: 'Gyeongbokgung Palace', nameKo: '경복궁', duration: '90 min' },
      { id: 2, name: 'Bukchon Hanok Village', nameKo: '북촌 한옥마을', duration: '60 min' },
      { id: 3, name: 'Changdeokgung Secret Garden', nameKo: '창덕궁 후원', duration: '75 min' },
      { id: 4, name: 'Jongmyo Shrine', nameKo: '종묘', duration: '45 min' },
    ]
  },
];

export default function RouteDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isViewAll = searchParams.get('viewAll') === 'true';
  const [savedRoute, setSavedRoute] = useState(false);

  const route = routes.find(r => r.id === Number(id));

  const handleBack = () => {
    window.history.back();
  };

  const handleStartRoute = () => {
    if (window.REACT_APP_NAVIGATE) {
      window.REACT_APP_NAVIGATE('/map');
    }
  };

  const handleSpotClick = (spotId: number) => {
    if (window.REACT_APP_NAVIGATE) {
      window.REACT_APP_NAVIGATE(`/spot/${spotId}`);
    }
  };

  // View All 페이지
  if (isViewAll) {
    return (
      <div className="min-h-screen bg-gray-50 pb-36">
        <StatusBar />
        
        {/* Header */}
        <div className="bg-white px-4 pt-14 pb-4 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer"
            >
              <i className="ri-arrow-left-line text-xl text-gray-700"></i>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Featured Routes</h1>
              <p className="text-xs text-gray-500">추천 여행 코스</p>
            </div>
          </div>
        </div>

        {/* Routes List */}
        <div className="px-4 py-4 space-y-4">
          {routes.map((r, index) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => window.REACT_APP_NAVIGATE?.(`/route-detail/${r.id}`)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer"
            >
              <div className="relative h-48">
                <PlaceholderImage
                  alt={r.title}
                  className="w-full h-full"
                  iconClassName="text-4xl sm:text-5xl"
                  label={r.titleKo}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-bold text-white mb-1">{r.title}</h3>
                  <p className="text-sm text-white/80">{r.titleKo}</p>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{r.description}</p>
                <div className="flex items-center gap-4 text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <i className="ri-map-pin-line text-sm"></i>
                    <span className="text-xs font-medium">{r.spots} spots</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <i className="ri-time-line text-sm"></i>
                    <span className="text-xs font-medium">{r.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <i className="ri-route-line text-sm"></i>
                    <span className="text-xs font-medium">{r.distance}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <BottomNav />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <StatusBar />
        <p className="text-gray-600">Route not found</p>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      <StatusBar />

      {/* Hero Image */}
      <div className="relative h-72 sm:h-80">
        <PlaceholderImage
          alt={route.title}
          className="w-full h-full"
          iconClassName="text-5xl sm:text-6xl opacity-30"
          label={route.titleKo}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />
        
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="absolute top-16 sm:top-20 left-3 sm:left-4 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-transform"
        >
          <i className="ri-arrow-left-line text-lg sm:text-xl text-gray-900 w-5 h-5 flex items-center justify-center" />
        </button>

        {/* Save Button */}
        <button
          onClick={() => setSavedRoute(!savedRoute)}
          className={`absolute top-16 sm:top-20 right-3 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-transform ${
            savedRoute ? 'bg-pink-500' : 'bg-white/90 backdrop-blur-sm'
          }`}
        >
          <i className={`${savedRoute ? 'ri-heart-fill text-white' : 'ri-heart-line text-gray-900'} text-lg sm:text-xl w-5 h-5 flex items-center justify-center`} />
        </button>

        {/* Title */}
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-5 right-4 sm:right-5">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 tracking-tight">{route.title}</h1>
          <p className="text-sm sm:text-base text-white/90">{route.titleKo}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-5 pt-3 pb-4 sm:pb-6">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-3 gap-2 sm:gap-3 mb-3"
        >
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm flex flex-col items-center gap-1.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-teal-50 rounded-full flex items-center justify-center">
              <i className="ri-map-pin-line text-teal-500 text-lg sm:text-xl w-5 h-5 flex items-center justify-center" />
            </div>
            <p className="text-sm sm:text-base font-bold text-gray-900">{route.spots}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">장소</p>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm flex flex-col items-center gap-1.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-50 rounded-full flex items-center justify-center">
              <i className="ri-time-line text-purple-500 text-lg sm:text-xl w-5 h-5 flex items-center justify-center" />
            </div>
            <p className="text-sm sm:text-base font-bold text-gray-900">{route.duration}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">소요시간</p>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm flex flex-col items-center gap-1.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-50 rounded-full flex items-center justify-center">
              <i className="ri-route-line text-amber-500 text-lg sm:text-xl w-5 h-5 flex items-center justify-center" />
            </div>
            <p className="text-sm sm:text-base font-bold text-gray-900">{route.distance}</p>
            <p className="text-[10px] sm:text-xs text-gray-500">거리</p>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm mb-3"
        >
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2.5">코스 소개</h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-2">{route.description}</p>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{route.descriptionKo}</p>
        </motion.div>

        {/* Spots List */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm"
        >
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">경유지</h2>
          <div className="space-y-2 sm:space-y-3">
            {route.spotsList.map((spot, index) => (
              <motion.div
                key={spot.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                onClick={() => handleSpotClick(spot.id)}
                className="flex items-center gap-3 sm:gap-4 cursor-pointer hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors active:scale-95"
              >
                {/* Number */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                
                {/* Image */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <PlaceholderImage
                    alt={spot.name}
                    className="w-full h-full"
                    iconClassName="text-lg sm:text-xl opacity-30"
                    label={spot.nameKo}
                  />
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">{spot.name}</h3>
                  <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1">{spot.nameKo}</p>
                  <div className="flex items-center gap-1 mt-0.5 text-gray-400">
                    <i className="ri-time-line text-[10px] sm:text-xs w-3 h-3 flex items-center justify-center" />
                    <span className="text-[10px] sm:text-xs">{spot.duration}</span>
                  </div>
                </div>
                
                {/* Arrow */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-arrow-right-s-line text-gray-400 text-lg sm:text-xl w-4 h-4 flex items-center justify-center" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-[76px] sm:bottom-[84px] left-0 right-0 bg-white border-t border-gray-200 p-3 sm:p-4 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-5">
          <button
            onClick={handleStartRoute}
            className="w-full py-3 sm:py-3.5 bg-teal-500 text-white rounded-full text-sm font-bold cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <i className="ri-navigation-line text-base sm:text-lg w-5 h-5 flex items-center justify-center" />
            루트 시작하기
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}