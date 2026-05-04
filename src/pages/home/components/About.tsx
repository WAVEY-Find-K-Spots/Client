import { motion } from 'framer-motion';
import { PlaceholderImage } from '../../../components/base/PlaceholderImage';

export function About() {
  return (
    <section id="about" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight mb-6 sm:mb-8">
              K-콘텐츠 속 그 장소,<br />
              이제 직접<br />
              경험하세요
            </h2>

            <button className="px-6 sm:px-8 py-3 sm:py-3.5 bg-emerald-400 text-gray-900 text-sm font-semibold rounded-full hover:bg-emerald-500 transition-all inline-flex items-center gap-2 mb-12 sm:mb-16 whitespace-nowrap cursor-pointer">
              자세히 알아보기
              <i className="ri-arrow-right-line"></i>
            </button>

            <div className="flex gap-12 sm:gap-24">
              <div>
                <div className="text-4xl sm:text-6xl font-bold text-gray-900 mb-2">50만+</div>
                <div className="text-xs sm:text-sm text-gray-500">글로벌 사용자</div>
              </div>
              <div>
                <div className="text-4xl sm:text-6xl font-bold text-gray-900 mb-2">1,200+</div>
                <div className="text-xs sm:text-sm text-gray-500">등록된 K-스팟</div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="relative rounded-3xl overflow-hidden" style={{ height: '400px' }}>
              <PlaceholderImage
                alt="K-Spot Location"
                className="w-full h-full"
                iconClassName="text-6xl sm:text-7xl"
                label="About 섹션 이미지"
              />
              <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
                <div className="bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium inline-flex items-center gap-2">
                  <i className="ri-map-pin-fill text-red-500"></i>
                  서울 남산타워
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-6 sm:p-8">
                <div className="text-white text-base sm:text-lg font-semibold mb-1">사랑의 불시착 촬영지</div>
                <div className="text-white/80 text-xs sm:text-sm">리정혁과 윤세리의 첫 만남 장소</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
