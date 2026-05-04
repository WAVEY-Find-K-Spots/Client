import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlaceholderImage } from '../../components/base/PlaceholderImage';

export default function SplashPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      if (hasSeenOnboarding) {
        if (window.REACT_APP_NAVIGATE) {
          window.REACT_APP_NAVIGATE('/');
        }
      } else {
        if (window.REACT_APP_NAVIGATE) {
          window.REACT_APP_NAVIGATE('/onboarding');
        }
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Background Image Placeholder */}
      <div className="absolute inset-0">
        <PlaceholderImage
          alt="Seoul Skyline"
          className="w-full h-full"
          iconClassName="text-8xl sm:text-9xl"
          label="스플래시 배경 이미지"
        />
      </div>

      {/* Status Bar */}
      <div className="absolute top-0 left-0 right-0 h-11 z-50 flex items-center justify-between px-4 sm:px-6">
        <span className="text-white text-xs sm:text-sm font-semibold">오전 9:41</span>
        <div className="flex items-center gap-1">
          <i className="ri-signal-wifi-fill text-white text-xs sm:text-sm"></i>
          <i className="ri-wifi-fill text-white text-xs sm:text-sm"></i>
          <i className="ri-battery-fill text-white text-xs sm:text-sm"></i>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 w-full max-w-md">
        {/* Logo Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-4 sm:mb-6"
        >
          <PlaceholderImage
            alt="WAVEY"
            className="w-24 h-24 mx-auto rounded-2xl"
            iconClassName="text-5xl sm:text-6xl"
            label="앱 로고"
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-white/90 text-base sm:text-lg font-light tracking-wide"
        >
          당신의 K-컬처 가이드
        </motion.p>

        {/* Loading Dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="flex justify-center gap-1.5 sm:gap-2 mt-10 sm:mt-12"
        >
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/70 rounded-full animate-pulse"></div>
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </motion.div>
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 sm:w-32 h-1 bg-white/30 rounded-full"></div>
    </div>
  );
}
