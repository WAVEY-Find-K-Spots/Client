import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlaceholderImage } from '../../components/base/PlaceholderImage';

const slides = [
  {
    id: 1,
    title: 'Explore K-Spots',
    titleKo: 'K-스팟 탐험하기',
    description: 'Discover filming locations from your favorite K-Dramas, K-Movies, and K-Pop MVs',
    descriptionKo: '좋아하는 드라마, 영화, 뮤직비디오 촬영지를 발견하세요',
    icon: 'ri-map-pin-line',
    color: 'from-teal-500 to-cyan-500',
  },
  {
    id: 2,
    title: 'AI Guide Assistant',
    titleKo: 'AI 가이드 도우미',
    description: 'Get real-time translations and cultural insights powered by AI',
    descriptionKo: 'AI 기반 실시간 번역과 문화적 맥락을 제공받으세요',
    icon: 'ri-robot-line',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 3,
    title: 'Custom Routes',
    titleKo: '나만의 루트 만들기',
    description: 'Create your own travel routes and follow curated K-Culture tours',
    descriptionKo: '나만의 여행 경로를 만들고 큐레이션된 투어를 따라가세요',
    icon: 'ri-route-line',
    color: 'from-orange-500 to-red-500',
  },
  {
    id: 4,
    title: 'Collect Stamps',
    titleKo: '스탬프 수집하기',
    description: 'Visit locations and collect digital stamps in your travel passport',
    descriptionKo: '장소를 방문하고 여행 여권에 디지털 스탬프를 모으세요',
    icon: 'ri-award-line',
    color: 'from-yellow-500 to-amber-500',
  }
];

export default function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    handleFinish();
  };

  const handleFinish = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    if (window.REACT_APP_NAVIGATE) {
      window.REACT_APP_NAVIGATE('/login');
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Status Bar */}
      <div className="h-11 bg-transparent flex items-center justify-between px-4 sm:px-6">
        <span className="text-gray-900 text-xs sm:text-sm font-semibold">9:41</span>
        <div className="flex items-center gap-1">
          <i className="ri-signal-wifi-fill text-gray-900 text-xs sm:text-sm"></i>
          <i className="ri-wifi-fill text-gray-900 text-xs sm:text-sm"></i>
          <i className="ri-battery-fill text-gray-900 text-xs sm:text-sm"></i>
        </div>
      </div>

      {/* Skip Button */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex justify-end">
        <button
          onClick={handleSkip}
          className="text-gray-400 text-xs sm:text-sm font-medium hover:text-gray-600 transition-colors cursor-pointer whitespace-nowrap"
        >
          건너뛰기
        </button>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-6 sm:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md text-center"
          >
            {/* Phone Mockup - Empty Screen */}
            <div className="mb-6 sm:mb-8 relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.color} opacity-10 rounded-2xl sm:rounded-3xl blur-3xl`}></div>
              <div className="relative w-full flex items-center justify-center">
                {/* Phone Frame */}
                <div className="relative w-40 sm:w-52 h-[280px] sm:h-[380px] bg-gray-900 rounded-[28px] sm:rounded-[36px] p-1.5 sm:p-2 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[22px] sm:rounded-[28px] overflow-hidden relative flex items-center justify-center">
                    <PlaceholderImage
                      alt={slide.titleKo}
                      className="w-full h-full"
                      iconClassName="text-4xl sm:text-5xl"
                      label={slide.titleKo}
                    />
                    {/* Phone Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-4 sm:h-5 bg-gray-900 rounded-b-lg sm:rounded-b-xl"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Icon */}
            <div className={`inline-flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${slide.color} mb-4 sm:mb-5 shadow-lg`}>
              <i className={`${slide.icon} text-white text-xl sm:text-2xl`}></i>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-0.5 sm:mb-1">
              {slide.titleKo}
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mb-2 sm:mb-3 font-medium">
              {slide.title}
            </p>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-600 mb-0.5 sm:mb-1 leading-relaxed px-2">
              {slide.descriptionKo}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed px-2">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Section */}
      <div className="px-4 sm:px-6 pb-6 sm:pb-8">
        {/* Page Indicators */}
        <div className="flex justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-6 sm:w-8 bg-gradient-to-r ' + slide.color
                  : 'w-1.5 sm:w-2 bg-gray-200'
              }`}
            ></div>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className={`w-full py-3 sm:py-4 bg-gradient-to-r ${slide.color} text-white text-sm sm:text-base font-semibold rounded-xl sm:rounded-2xl hover:shadow-lg transition-all whitespace-nowrap cursor-pointer`}
        >
          {currentSlide < slides.length - 1 ? '다음' : '시작하기'}
        </button>
      </div>

      {/* Home Indicator */}
      <div className="pb-2 flex justify-center">
        <div className="w-28 sm:w-32 h-1 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
}
