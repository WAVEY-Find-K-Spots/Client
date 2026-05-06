import { BrowserRouter } from 'react-router-dom';
import { Suspense } from 'react';
import { AppRoutes } from './router';
import { useEffect } from 'react';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-[3px] border-teal-100 border-t-teal-500 rounded-full animate-spin mb-3" />
      <span className="text-sm text-gray-400 font-medium">로딩 중...</span>
    </div>
  );
}

function App() {
  useEffect(() => {
    // Check if user should see splash screen
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPath = window.location.pathname;

    // Redirect logic
    if (currentPath === '/' || currentPath === __BASE_PATH__) {
      if (!hasSeenOnboarding) {
        if (window.REACT_APP_NAVIGATE) {
          window.REACT_APP_NAVIGATE('/');
        }
      } else if (!isLoggedIn) {
        if (window.REACT_APP_NAVIGATE) {
          window.REACT_APP_NAVIGATE('/login');
        }
      }
    }
  }, []);

  return (
    <BrowserRouter basename={__BASE_PATH__}>
      <Suspense fallback={<LoadingFallback />}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
