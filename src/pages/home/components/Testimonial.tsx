import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlaceholderImage } from '../../../components/base/PlaceholderImage';

const testimonials = [
  {
    id: 1,
    quote: "WAVEY 덕분에 드라마 속 그 카페를 찾았어요! AI 도슨트가 장면 하나하나 설명해줘서 마치 드라마 주인공이 된 기분이었어요. 정말 특별한 경험이었습니다.",
    author: "Sarah Kim",
    label: "사용자 후기 이미지 1",
  },
  {
    id: 2,
    quote: "한국 여행이 처음이었는데 WAVEY가 모든 걸 해결해줬어요. 언어 장벽도 없고, 문화적 배경까지 알려줘서 훨씬 깊이 있는 여행을 할 수 있었습니다.",
    author: "Michael Chen",
    label: "사용자 후기 이미지 2",
  },
  {
    id: 3,
    quote: "K-POP 팬이라면 꼭 써봐야 할 앱! 아이돌들이 다녀간 장소를 실시간으로 추천해주고, 같은 팬들과 정보도 공유할 수 있어서 너무 좋아요.",
    author: "Emma Park",
    label: "사용자 후기 이미지 3",
  },
];

export function Testimonial() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="testimonial" className="py-16 sm:py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 order-2 lg:order-1"
          >
            <div className="relative rounded-3xl overflow-hidden bg-sky-400" style={{ height: '400px' }}>
              <AnimatePresence mode="wait">
                <PlaceholderImage
                  key={currentIndex}
                  alt="User testimonial"
                  className="w-full h-full"
                  iconClassName="text-6xl sm:text-7xl"
                  label={testimonials[currentIndex].label}
                />
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 order-1 lg:order-2"
          >
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">(실제 사용자 후기)</p>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 leading-tight mb-8 sm:mb-12">
                  {testimonials[currentIndex].quote.split('!')[0]}!
                  <span className="text-gray-400"> {testimonials[currentIndex].quote.split('!')[1]}</span>
                </h3>

                <blockquote className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8">
                  "{testimonials[currentIndex].quote}"
                </blockquote>

                <p className="text-sm sm:text-base font-bold text-gray-900">
                  — {testimonials[currentIndex].author}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-4 mt-8 sm:mt-12">
              <button 
                onClick={handlePrev}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-400 hover:border-gray-400 transition-colors cursor-pointer"
              >
                <i className="ri-arrow-left-line text-lg sm:text-xl"></i>
              </button>
              <button 
                onClick={handleNext}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <i className="ri-arrow-right-line text-lg sm:text-xl"></i>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
