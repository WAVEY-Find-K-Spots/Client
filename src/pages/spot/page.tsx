import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BottomNav } from '../../components/feature/BottomNav';
import { StatusBar } from '../../components/feature/StatusBar';
import { PlaceholderImage } from '../../components/base/PlaceholderImage';
import { kSpots } from '../../mocks/kSpots';

const categoryMeta: Record<string, { label: string; color: string; bg: string; strip: string }> = {
  'K-DRAMA': { label: '드라마', color: 'text-pink-600', bg: 'bg-pink-50', strip: 'bg-pink-500' },
  'K-MOVIE': { label: '영화', color: 'text-purple-600', bg: 'bg-purple-50', strip: 'bg-purple-500' },
  'K-POP': { label: 'K-POP', color: 'text-teal-600', bg: 'bg-teal-50', strip: 'bg-teal-500' },
  'K-HERITAGE': { label: '문화유산', color: 'text-amber-600', bg: 'bg-amber-50', strip: 'bg-amber-500' },
  'LANDMARK': { label: '랜드마크', color: 'text-indigo-600', bg: 'bg-indigo-50', strip: 'bg-indigo-500' },
  'CAFE': { label: '카페', color: 'text-orange-600', bg: 'bg-orange-50', strip: 'bg-orange-500' },
  'RESTAURANT': { label: '맛집', color: 'text-red-600', bg: 'bg-red-50', strip: 'bg-red-500' },
};

