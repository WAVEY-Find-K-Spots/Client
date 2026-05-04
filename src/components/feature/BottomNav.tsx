import { useLocation } from 'react-router-dom';

export function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { path: '/home', icon: 'ri-home-5-line', activeIcon: 'ri-home-5-fill', label: '홈' },
    { path: '/map', icon: 'ri-map-2-line', activeIcon: 'ri-map-2-fill', label: '지도' },
    { path: '/camera', icon: 'ri-sparkling-line', activeIcon: 'ri-sparkling-fill', label: 'AI', isCenter: true },
    { path: '/favorites', icon: 'ri-heart-line', activeIcon: 'ri-heart-fill', label: '저장' },
    { path: '/profile', icon: 'ri-user-line', activeIcon: 'ri-user-fill', label: 'MY' },
  ];

  const handleNavClick = (path: string) => {
    if (window.REACT_APP_NAVIGATE) {
      window.REACT_APP_NAVIGATE(path);
    }
  };

  return (
    <>
      {/* Bottom Navigation Bar - iOS 홈 인디케이터 위에 배치 */}
      <nav className="fixed bottom-5 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4">
          <div className="flex items-center justify-around h-14 sm:h-16">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`flex flex-col items-center justify-center gap-0.5 sm:gap-1 flex-1 cursor-pointer transition-all ${
                    item.isCenter ? 'relative -mt-5 sm:-mt-6' : ''
                  }`}
                >
                  {item.isCenter ? (
                    <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                      isActive 
                        ? 'bg-gradient-to-br from-teal-400 to-purple-500 scale-110' 
                        : 'bg-gradient-to-br from-teal-300 to-purple-400'
                    }`}>
                      <i className={`${isActive ? item.activeIcon : item.icon} text-2xl sm:text-3xl text-white`}></i>
                    </div>
                  ) : (
                    <>
                      <div className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center ${
                        isActive ? 'text-black' : 'text-gray-400'
                      }`}>
                        <i className={`${isActive ? item.activeIcon : item.icon} text-xl sm:text-2xl`}></i>
                      </div>
                      <span className={`text-[10px] sm:text-xs font-medium ${
                        isActive ? 'text-black' : 'text-gray-400'
                      }`}>
                        {item.label}
                      </span>
                    </>
                  )}
                  {item.isCenter && (
                    <span className={`text-[10px] sm:text-xs font-medium mt-0.5 sm:mt-1 ${
                      isActive ? 'text-black' : 'text-gray-400'
                    }`}>
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
      
      {/* iOS Style Home Indicator - 제일 하단 고정 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white z-50 pb-1 pt-1">
        <div className="flex items-center justify-center h-4">
          <div className="w-28 sm:w-32 h-1 bg-gray-900 rounded-full"></div>
        </div>
      </div>
    </>
  );
}
