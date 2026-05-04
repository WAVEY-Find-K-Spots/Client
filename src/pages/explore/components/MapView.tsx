
import { kSpots } from '../../../mocks/kSpots';

interface MapViewProps {
  selectedCategory: string;
  searchQuery: string;
  selectedSpotId: number | null;
  onClearSelection: () => void;
}

// 장소별 좌표 데이터
const spotCoordinates: Record<number, { lat: number; lng: number }> = {
  1: { lat: 37.5512, lng: 126.9882 }, // N서울타워
  2: { lat: 37.5796, lng: 126.9770 }, // 경복궁
  3: { lat: 37.5563, lng: 126.9236 }, // 홍대 거리
  4: { lat: 35.0975, lng: 129.0108 }, // 감천문화마을
  5: { lat: 37.6128, lng: 126.9745 }, // 카페 온리
  6: { lat: 37.5636, lng: 126.9869 }, // 명동 교자
  7: { lat: 33.4242, lng: 126.9306 }, // 섭지코지
  8: { lat: 37.4979, lng: 127.0276 }, // K-STAR ROAD
  9: { lat: 37.5826, lng: 126.9831 }, // 북촌 한옥마을
  10: { lat: 37.5445, lng: 127.0557 }, // 성수동
  11: { lat: 37.5700, lng: 126.9997 }, // 광장시장
  12: { lat: 37.5126, lng: 127.1025 }, // 롯데월드타워
};

export function MapView({ selectedSpotId, onClearSelection }: MapViewProps) {
  const selectedSpot = selectedSpotId ? kSpots.find(s => s.id === selectedSpotId) : null;
  const coords = selectedSpotId ? spotCoordinates[selectedSpotId] : null;

  // 선택된 장소가 있으면 해당 위치로, 없으면 서울 전체
  const mapSrc = coords
    ? `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${coords.lng}!3d${coords.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMarker!5e0!3m2!1sko!2skr!4v1699999999999!5m2!1sko!2skr`
    : `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d101912.38420686948!2d126.89714157421876!3d37.55098196562655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca28b61c565cd%3A0x858aedb4e4ea83eb!2sSeoul%2C%20South%20Korea!5e0!3m2!1sko!2skr!4v1699999999999!5m2!1sko!2skr`;

  const categoryConfig: Record<string, { color: string; label: string }> = {
    restaurant: { color: '#f97316', label: '맛집' },
    cafe: { color: '#f59e0b', label: '카페' },
    accommodation: { color: '#6366f1', label: '숙소' },
    convenience: { color: '#10b981', label: '편의점' },
    shopping: { color: '#ec4899', label: '쇼핑' },
    attraction: { color: '#06b6d4', label: '명소' },
    photobooth: { color: '#d946ef', label: '포토부스' },
    landmark: { color: '#64748b', label: '랜드마크' },
  };

  const config = selectedSpot ? (categoryConfig[selectedSpot.category] || categoryConfig.landmark) : null;

  return (
    <div className="relative h-[calc(100vh-180px)]">
      {/* Google Map Embed */}
      <div className="absolute inset-0">
        <iframe
          src={mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Location Map"
        ></iframe>
      </div>

      {/* 선택된 장소가 없을 때 안내 메시지 */}
      {!selectedSpot && (
        <div className="absolute top-4 left-4 right-4 bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center border border-teal-100">
              <i className="ri-information-line text-teal-600 text-lg"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">장소를 선택해주세요</p>
              <p className="text-xs text-gray-500">리스트 탭에서 "지도 보기"를 눌러주세요</p>
            </div>
          </div>
        </div>
      )}

      {/* 선택된 장소 정보 카드 */}
      {selectedSpot && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden active:scale-95 transition-transform">
            <div className="flex">
              <div className="w-28 h-28 flex-shrink-0 relative">
                <img
                  src={selectedSpot.image}
                  alt={selectedSpot.name}
                  className="w-full h-full object-cover object-top"
                />
                {config && (
                  <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: config.color }}></div>
                )}
              </div>
              <div className="flex-1 p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {config && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white rounded-full text-[10px] font-semibold mb-1 border border-gray-100">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.color }}></span>
                        <span style={{ color: config.color }}>{config.label}</span>
                      </span>
                    )}
                    <h3 className="text-base font-bold text-gray-900">{selectedSpot.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <i className="ri-map-pin-line text-gray-400"></i>
                      <span className="line-clamp-1">{selectedSpot.location}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <i className="ri-star-fill text-yellow-400 text-xs"></i>
                      <span className="text-xs font-semibold text-gray-900">{selectedSpot.rating}</span>
                      <span className="text-xs text-gray-500">({selectedSpot.reviews})</span>
                    </div>
                  </div>
                  <button
                    onClick={onClearSelection}
                    className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center hover:bg-gray-100 active:scale-90 transition-all cursor-pointer border border-gray-100"
                  >
                    <i className="ri-close-line text-gray-600"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
