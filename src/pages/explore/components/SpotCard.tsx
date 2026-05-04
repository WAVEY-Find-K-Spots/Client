
import { useState } from 'react';

interface Spot {
  id: number;
  name: string;
  category: string;
  content: string;
  location: string;
  image: string;
  rating: number;
  reviews: number;
}

interface SpotCardProps {
  spot: Spot;
  isSelected?: boolean;
  onMapView?: () => void;
}

const categoryConfig: Record<string, { color: string; icon: string; label: string }> = {
  restaurant: { color: '#f97316', icon: 'ri-restaurant-line', label: '맛집' },
  cafe: { color: '#f59e0b', icon: 'ri-cup-line', label: '카페' },
  accommodation: { color: '#6366f1', icon: 'ri-hotel-line', label: '숙소' },
  convenience: { color: '#10b981', icon: 'ri-store-line', label: '편의점' },
  shopping: { color: '#ec4899', icon: 'ri-shopping-bag-line', label: '쇼핑' },
  attraction: { color: '#06b6d4', icon: 'ri-landscape-line', label: '명소' },
  photobooth: { color: '#d946ef', icon: 'ri-camera-line', label: '포토부스' },
  landmark: { color: '#64748b', icon: 'ri-building-line', label: '랜드마크' },
};

export function SpotCard({ spot, isSelected = false, onMapView }: SpotCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const config = categoryConfig[spot.category] || categoryConfig.landmark;

  return (
    <>
      <div
        className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all active:scale-95 ${
          isSelected ? 'ring-2 ring-teal-500' : ''
        }`}
      >
        <div className="relative h-48 w-full">
          <img
            src={spot.image}
            alt={spot.name}
            className="w-full h-full object-cover object-top"
          />
          {/* Category badge — white bg + colored dot */}
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }}></span>
              <span style={{ color: config.color }}>{config.label}</span>
            </span>
          </div>
          {/* Heart button */}
          <button className="absolute top-3 right-3 w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full border border-gray-100 flex items-center justify-center active:scale-90 transition-transform cursor-pointer">
            <i className="ri-heart-line text-gray-700"></i>
          </button>
          {/* Bottom color strip */}
          <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: config.color }}></div>
        </div>

        <div className="p-4">
          <h3 className="text-base font-bold text-gray-900 mb-1">{spot.name}</h3>
          <p className="text-sm text-gray-500 mb-3 line-clamp-1">{spot.content}</p>

          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <i className="ri-map-pin-line text-gray-400"></i>
            <span className="line-clamp-1">{spot.location}</span>
            <span className="text-gray-300">|</span>
            <div className="flex items-center gap-1">
              <i className="ri-star-fill text-yellow-400"></i>
              <span className="font-semibold text-gray-900">{spot.rating}</span>
              <span>({spot.reviews})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetails(true)}
              className="flex-1 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 active:scale-95"
            >
              자세히 보기
              <i className="ri-arrow-right-line"></i>
            </button>
            {onMapView && (
              <button
                onClick={onMapView}
                className="flex-1 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-semibold hover:bg-teal-600 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 active:scale-95"
              >
                <i className="ri-map-pin-2-line"></i>
                지도 보기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetails && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 sm:h-80 w-full">
              <img
                src={spot.image}
                alt={spot.name}
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
              <button
                onClick={() => setShowDetails(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
              >
                <i className="ri-close-line text-xl text-gray-700"></i>
              </button>
              {/* Category badge on header */}
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }}></span>
                  <span style={{ color: config.color }}>{config.label}</span>
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {spot.name}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <i className="ri-map-pin-line text-gray-400"></i>
                    <span>{spot.location}</span>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-1">
                      <i className="ri-star-fill text-yellow-400"></i>
                      <span className="font-semibold text-gray-900">{spot.rating}</span>
                      <span>({spot.reviews} 리뷰)</span>
                    </div>
                  </div>
                </div>
                <button className="w-11 h-11 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-all cursor-pointer border border-gray-100">
                  <i className="ri-heart-line text-gray-700 text-lg"></i>
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-base font-bold text-gray-900 mb-2">콘텐츠 정보</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{spot.content}</p>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button className="flex flex-col items-center gap-1.5 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 active:scale-95 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center">
                    <i className="ri-navigation-line text-teal-500 text-lg"></i>
                  </div>
                  <span className="text-xs font-medium text-gray-700">길찾기</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 active:scale-95 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center">
                    <i className="ri-route-line text-teal-500 text-lg"></i>
                  </div>
                  <span className="text-xs font-medium text-gray-700">루트추가</span>
                </button>
                <button className="flex flex-col items-center gap-1.5 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 active:scale-95 transition-all cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center">
                    <i className="ri-share-line text-teal-500 text-lg"></i>
                  </div>
                  <span className="text-xs font-medium text-gray-700">공유</span>
                </button>
              </div>

              <div className="mb-6">
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  AI 도슨트 안내
                </h3>
                <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100">
                  <p className="text-sm text-gray-700 mb-3">
                    이 장소에 대한 더 자세한 문화적 맥락과 배경 이야기를 AI 도슨트가
                    안내해드립니다.
                  </p>
                  <button className="w-full bg-teal-500 text-white py-3 rounded-xl font-semibold hover:bg-teal-600 active:scale-95 transition-all cursor-pointer whitespace-nowrap">
                    <i className="ri-mic-line mr-2"></i>
                    AI 도슨트 시작하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
