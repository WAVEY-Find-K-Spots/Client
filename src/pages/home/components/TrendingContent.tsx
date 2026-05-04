import { motion } from 'framer-motion';
import { PlaceholderImage } from '../../../components/base/PlaceholderImage';

const contents = [
  {
    id: 1,
    type: '드라마',
    titleKo: '사랑의 불시착',
    description: '리정혁과 윤세리의 로맨틱 촬영지',
    color: '#ec4899',
    spots: 8,
  },
  {
    id: 2,
    type: 'K-POP',
    titleKo: 'BTS 뮤직비디오',
    description: '뮤직비디오 속 아이코닉 장소',
    color: '#14b8a6',
    spots: 12,
  },
  {
    id: 3,
    type: '영화',
    titleKo: '기생충',
    description: '아카데미 수상작 촬영지',
    color: '#f59e0b',
    spots: 6,
  },
];

export function TrendingContent() {
  const handleContentClick = (contentId: number) => {
    if (window.REACT_APP_NAVIGATE) {
      window.scrollTo(0, 0);
      window.REACT_APP_NAVIGATE(`/content-detail/${contentId}`);
    }
  };

  return (
    <section className="py-5 sm:py-8 px-4 sm:px-5">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-4 sm:mb-5"
      >
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">인기 콘텐츠</h2>
        <p className="text-xs text-gray-500 mt-0.5">K-콘텐츠 촬영지와 스팟을 한눈에</p>
      </motion.div>

      {/* List */}
      <div className="space-y-3 sm:space-y-4">
        {contents.map((content, index) => (
          <motion.div
            key={content.id}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.08 }}
            onClick={() => handleContentClick(content.id)}
            className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
          >
            <div className="flex">
              {/* Thumbnail */}
              <div className="relative w-28 sm:w-36 h-28 sm:h-36 flex-shrink-0 overflow-hidden">
                <PlaceholderImage
                  alt={content.titleKo}
                  className="w-full h-full"
                  iconClassName="text-2xl opacity-25"
                  label={content.titleKo}
                />
                {/* Type badge */}
                <div
                  className="absolute top-2.5 left-2.5 px-2 py-1 rounded-lg flex items-center gap-1"
                  style={{ backgroundColor: `${content.color}18` }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: content.color }}
                  />
                  <span className="text-[10px] font-bold" style={{ color: content.color }}>
                    {content.type}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 p-3.5 sm:p-5 flex flex-col justify-center min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1 mb-1">
                  {content.titleKo}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1 mb-3">{content.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-teal-600">
                    <i className="ri-map-pin-line text-xs w-3 h-3 flex items-center justify-center" />
                    <span className="text-[11px] font-bold">{content.spots}개 장소</span>
                  </div>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${content.color}12` }}
                  >
                    <i
                      className="ri-arrow-right-s-line text-sm w-4 h-4 flex items-center justify-center"
                      style={{ color: content.color }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