export default function SpotDetailPage() {
  const { id } = useParams();
  const spot = kSpots.find(s => s.id === Number(id));
  const [isFavorited, setIsFavorited] = useState(false);
  const [mediaTab, setMediaTab] = useState<'spotify' | 'youtube'>('spotify');
  const [spotifyIndex, setSpotifyIndex] = useState(0);
  const [youtubeIndex, setYoutubeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState<number | null>(null);
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!spot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <StatusBar />
        <p className="text-gray-600">장소를 찾을 수 없습니다</p>
        <BottomNav />
      </div>
    );
  }

  const getMediaContent = () => {
    const category = spot.category?.toUpperCase() || '';
    if (category.includes('KDRAMA') || category.includes('KMOVIE')) {
      return {
        spotify: { title: 'OST', items: [
          { title: 'Main Theme OST', artist: 'Various Artists', duration: '3:45' },
          { title: 'Emotional Scene BGM', artist: 'Orchestra', duration: '4:20' },
          { title: 'Ending Theme', artist: 'Featured Artist', duration: '3:30' },
        ]},
        youtube: { title: '트레일러 & 하이라이트', items: [
          { title: 'Official Trailer', views: '2.5M views', duration: '2:30' },
          { title: 'Behind the Scenes', views: '1.8M views', duration: '5:15' },
          { title: 'Best Moments', views: '3.2M views', duration: '4:00' },
        ]},
      };
    }
    if (category.includes('KPOP')) {
      return {
        spotify: { title: '앨범 & 싱글', items: [
          { title: 'Latest Album', artist: 'K-POP Artist', duration: '3:25' },
          { title: 'Hit Single', artist: 'K-POP Artist', duration: '3:15' },
          { title: 'B-Side Track', artist: 'K-POP Artist', duration: '3:40' },
        ]},
        youtube: { title: '뮤직비디오', items: [
          { title: 'Official MV', views: '50M views', duration: '3:30' },
          { title: 'Dance Practice', views: '25M views', duration: '3:25' },
          { title: 'Live Performance', views: '15M views', duration: '4:00' },
        ]},
      };
    }
    if (category.includes('HERITAGE')) {
      return {
        spotify: { title: '국악', items: [
          { title: 'Korean Traditional Music', artist: 'National Gugak Center', duration: '4:30' },
          { title: 'Palace Ceremony Music', artist: 'Traditional Orchestra', duration: '5:00' },
          { title: 'Folk Songs', artist: 'Various Artists', duration: '3:45' },
        ]},
        youtube: { title: '역사 다큐멘터리', items: [
          { title: 'History & Culture', views: '500K views', duration: '10:00' },
          { title: 'Architecture Guide', views: '300K views', duration: '8:30' },
          { title: 'Cultural Heritage', views: '400K views', duration: '12:00' },
        ]},
      };
    }
    return {
      spotify: { title: '배경음악', items: [
        { title: 'Cafe Lounge Mix', artist: 'Various Artists', duration: '3:30' },
        { title: 'Korean Jazz', artist: 'Jazz Ensemble', duration: '4:00' },
        { title: 'Chill Vibes', artist: 'Lo-fi Artist', duration: '3:15' },
      ]},
      youtube: { title: '관련 영상', items: [
        { title: 'Location Guide', views: '100K views', duration: '5:00' },
        { title: 'Travel Tips', views: '80K views', duration: '4:30' },
        { title: 'Food Review', views: '120K views', duration: '6:00' },
      ]},
    };
  };

  const mediaContent = getMediaContent();

  const handleSpotifyPrev = () => setSpotifyIndex(prev => Math.max(0, prev - 1));
  const handleSpotifyNext = () => setSpotifyIndex(prev => Math.min(mediaContent.spotify.items.length - 1, prev + 1));
  const handleYoutubePrev = () => setYoutubeIndex(prev => Math.max(0, prev - 1));
  const handleYoutubeNext = () => setYoutubeIndex(prev => Math.min(mediaContent.youtube.items.length - 1, prev + 1));

  const toggleSpotifyPlay = (index: number) => {
    if (isPlaying === index) setIsPlaying(null);
    else { setIsPlaying(index); setPlayingVideo(null); }
  };

  const toggleVideoPlay = (index: number) => {
    if (playingVideo === index) setPlayingVideo(null);
    else { setPlayingVideo(index); setIsPlaying(null); }
  };

  const handleGetDirections = () => {
    window.open(`https://map.naver.com/v5/search/${encodeURIComponent(spot.name)}`, '_blank');
  };

  const nearbySpots = kSpots.filter(s => s.id !== spot.id).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 pb-36 sm:pb-44">
      <StatusBar />

      {/* Header Image */}
      <div className="relative" style={{ height: 'clamp(260px, 48vw, 360px)' }}>
        <PlaceholderImage alt={spot.name} className="w-full h-full" iconClassName="text-5xl sm:text-6xl opacity-30" label={`${spot.name} 이미지`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="absolute top-14 sm:top-16 left-3 sm:left-4 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-transform"
        >
          <i className="ri-arrow-left-line text-lg sm:text-xl text-gray-900 w-5 h-5 flex items-center justify-center" />
        </button>

        {/* Favorite */}
        <button
          onClick={() => setIsFavorited(!isFavorited)}
          className="absolute top-14 sm:top-16 right-3 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer shadow-lg active:scale-95 transition-transform"
        >
          <i className={`${isFavorited ? 'ri-heart-fill text-pink-500' : 'ri-heart-line text-gray-700'} text-lg sm:text-xl w-5 h-5 flex items-center justify-center`} />
        </button>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {spot.categories.map((cat) => {
              const meta = categoryMeta[cat] || { label: cat, color: 'text-gray-700', bg: 'bg-white/90', strip: 'bg-gray-500' };
              return (
                <span key={cat} className={`inline-flex items-center gap-1 ${meta.bg} backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold ${meta.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${meta.strip}`} />
                  {meta.label}
                </span>
              );
            })}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-1.5 tracking-tight">{spot.name}</h1>
          <div className="flex items-center gap-3 text-white/90 text-xs sm:text-sm">
            <div className="flex items-center gap-1">
              <i className="ri-star-fill text-amber-400 w-4 h-4 flex items-center justify-center" />
              <span className="font-bold">{spot.rating}</span>
            </div>
            <div className="w-px h-3 bg-white/30" />
            <div className="flex items-center gap-1">
              <i className="ri-map-pin-line w-4 h-4 flex items-center justify-center" />
              <span>{spot.district}</span>
            </div>
            <div className="w-px h-3 bg-white/30" />
            <span>{spot.reviews.toLocaleString()}개 후기</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-5 pt-3 pb-4 sm:pb-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-2 sm:gap-3 mb-3"
        >
          <button
            onClick={handleGetDirections}
            className="flex flex-col items-center gap-1.5 py-3 sm:py-4 bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-teal-50 rounded-full flex items-center justify-center">
              <i className="ri-navigation-line text-teal-500 text-lg sm:text-xl w-5 h-5 flex items-center justify-center" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-gray-700">길찾기</span>
          </button>
          <button
            onClick={() => window.REACT_APP_NAVIGATE?.(`/route-create?spot=${spot.id}`)}
            className="flex flex-col items-center gap-1.5 py-3 sm:py-4 bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-50 rounded-full flex items-center justify-center">
              <i className="ri-add-line text-purple-500 text-lg sm:text-xl w-5 h-5 flex items-center justify-center" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-gray-700">루트 추가</span>
          </button>
          <button
            onClick={() => window.REACT_APP_NAVIGATE?.('/community')}
            className="flex flex-col items-center gap-1.5 py-3 sm:py-4 bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm cursor-pointer active:scale-95 transition-transform"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-pink-50 rounded-full flex items-center justify-center">
              <i className="ri-share-forward-line text-pink-500 text-lg sm:text-xl w-5 h-5 flex items-center justify-center" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-gray-700">공유</span>
          </button>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm mb-3"
        >
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2.5">장소 소개</h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{spot.description}</p>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-2 sm:gap-3 mb-3"
        >
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                <i className="ri-time-line text-teal-500 text-sm sm:text-base w-4 h-4 flex items-center justify-center" />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-gray-500">운영시간</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-gray-900">09:00 - 18:00</p>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <i className="ri-price-tag-3-line text-purple-500 text-sm sm:text-base w-4 h-4 flex items-center justify-center" />
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-gray-500">입장료</span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-gray-900">무료 / ₩5,000</p>
          </div>
        </motion.div>

        {/* Media Content */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm mb-3"
        >
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">관련 미디어</h2>
          {/* Tab Toggle */}
          <div className="flex bg-gray-100 rounded-full p-1 mb-3 sm:mb-4">
            <button
              onClick={() => setMediaTab('spotify')}
              className={`flex-1 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                mediaTab === 'spotify' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              <i className="ri-spotify-fill w-4 h-4 flex items-center justify-center" />
              Spotify
            </button>
            <button
              onClick={() => setMediaTab('youtube')}
              className={`flex-1 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 ${
                mediaTab === 'youtube' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              <i className="ri-youtube-fill w-4 h-4 flex items-center justify-center" />
              YouTube
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-bold text-gray-700">
                {mediaTab === 'spotify' ? mediaContent.spotify.title : mediaContent.youtube.title}
              </h3>
              <span className="text-[10px] sm:text-xs text-gray-400">
                {mediaTab === 'spotify' ? spotifyIndex + 1 : youtubeIndex + 1} / {mediaTab === 'spotify' ? mediaContent.spotify.items.length : mediaContent.youtube.items.length}
              </span>
            </div>

            {mediaTab === 'spotify' ? (
              <div>
                <div className="overflow-hidden">
                  <div className="flex transition-transform duration-300 ease-out" style={{ transform: `translateX(-${spotifyIndex * 100}%)` }}>
                    {mediaContent.spotify.items.map((item, index) => (
                      <div key={index} className="w-full flex-shrink-0 px-0.5">
                        <div className="bg-gray-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
                          <div
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl overflow-hidden bg-gray-200 flex-shrink-0 relative cursor-pointer group active:scale-95 transition-transform"
                            onClick={() => toggleSpotifyPlay(index)}
                          >
                            <PlaceholderImage alt={item.title} className="w-full h-full" iconClassName="text-lg sm:text-xl opacity-30" label="음악 커버" />
                            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isPlaying === index ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center">
                                <i className={`${isPlaying === index ? 'ri-pause-fill' : 'ri-play-fill'} text-white text-lg sm:text-xl w-5 h-5 flex items-center justify-center`} />
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{item.title}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500 truncate">{item.artist}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] sm:text-xs text-gray-400">{item.duration}</span>
                              {isPlaying === index && (
                                <div className="flex items-center gap-0.5">
                                  {[...Array(4)].map((_, i) => (
                                    <div key={i} className="w-0.5 bg-green-500 rounded-full animate-pulse" style={{ height: `${6 + Math.random() * 6}px`, animationDelay: `${i * 0.1}s` }} />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {mediaContent.spotify.items.length > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <button
                      onClick={handleSpotifyPrev}
                      disabled={spotifyIndex === 0}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                        spotifyIndex === 0 ? 'bg-gray-100 text-gray-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                      }`}
                    >
                      <i className="ri-arrow-left-s-line text-lg sm:text-xl w-5 h-5 flex items-center justify-center" />
                    </button>
                    <div className="flex gap-1">
                      {mediaContent.spotify.items.map((_, index) => (
                        <div key={index} className={`h-1.5 rounded-full transition-all ${index === spotifyIndex ? 'w-4 bg-green-500' : 'w-1.5 bg-gray-300'}`} />
                      ))}
                    </div>
                    <button
                      onClick={handleSpotifyNext}
                      disabled={spotifyIndex === mediaContent.spotify.items.length - 1}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                        spotifyIndex === mediaContent.spotify.items.length - 1 ? 'bg-gray-100 text-gray-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                      }`}
                    >
                      <i className="ri-arrow-right-s-line text-lg sm:text-xl w-5 h-5 flex items-center justify-center" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="overflow-hidden">
                  <div className="flex transition-transform duration-300 ease-out" style={{ transform: `translateX(-${youtubeIndex * 100}%)` }}>
                    {mediaContent.youtube.items.map((item, index) => (
                      <div key={index} className="w-full flex-shrink-0 px-0.5">
                        <div className="w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 relative cursor-pointer group active:scale-95 transition-transform" onClick={() => toggleVideoPlay(index)}>
                          <PlaceholderImage alt={item.title} className="w-full h-full" iconClassName="text-2xl sm:text-3xl opacity-30" label="동영상 썸네일" />
                          {playingVideo === index ? (
                            <div className="absolute inset-0 bg-black flex items-center justify-center">
                              <div className="text-center">
                                <div className="flex items-center justify-center gap-1 mb-2">
                                  {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-1 bg-red-500 rounded-full animate-pulse" style={{ height: `${12 + Math.random() * 12}px`, animationDelay: `${i * 0.15}s` }} />
                                  ))}
                                </div>
                                <p className="text-white text-xs sm:text-sm">Playing...</p>
                                <button className="mt-2 px-3 py-1.5 bg-red-600 text-white rounded-full text-[10px] sm:text-xs font-medium">
                                  <i className="ri-pause-fill mr-1" />Pause
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-10 h-10 sm:w-14 sm:h-14 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                  <i className="ri-play-fill text-white text-xl sm:text-3xl w-5 h-5 flex items-center justify-center ml-0.5" />
                                </div>
                              </div>
                              <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] text-white font-medium">{item.duration}</div>
                            </>
                          )}
                        </div>
                        <div className="mt-2">
                          <p className="text-xs sm:text-sm font-bold text-gray-900">{item.title}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">{item.views}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {mediaContent.youtube.items.length > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <button
                      onClick={handleYoutubePrev}
                      disabled={youtubeIndex === 0}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                        youtubeIndex === 0 ? 'bg-gray-100 text-gray-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                      }`}
                    >
                      <i className="ri-arrow-left-s-line text-lg sm:text-xl w-5 h-5 flex items-center justify-center" />
                    </button>
                    <div className="flex gap-1">
                      {mediaContent.youtube.items.map((_, index) => (
                        <div key={index} className={`h-1.5 rounded-full transition-all ${index === youtubeIndex ? 'w-4 bg-red-500' : 'w-1.5 bg-gray-300'}`} />
                      ))}
                    </div>
                    <button
                      onClick={handleYoutubeNext}
                      disabled={youtubeIndex === mediaContent.youtube.items.length - 1}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                        youtubeIndex === mediaContent.youtube.items.length - 1 ? 'bg-gray-100 text-gray-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95'
                      }`}
                    >
                      <i className="ri-arrow-right-s-line text-lg sm:text-xl w-5 h-5 flex items-center justify-center" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Nearby Spots */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm"
        >
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">주변 장소</h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {nearbySpots.map((nearbySpot) => {
              const firstCat = nearbySpot.categories[0] || '';
              const meta = categoryMeta[firstCat] || { strip: 'bg-gray-500' };
              return (
                <div
                  key={nearbySpot.id}
                  onClick={() => {
                    window.scrollTo(0, 0);
                    window.REACT_APP_NAVIGATE?.(`/spot/${nearbySpot.id}`);
                  }}
                  className="cursor-pointer group active:scale-95 transition-transform"
                >
                  <div className="relative rounded-xl sm:rounded-2xl overflow-hidden mb-2">
                    <PlaceholderImage
                      alt={nearbySpot.name}
                      className="w-full h-24 sm:h-28"
                      iconClassName="text-2xl sm:text-3xl opacity-30"
                      label={nearbySpot.name}
                    />
                    <div className={`absolute bottom-0 left-0 right-0 h-1 ${meta.strip}`} />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">{nearbySpot.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <i className="ri-star-fill text-amber-400 text-[10px] sm:text-xs w-3 h-3 flex items-center justify-center" />
                    <span className="text-[10px] sm:text-xs text-gray-500">{nearbySpot.rating}</span>
                    <span className="text-[10px] sm:text-xs text-gray-400">· {nearbySpot.district}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-[76px] sm:bottom-[84px] left-0 right-0 bg-white border-t border-gray-200 p-3 sm:p-4 z-40">
        <div className="flex gap-2 sm:gap-3 max-w-7xl mx-auto px-4 sm:px-5">
          <button
            onClick={() => setIsFavorited(!isFavorited)}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-95 flex-shrink-0 border ${
              isFavorited ? 'bg-pink-50 border-pink-200 text-pink-500' : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
          >
            <i className={`${isFavorited ? 'ri-heart-fill' : 'ri-heart-line'} text-xl sm:text-2xl w-6 h-6 flex items-center justify-center`} />
          </button>
          <button
            onClick={handleGetDirections}
            className="flex-1 py-3 sm:py-3.5 bg-teal-500 text-white rounded-full text-sm font-bold cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <i className="ri-navigation-line text-base sm:text-lg w-5 h-5 flex items-center justify-center" />
            길찾기
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}