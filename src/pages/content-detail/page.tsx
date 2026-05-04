import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BottomNav } from '../../components/feature/BottomNav';
import { StatusBar } from '../../components/feature/StatusBar';
import { PlaceholderImage } from '../../components/base/PlaceholderImage';

const contents = [
  {
    id: 1,
    type: 'K-DRAMA',
    title: 'Crash Landing on You',
    titleKo: '사랑의 불시착',
    description: 'Explore the romantic filming locations from this beloved K-Drama. From the DMZ border to Swiss Alps scenes recreated in Korea.',
    descriptionKo: '사랑받는 K-드라마의 로맨틱한 촬영지를 탐험하세요.',
    spots: 8,
    icon: 'ri-film-line',
    color: 'bg-pink-500',
    locations: [
      { id: 1, name: 'Jeongdongjin Beach', nameKo: '정동진 해변' },
      { id: 2, name: 'Swiss Village', nameKo: '스위스 마을' },
      { id: 3, name: 'Imjingak Park', nameKo: '임진각 공원' },
      { id: 4, name: 'Cafe Scene Location', nameKo: '카페 촬영지' },
    ]
  },
  {
    id: 2,
    type: 'K-POP',
    title: 'BTS Music Videos',
    titleKo: 'BTS 뮤직비디오',
    description: 'Visit iconic MV shooting locations from BTS. Experience the places where legendary music videos were filmed.',
    descriptionKo: 'BTS의 상징적인 뮤직비디오 촬영지를 방문하세요.',
    spots: 12,
    icon: 'ri-music-line',
    color: 'bg-teal-500',
    locations: [
      { id: 1, name: 'Dongdaemun DDP', nameKo: '동대문 DDP' },
      { id: 2, name: 'Gyeongju Bulguksa', nameKo: '경주 불국사' },
      { id: 3, name: 'Jumunjin Beach', nameKo: '주문진 해변' },
      { id: 4, name: 'Hybe Insight', nameKo: '하이브 인사이트' },
    ]
  },
  {
    id: 3,
    type: 'K-MOVIE',
    title: 'Parasite',
    titleKo: '기생충',
    description: 'Discover Oscar-winning film locations from Parasite. Visit the iconic stairs, neighborhoods, and filming spots.',
    descriptionKo: '오스카 수상작 기생충의 촬영지를 발견하세요.',
    spots: 6,
    icon: 'ri-movie-line',
    color: 'bg-amber-500',
    locations: [
      { id: 1, name: 'Jahamun Tunnel Stairs', nameKo: '자하문 터널 계단' },
      { id: 2, name: 'Ahyeon-dong', nameKo: '아현동' },
      { id: 3, name: 'Sky Pizza', nameKo: '스카이 피자' },
      { id: 4, name: 'Woori Supermarket', nameKo: '우리 슈퍼마켓' },
    ]
  },
];

export default function ContentDetailPage() {
  const { id } = useParams();
  const [savedContent, setSavedContent] = useState(false);

  const content = contents.find(c => c.id === Number(id));

  const handleBack = () => {
    window.history.back();
  };

  const handleSpotClick = (spotId: number) => {
    if (window.REACT_APP_NAVIGATE) {
      window.REACT_APP_NAVIGATE(`/spot/${spotId}`);
    }
  };

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <StatusBar />
        <p className="text-gray-600">Content not found</p>
        <BottomNav />
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    'K-DRAMA': 'bg-pink-500',
    'K-POP': 'bg-teal-500',
    'K-MOVIE': 'bg-amber-500',
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      <StatusBar />

      {/* Hero Image */}
      <div className="relative h-64 sm:h-72">
        <PlaceholderImage
          alt={content.title}
          className="w-full h-full"
          iconClassName="text-5xl sm:text-6xl opacity-30"
          label={content.titleKo}
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
          onClick={() => setSavedContent(!savedContent)}
          className={`absolute top-16 sm:top-20 right-3 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-transform ${
            savedContent ? 'bg-pink-500' : 'bg-white/90 backdrop-blur-sm'
          }`}
        >
          <i className={`${savedContent ? 'ri-heart-fill text-white' : 'ri-heart-line text-gray-900'} text-lg sm:text-xl w-5 h-5 flex items-center justify-center`} />
        </button>

        {/* Category Badge */}
        <div className={`absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 ${categoryColors[content.type]} px-3 sm:px-4 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 sm:gap-2`}>
          <i className={`${content.icon} text-white text-sm w-4 h-4 flex items-center justify-center`} />
          <span className="text-white text-xs font-bold">{content.type}</span>
        </div>

        {/* Title */}
        <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-5 right-4 sm:right-5">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 tracking-tight">{content.title}</h1>
          <p className="text-sm sm:text-base text-white/90">{content.titleKo}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-5 pt-3 pb-4 sm:pb-6">
        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-2 sm:gap-3 mb-3"
        >
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-teal-50 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-map-pin-line text-teal-500 text-lg sm:text-xl w-5 h-5 flex items-center justify-center" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-900">{content.spots}개 장소</p>
              <p className="text-[10px] sm:text-xs text-gray-500">촬영 장소</p>
            </div>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-50 rounded-full flex items-center justify-center flex-shrink-0">
              <i className="ri-star-fill text-amber-400 text-lg sm:text-xl w-5 h-5 flex items-center justify-center" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-900">4.8</p>
              <p className="text-[10px] sm:text-xs text-gray-500">평점</p>
            </div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm mb-3"
        >
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2.5">소개</h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-2">{content.description}</p>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{content.descriptionKo}</p>
        </motion.div>

        {/* Locations Grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm"
        >
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">촬영 장소</h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {content.locations.map((location, index) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                onClick={() => handleSpotClick(location.id)}
                className="cursor-pointer group active:scale-95 transition-transform"
              >
                <div className="relative rounded-xl sm:rounded-2xl overflow-hidden mb-2">
                  <PlaceholderImage
                    alt={location.name}
                    className="w-full h-24 sm:h-28"
                    iconClassName="text-2xl sm:text-3xl opacity-30"
                    label={location.nameKo}
                  />
                  <div className="absolute top-2 left-2 w-6 h-6 sm:w-7 sm:h-7 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">{location.name}</h3>
                <p className="text-[10px] sm:text-xs text-gray-500">{location.nameKo}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-[76px] sm:bottom-[84px] left-0 right-0 bg-white border-t border-gray-200 p-3 sm:p-4 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-5">
          <button
            onClick={() => window.REACT_APP_NAVIGATE?.('/map')}
            className="w-full py-3 sm:py-3.5 bg-teal-500 text-white rounded-full text-sm font-bold cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <i className="ri-map-pin-line text-base sm:text-lg w-5 h-5 flex items-center justify-center" />
            지도에서 보기
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}