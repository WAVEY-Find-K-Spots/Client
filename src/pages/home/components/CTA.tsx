import { motion } from 'framer-motion';
import { PlaceholderImage } from '../../../components/base/PlaceholderImage';

export function CTA() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <PlaceholderImage
          alt="CTA 배경"
          className="w-full h-full"
          iconClassName="text-8xl sm:text-9xl"
          label="CTA 배경 이미지"
        />
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-8 sm:mb-10 tracking-wider"
          style={{ letterSpacing: '0.05em' }}
        >
          START YOUR K-JOURNEY NOW
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-8 sm:mb-12"
        >
          <p className="text-white text-base sm:text-lg lg:text-xl font-light">AI가 추천하는 나만의 K-콘텐츠 여행 루트를</p>
          <p className="text-white text-base sm:text-lg lg:text-xl font-light">지금 바로 만나보세요</p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="relative inline-flex items-center bg-black text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:scale-105 transition-transform cursor-pointer"
        >
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-accent-500 rounded-full flex items-center justify-center">
            <i className="ri-shopping-bag-line text-white text-lg sm:text-xl"></i>
          </div>
          <span className="ml-8 sm:ml-10 mr-3 sm:mr-4 font-semibold text-sm sm:text-base whitespace-nowrap">START NOW</span>
          <i className="ri-arrow-right-up-line text-lg sm:text-xl"></i>
        </motion.button>
      </div>
    </section>
  );
}
