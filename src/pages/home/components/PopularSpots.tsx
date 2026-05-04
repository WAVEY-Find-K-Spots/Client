import { motion } from 'framer-motion';
import { PlaceholderImage } from '../../../components/base/PlaceholderImage';

const spots = [
  {
    id: 1,
    name: '경복궁',
    visitors: '125,430',
    featured: true,
  },
  {
    id: 2,
    name: '북촌 한옥마을',
    visitors: '98,250',
    featured: false,
  },
  {
    id: 3,
    name: '홍대 거리',
    visitors: '156,890',
    featured: false,
  },
];

export function PopularSpots() {
  return (
    <section id="spots" className="py-16 sm:py-24 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 sm:mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light text-gray-900 mb-3">지금 가장 핫한 K-Spot</h2>
          <p className="text-gray-500 text-xs sm:text-sm font-light">실시간 업데이트되는 인기 장소</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {spots.map((spot, index) => (
            <motion.div
              key={spot.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
            >
              <div className="w-full h-64 sm:h-80 overflow-hidden">
                <PlaceholderImage
                  alt={spot.name}
                  className="w-full h-full hover:scale-105 transition-transform duration-500"
                  iconClassName="text-4xl sm:text-5xl"
                  label={spot.name}
                />
              </div>
              
              <div className="p-6 sm:p-8 text-center">
                <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 sm:mb-3">{spot.name}</h3>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">{spot.visitors}</div>
                
                <button className={`w-4/5 mx-auto py-2.5 sm:py-3 rounded-full text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  spot.featured 
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'bg-white text-black border-2 border-black hover:bg-gray-50'
                }`}>
                  자세히 보기
                </button>
                
                <p className="text-xs text-gray-400 mt-3 sm:mt-4">AI 추천 루트 포함</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
