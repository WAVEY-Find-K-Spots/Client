
export function StatusBar() {
  return (
    <div className="fixed top-0 left-0 right-0 h-11 bg-white z-[60] flex items-center justify-between px-4 sm:px-6">
      <span className="text-gray-900 text-xs sm:text-sm font-semibold">9:41</span>
      <div className="flex items-center gap-1">
        <i className="ri-signal-wifi-fill text-gray-900 text-xs sm:text-sm"></i>
        <i className="ri-wifi-fill text-gray-900 text-xs sm:text-sm"></i>
        <i className="ri-battery-fill text-gray-900 text-xs sm:text-sm"></i>
      </div>
    </div>
  );
}
