import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlaceholderImage } from '../../../components/base/PlaceholderImage';

const features = [
  {
    id: 1,
    title: 'AI 도슨트',
    description: '드라마 속 장면과 문화적 배경을 AI가 실시간으로 설명해드립니다',
    label: 'AI 도슨트 기능 이미지',
  },
  {
    id: 2,
    title: '실시간 루트 추천',
    description: '당신의 취향과 위치를 분석해 최적의 여행 경로를 제안합니다',
    label: '루트 추천 기능 이미지',
  },
  {
    id: 3,
    title: '문화 컨텍스트',
    description: 'K-콘텐츠 속 장소의 숨겨진 이야기와 의미를 깊이 있게 전달합니다',
    label: '문화 컨텍스트 기능 이미지',
  },
];

export function Features() {
  const [expandedId, setExpandedId] = useState(1);

  return (
    <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 mb-4">
            WAVEY가 제공하는 특별한 경험 🌊
          </h2>
          <div className="h-0.5 w-32 bg-gradient-to-r from-primary-500 to-accent-500"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setExpandedId(feature.id)}
              onClick={() => setExpandedId(feature.id)}
              className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500"
              style={{ height: '400px' }}
            >
              <PlaceholderImage
                alt={feature.title}
                className="w-full h-full"
                iconClassName="text-5xl sm:text-6xl"
                label={feature.label}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <h3 className="text-white text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ 
                    opacity: expandedId === feature.id ? 1 : 0,
                    height: expandedId === feature.id ? 'auto' : 0
                  }}
                  className="text-white/90 text-sm leading-relaxed"
                >
                  {feature.description}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
