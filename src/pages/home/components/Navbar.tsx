import { useState, useEffect } from 'react';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && window.REACT_APP_NAVIGATE) {
      window.REACT_APP_NAVIGATE('/map');
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav
        className={`fixed top-11 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="px-4 sm:px-5 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src="https://storage.readdy-site.link/project_files/ccd854ae-90cb-4f48-9b8a-ca522ef22380/9876795d-6272-4a37-9c1f-d7ff3f6dd57c_KakaoTalk_Photo_2026-01-16-15-39-29.png?v=4909a40483665c6ab29e5cce0fd83cd4"
              alt="WAVEY"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain"
            />
            <span className={`text-lg sm:text-xl font-extrabold tracking-tight ${isScrolled ? 'text-gray-900' : 'text-gray-900'}`}>
              WAVEY
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-700 cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <i className="ri-search-line text-lg sm:text-xl w-5 h-5 flex items-center justify-center" />
            </button>
            <button
              onClick={() => window.REACT_APP_NAVIGATE?.('/notifications')}
              className="relative w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <i className="ri-notification-3-line text-gray-700 text-lg sm:text-xl w-5 h-5 flex items-center justify-center" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </div>
      </nav>

      {/* Search Overlay */}
      {showSearch && (
        <div className="fixed inset-0 z-[100] bg-black/40" onClick={() => setShowSearch(false)}>
          <div
            className="absolute top-0 left-0 right-0 bg-white pt-16 pb-5 px-4 shadow-xl rounded-b-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSearch(false)}
                className="w-10 h-10 flex items-center justify-center cursor-pointer flex-shrink-0"
              >
                <i className="ri-arrow-left-line text-xl text-gray-700 w-5 h-5 flex items-center justify-center" />
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="K-스팟, 코스 검색..."
                  className="w-full h-12 pl-12 pr-4 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                />
                <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg w-5 h-5 flex items-center justify-center" />
              </div>
            </form>

            {/* Quick Tags */}
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2.5 font-bold uppercase tracking-wider">인기 검색어</p>
              <div className="flex flex-wrap gap-2">
                {['경복궁', '드라마 촬영지', '홍대', '아이돌 명소', '한국 음식', '카페'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => { setSearchQuery(tag); }}
                    className="px-3.5 py-2 bg-gray-100 rounded-xl text-xs text-gray-700 hover:bg-gray-200 cursor-pointer whitespace-nowrap font-medium transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
