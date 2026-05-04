import { PlaceholderImage } from '../../components/base/PlaceholderImage';

export default function LoginPage() {
  const handleGoogleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    if (window.REACT_APP_NAVIGATE) {
      window.REACT_APP_NAVIGATE('/home');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Status Bar */}
      <div className="h-11 bg-transparent flex items-center justify-between px-6">
        <span className="text-gray-900 text-sm font-semibold">9:41</span>
        <div className="flex items-center gap-1">
          <i className="ri-signal-wifi-fill text-gray-900 text-sm"></i>
          <i className="ri-wifi-fill text-gray-900 text-sm"></i>
          <i className="ri-battery-fill text-gray-900 text-sm"></i>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Logo - Larger size */}
        <div className="mb-8">
          <PlaceholderImage
            alt="WAVEY Logo"
            className="h-20 w-20 mx-auto"
            iconClassName="text-4xl"
            label="앱 로고"
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Welcome to WAVEY
        </h1>
        <p className="text-sm text-gray-500 mb-12 text-center">
          Your K-Culture Guide
        </p>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full max-w-sm py-4 bg-white border-2 border-gray-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap shadow-sm"
        >
          <i className="ri-google-fill text-xl text-red-500"></i>
          <span className="text-base font-semibold text-gray-900">Continue with Google</span>
        </button>

        {/* Terms */}
        <p className="text-xs text-gray-400 mt-8 text-center max-w-sm">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>

      {/* Home Indicator */}
      <div className="pb-2 flex justify-center">
        <div className="w-32 h-1 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
}