import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { BottomNav } from '../../components/feature/BottomNav';
import { StatusBar } from '../../components/feature/StatusBar';
import { PlaceholderImage } from '../../components/base/PlaceholderImage';

const initialStamps = [
  { id: 1, name: 'Gyeongbokgung', nameKo: '경복궁', collected: true, date: '2024.01.15', category: 'kheritage', lat: 37.5796, lng: 126.9770, address: '서울특별시 종로구 사직로 161', visitRecords: [{ date: '2024.01.15', time: '14:32', lat: 37.5797, lng: 126.9771, accuracy: 12 }] },
  { id: 2, name: 'N Seoul Tower', nameKo: 'N서울타워', collected: true, date: '2024.01.16', category: 'kheritage', lat: 37.5511, lng: 126.9882, address: '서울특별시 용산구 남산공원길 105', visitRecords: [{ date: '2024.01.16', time: '11:15', lat: 37.5510, lng: 126.9883, accuracy: 8 }] },
  { id: 3, name: 'Bukchon Hanok', nameKo: '북촌한옥마을', collected: true, date: '2024.01.17', category: 'kheritage', lat: 37.5826, lng: 126.9830, address: '서울특별시 종로구 계동길 37', visitRecords: [{ date: '2024.01.17', time: '16:45', lat: 37.5825, lng: 126.9831, accuracy: 15 }] },
  { id: 4, name: 'Namsan Tower Cafe', nameKo: '남산타워 카페', collected: true, date: '2024.01.18', category: 'kdrama', lat: 37.5511, lng: 126.9882, address: '서울특별시 용산구 남산공원길 105', visitRecords: [{ date: '2024.01.18', time: '10:20', lat: 37.5512, lng: 126.9881, accuracy: 10 }] },
  { id: 5, name: 'Gangnam Station', nameKo: '강남역', collected: true, date: '2024.01.19', category: 'kpop', lat: 37.4980, lng: 127.0276, address: '서울특별시 강남구 강남대로 396', visitRecords: [{ date: '2024.01.19', time: '18:00', lat: 37.4981, lng: 127.0275, accuracy: 7 }] },
  { id: 6, name: 'Busan Cinema Street', nameKo: '부산 영화의 거리', collected: true, date: '2024.01.20', category: 'kmovie', lat: 35.1595, lng: 129.1606, address: '부산광역시 해운대구 중동', visitRecords: [{ date: '2024.01.20', time: '13:50', lat: 35.1596, lng: 129.1605, accuracy: 11 }] },
  { id: 7, name: 'Hongdae', nameKo: '홍대', collected: false, date: null, category: 'kpop', lat: 37.5563, lng: 126.9230, address: '서울특별시 마포구 홍익로' },
  { id: 8, name: 'Myeongdong', nameKo: '명동', collected: false, date: null, category: 'kdrama', lat: 37.5637, lng: 126.9820, address: '서울특별시 중구 명동길' },
  { id: 9, name: 'Gangnam', nameKo: '강남', collected: false, date: null, category: 'kpop', lat: 37.4979, lng: 127.0276, address: '서울특별시 강남구 강남대로' },
  { id: 10, name: 'Changdeokgung', nameKo: '창덕궁', collected: false, date: null, category: 'kheritage', lat: 37.5794, lng: 126.9910, address: '서울특별시 종로구 율곡로 99' },
  { id: 11, name: 'Haeundae Beach', nameKo: '해운대 해수욕장', collected: false, date: null, category: 'kmovie', lat: 35.1587, lng: 129.1604, address: '부산광역시 해운대구 해운대해변로' },
  { id: 12, name: 'DDP', nameKo: '동대문DDP', collected: false, date: null, category: 'kdrama', lat: 37.5669, lng: 127.0095, address: '서울특별시 중구 을지로 281' },
];

const menuItems = [
  { icon: 'ri-user-settings-line', label: '계정 설정', subLabel: 'Account Settings', page: 'account' },
  { icon: 'ri-notification-line', label: '알림 설정', subLabel: 'Notifications', page: 'notifications' },
  { icon: 'ri-global-line', label: '언어 설정', subLabel: 'Language', page: 'language' },
  { icon: 'ri-question-line', label: '도움말', subLabel: 'Help & Support', page: 'help' },
  { icon: 'ri-information-line', label: '앱 정보', subLabel: 'About App', page: 'about' },
];

const filterCategories = [
  { id: 'all', label: '전체', icon: 'ri-grid-line' },
  { id: 'kdrama', label: 'K-DRAMA', icon: 'ri-tv-line' },
  { id: 'kmovie', label: 'K-MOVIE', icon: 'ri-movie-line' },
  { id: 'kpop', label: 'K-POP', icon: 'ri-music-line' },
  { id: 'kheritage', label: 'K-HERITAGE', icon: 'ri-building-line' },
];

const CATEGORY_STYLES: Record<string, {
  gradient: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
  pattern: string;
  stampIcon: string;
}> = {
  kdrama: {
    gradient: 'from-rose-500 via-rose-600 to-rose-800',
    icon: 'ri-tv-line',
    badgeBg: 'bg-rose-300/30',
    badgeText: 'text-rose-100',
    pattern: 'repeating-linear-gradient(135deg, transparent, transparent 8px, rgba(255,255,255,0.05) 8px, rgba(255,255,255,0.05) 16px)',
    stampIcon: 'ri-tv-line',
  },
  kmovie: {
    gradient: 'from-indigo-600 via-indigo-700 to-slate-900',
    icon: 'ri-movie-line',
    badgeBg: 'bg-indigo-300/30',
    badgeText: 'text-indigo-100',
    pattern: 'repeating-linear-gradient(0deg, transparent, transparent 6px, rgba(255,255,255,0.04) 6px, rgba(255,255,255,0.04) 12px)',
    stampIcon: 'ri-movie-line',
  },
  kpop: {
    gradient: 'from-fuchsia-500 via-fuchsia-600 to-purple-800',
    icon: 'ri-music-line',
    badgeBg: 'bg-fuchsia-300/30',
    badgeText: 'text-fuchsia-100',
    pattern: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.06) 2px, transparent 2px), radial-gradient(circle at 70% 70%, rgba(255,255,255,0.06) 2px, transparent 2px)',
    stampIcon: 'ri-mic-line',
  },
  kheritage: {
    gradient: 'from-amber-500 via-amber-600 to-orange-800',
    icon: 'ri-building-line',
    badgeBg: 'bg-amber-300/30',
    badgeText: 'text-amber-100',
    pattern: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)',
    stampIcon: 'ri-building-line',
  },
};

const faqItems = [
  { q: '스탬프는 어떻게 수집하나요?', a: '장소를 방문하고 사진을 촬영하여 방문을 인증하세요. 스탬프가 자동으로 여권에 추가됩니다.' },
  { q: '오프라인에서도 사용할 수 있나요?', a: '네, 저장한 장소와 루트는 오프라인에서도 볼 수 있어요. 다만 실시간 기능은 인터넷 연결이 필요합니다.' },
  { q: '지오펜싱은 어떻게 작동하나요?', a: 'K-Spot 주변에 접근하면 알림을 받습니다. 위치 서비스가 켜져 있는지 확인하세요.' },
  { q: '커스텀 루트를 만들 수 있나요?', a: '네! 찜 탭에서 "새 루트 만들기"를 눌러 나만의 K-컬처 투어를 만들 수 있어요.' },
  { q: '여권을 공유하려면 어떻게 하나요?', a: '여권 페이지의 공유 버튼을 눌러 수집한 스탬프의 공유 이미지를 생성하세요.' },
  { q: 'AI 번역기가 정확한가요?', a: 'AI 번역기는 고급 언어 모델을 사용해 높은 정확도를 제공합니다. 선명한 텍스트와 이미지에서 가장 잘 작동해요.' },
  { q: '잘못된 정보를 신고하려면?', a: '도움말 > 버그 신고를 통해 부정확한 정보를 알려주세요.' },
  { q: '새 K-Spot을 제안할 수 있나요?', a: '네! 피드백 양식을 통해 추가되었으면 하는 장소를 제안해주세요.' },
  { q: '계정을 삭제하려면?', a: '계정 설정에서 하단으로 스크롤하면 "계정 삭제" 옵션이 있습니다.' },
  { q: '내 데이터는 안전한가요?', a: '네, 개인정보 보호를 위해 업계 표준 암호화를 사용하고 있어요.' },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'passport' | 'settings'>('passport');
  const [stamps, setStamps] = useState(initialStamps);
  const [selectedStamp, setSelectedStamp] = useState<typeof initialStamps[0] | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [currentSettingsPage, setCurrentSettingsPage] = useState<string | null>(null);
  const [helpSubPage, setHelpSubPage] = useState<string | null>(null);
  const [accountSubPage, setAccountSubPage] = useState<string | null>(null);
  const [aboutSubPage, setAboutSubPage] = useState<string | null>(null);
  const [showStampAnimation, setShowStampAnimation] = useState(false);
  const [pendingStamp, setPendingStamp] = useState<typeof initialStamps[0] | null>(null);
  const [newlyCollectedStamp, setNewlyCollectedStamp] = useState<typeof initialStamps[0] | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Passport capture & share
  const passportRef = useRef<HTMLDivElement>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureSuccess, setCaptureSuccess] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  // Camera & Verification states
  const [showCameraView, setShowCameraView] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showGeofenceNotification, setShowGeofenceNotification] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Settings states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  // Privacy states
  const [profilePublic, setProfilePublic] = useState(true);
  const [stampShare, setStampShare] = useState(true);
  const [locationHistory, setLocationHistory] = useState(false);

  // Form states
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, feedback: '' });
  const [bugForm, setBugForm] = useState({ title: '', description: '', steps: '' });
  const [profileForm, setProfileForm] = useState({ name: 'Guest User', email: 'guest@example.com', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [newEmail, setNewEmail] = useState('');

  const filteredStamps = selectedFilter === 'all' ? stamps : stamps.filter(s => s.category === selectedFilter);
  const collectedCount = stamps.filter(s => s.collected).length;
  const progressPercent = (collectedCount / stamps.length) * 100;

  const collectedStamps = stamps
    .filter(s => s.collected)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const handleStampClick = (stamp: typeof stamps[0]) => {
    if (stamp.collected) {
      setSelectedStamp(stamp);
    }
  };

  const handleMenuClick = (page: string) => {
    setCurrentSettingsPage(page);
    setHelpSubPage(null);
    setAccountSubPage(null);
    setAboutSubPage(null);
  };

  const handleBack = () => {
    if (helpSubPage) {
      setHelpSubPage(null);
    } else if (accountSubPage) {
      setAccountSubPage(null);
    } else if (aboutSubPage) {
      setAboutSubPage(null);
    } else {
      setCurrentSettingsPage(null);
    }
  };

  const simulateGeofenceAlert = () => {
    const uncollectedStamp = stamps.find(s => !s.collected);
    if (uncollectedStamp) {
      setPendingStamp(uncollectedStamp);
    }
  };

  // 스탬프 수집 함수 (위치 기반 기록 포함)
  const collectStamp = (stampToCollect: typeof initialStamps[0]) => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
    const timeStr = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

    const applyCollection = (visitRecord: { date: string; time: string; lat: number; lng: number; accuracy?: number }) => {
      setStamps(prevStamps =>
        prevStamps.map(stamp =>
          stamp.id === stampToCollect.id
            ? { ...stamp, collected: true, date: dateStr, visitRecords: [...(stamp.visitRecords || []), visitRecord] }
            : stamp
        )
      );
      setNewlyCollectedStamp({ ...stampToCollect, collected: true, date: dateStr, visitRecords: [...(stampToCollect.visitRecords || []), visitRecord] });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          applyCollection({
            date: dateStr,
            time: timeStr,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
          });
        },
        () => {
          applyCollection({
            date: dateStr,
            time: timeStr,
            lat: stampToCollect.lat ?? 37.5665,
            lng: stampToCollect.lng ?? 126.9780,
          });
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      applyCollection({
        date: dateStr,
        time: timeStr,
        lat: stampToCollect.lat ?? 37.5665,
        lng: stampToCollect.lng ?? 126.9780,
      });
    }
  };

  const handleVerifyPhoto = () => {
    handleCloseCamera();
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      setShowStampAnimation(true);

      if (pendingStamp) {
        collectStamp(pendingStamp);
      }

      setTimeout(() => {
        setShowStampAnimation(false);
        setPendingStamp(null);
        setNewlyCollectedStamp(null);
      }, 3000);
    }, 2000);
  };

  const handleOpenCamera = async () => {
    setShowGeofenceNotification(false);
    setShowCameraView(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.log('Camera access denied');
    }
  };

  const handleCloseCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraView(false);
  };

  // ── Passport Capture & Share ──
  const handleCapturePassport = useCallback(async () => {
    if (!passportRef.current) return;
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(passportRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL('image/png');
      setShareImageUrl(dataUrl);
      setShowShareModal(true);
    } catch (err) {
      console.error('Capture failed:', err);
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const handleSavePassport = useCallback(() => {
    if (!shareImageUrl) return;
    const link = document.createElement('a');
    link.href = shareImageUrl;
    link.download = `wavey-passport-${profileForm.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCaptureSuccess(true);
    setTimeout(() => setCaptureSuccess(false), 2500);
  }, [shareImageUrl, profileForm.name]);

  const handleSharePassport = useCallback(async () => {
    if (!shareImageUrl) return;
    try {
      const res = await fetch(shareImageUrl);
      const blob = await res.blob();
      const file = new File([blob], 'wavey-passport.png', { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${profileForm.name}'s WAVEY Passport`,
          text: shareMessage || `Check out my K-Culture passport on WAVEY! ${collectedCount}/${stamps.length} stamps collected.`,
        });
      } else {
        await navigator.clipboard.writeText(shareImageUrl);
        setCaptureSuccess(true);
        setTimeout(() => setCaptureSuccess(false), 2500);
      }
    } catch {
      await navigator.clipboard.writeText(shareImageUrl);
      setCaptureSuccess(true);
      setTimeout(() => setCaptureSuccess(false), 2500);
    }
  }, [shareImageUrl, profileForm.name, collectedCount, stamps.length, shareMessage]);

  const handleCloseShare = () => {
    setShowShareModal(false);
    setShareImageUrl(null);
    setShareMessage('');
  };

  const renderHelpSubPage = () => {
    switch (helpSubPage) {
      case 'faq':
        return (
          <div className="space-y-3">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 cursor-pointer"
                >
                  <span className="text-sm font-medium text-gray-900 text-left flex-1 pr-2">{item.q}</span>
                  {expandedFaq === index ? (
                    <i className="ri-arrow-up-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
                  ) : (
                    <i className="ri-arrow-down-s-line text-gray-400 w-4 h-4 flex items-center justify-center"></i>
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-gray-600">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      case 'contact':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value.slice(0, 500) })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent h-32 resize-none"
                placeholder="How can we help you?"
                maxLength={500}
              />
            </div>
            <button className="w-full py-3 bg-teal-500 text-white rounded-full font-semibold text-sm cursor-pointer whitespace-nowrap active:scale-95 transition-transform">
              Send Message
            </button>
          </div>
        );
      case 'feedback':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                    className="cursor-pointer"
                  >
                    {star <= feedbackForm.rating ? (
                      <i className="ri-star-fill text-2xl text-amber-400 w-6 h-6 flex items-center justify-center"></i>
                    ) : (
                      <i className="ri-star-line text-2xl text-gray-300 w-6 h-6 flex items-center justify-center"></i>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Feedback</label>
              <textarea
                value={feedbackForm.feedback}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value.slice(0, 500) })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent h-32 resize-none"
                placeholder="Tell us what you think..."
                maxLength={500}
              />
            </div>
            <button className="w-full py-3 bg-teal-500 text-white rounded-full font-semibold text-sm cursor-pointer whitespace-nowrap active:scale-95 transition-transform">
              Submit Feedback
            </button>
          </div>
        );
      case 'bug':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bug Title</label>
              <input
                type="text"
                value={bugForm.title}
                onChange={(e) => setBugForm({ ...bugForm, title: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Brief description of the bug"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={bugForm.description}
                onChange={(e) => setBugForm({ ...bugForm, description: e.target.value.slice(0, 500) })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent h-24 resize-none"
                placeholder="What happened?"
                maxLength={500}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Steps to Reproduce</label>
              <textarea
                value={bugForm.steps}
                onChange={(e) => setBugForm({ ...bugForm, steps: e.target.value.slice(0, 500) })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent h-24 resize-none"
                placeholder="1. Go to...\n2. Click on...\n3. See error"
                maxLength={500}
              />
            </div>
            <button className="w-full py-3 bg-red-500 text-white rounded-full font-semibold text-sm cursor-pointer whitespace-nowrap active:scale-95 transition-transform">
              Report Bug
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const renderAccountSubPage = () => {
    switch (accountSubPage) {
      case 'profile':
        return (
          <div className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <button className="w-24 h-24 bg-gray-100 rounded-full flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
                  <i className="ri-camera-line text-2xl text-gray-400 mb-1"></i>
                  <span className="text-[10px] text-gray-400">사진 등록</span>
                </button>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center cursor-pointer shadow-md active:scale-90 transition-transform">
                  <i className="ri-camera-line text-white text-sm"></i>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="+82 10-0000-0000"
              />
            </div>
            <button className="w-full py-3 bg-teal-500 text-white rounded-full font-semibold text-sm cursor-pointer whitespace-nowrap active:scale-95 transition-transform">
              변경사항 저장
            </button>
          </div>
        );
      case 'email':
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center mb-2">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-3">
                <i className="ri-mail-line text-3xl text-teal-500 w-8 h-8 flex items-center justify-center"></i>
              </div>
              <p className="text-sm text-gray-500">이메일 주소를 변경하세요</p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <i className="ri-mail-line text-xl text-gray-600"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500">현재 이메일</p>
                <p className="text-sm font-medium text-gray-900">{profileForm.email}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">새 이메일</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="new@email.com"
              />
            </div>
            <button className="w-full py-3 bg-teal-500 text-white rounded-full font-semibold text-sm cursor-pointer whitespace-nowrap active:scale-95 transition-transform">
              이메일 변경
            </button>
          </div>
        );
      case 'password':
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center mb-2">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-3">
                <i className="ri-shield-line text-3xl text-teal-500 w-8 h-8 flex items-center justify-center"></i>
              </div>
              <p className="text-sm text-gray-500">계정 보안을 위해 비밀번호를 변경하세요</p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-2">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <i className="ri-lock-line text-xl text-gray-600"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500">비밀번호 보안</p>
                <p className="text-sm font-medium text-gray-900">마지막 변경: 30일 전</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">현재 비밀번호</label>
              <input
                type="password"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">새 비밀번호</label>
              <input
                type="password"
                value={passwordForm.newPass}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호 확인</label>
              <input
                type="password"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <button className="w-full py-3 bg-teal-500 text-white rounded-full font-semibold text-sm cursor-pointer whitespace-nowrap active:scale-95 transition-transform">
              비밀번호 변경
            </button>
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-3">
            <div className="flex flex-col items-center mb-4">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-3">
                <i className="ri-shield-user-line text-3xl text-teal-500 w-8 h-8 flex items-center justify-center"></i>
              </div>
              <p className="text-sm text-gray-500">개인정보 보호 설정을 관리하세요</p>
            </div>
            {[
              { state: profilePublic, setter: setProfilePublic, icon: 'ri-user-search-line', title: '프로필 공개', sub: '다른 사용자가 내 프로필을 볼 수 있어요' },
              { state: stampShare, setter: setStampShare, icon: 'ri-share-line', title: '스탬프 공유', sub: '수집한 스탬프를 공유할 수 있어요' },
              { state: locationHistory, setter: setLocationHistory, icon: 'ri-map-pin-time-line', title: '방문 기록 저장', sub: '방문한 장소를 기록에 남겨요' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <i className={`${item.icon} text-lg sm:text-xl text-gray-600 w-5 h-5 flex items-center justify-center`}></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">{item.sub}</p>
                  </div>
                </div>
                <button
                  onClick={() => item.setter(!item.state)}
                  className={`w-12 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${item.state ? 'bg-teal-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${item.state ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const renderAboutSubPage = () => {
    switch (aboutSubPage) {
      case 'terms':
        return (
          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Terms of Service</h3>
            <div className="text-sm text-gray-600 space-y-4">
              <p>Welcome to WAVEY. By using our service, you agree to these terms.</p>
              <h4 className="font-semibold text-gray-900">1. Use of Service</h4>
              <p>You must be at least 13 years old to use this service. You are responsible for maintaining the confidentiality of your account.</p>
              <h4 className="font-semibold text-gray-900">2. User Content</h4>
              <p>You retain ownership of content you submit. By posting content, you grant us a license to use, modify, and display it.</p>
              <h4 className="font-semibold text-gray-900">3. Prohibited Activities</h4>
              <p>You may not use the service for illegal purposes, harassment, or to distribute malware.</p>
              <h4 className="font-semibold text-gray-900">4. Termination</h4>
              <p>We may terminate your account for violations of these terms.</p>
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="prose prose-sm max-w-none">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Privacy Policy</h3>
            <div className="text-sm text-gray-600 space-y-4">
              <p>Your privacy is important to us. This policy explains how we collect and use your data.</p>
              <h4 className="font-semibold text-gray-900">Information We Collect</h4>
              <p>We collect information you provide directly, such as account details and location data when using geofencing features.</p>
              <h4 className="font-semibold text-gray-900">How We Use Information</h4>
              <p>We use your information to provide and improve our services, personalize your experience, and communicate with you.</p>
              <h4 className="font-semibold text-gray-900">Data Security</h4>
              <p>We implement industry-standard security measures to protect your personal information.</p>
            </div>
          </div>
        );
      case 'licenses':
        return (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Open Source Licenses</h3>
            {['React', 'Framer Motion', 'Tailwind CSS', 'React Router', 'Remix Icon'].map((lib) => (
              <div key={lib} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-sm font-medium text-gray-900">{lib}</p>
                <p className="text-xs text-gray-500">MIT License</p>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const renderSettingsPage = () => {
    switch (currentSettingsPage) {
      case 'account':
        if (accountSubPage) {
          return renderAccountSubPage();
        }
        return (
          <div className="space-y-2.5 sm:space-y-3">
            {[
              { id: 'profile', icon: 'ri-user-line', label: '프로필 수정', subLabel: 'Edit Profile' },
              { id: 'email', icon: 'ri-mail-line', label: '이메일 변경', subLabel: 'Change Email' },
              { id: 'password', icon: 'ri-lock-line', label: '비밀번호 변경', subLabel: 'Change Password' },
              { id: 'privacy', icon: 'ri-shield-line', label: '개인정보 설정', subLabel: 'Privacy Settings' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setAccountSubPage(item.id)}
                className="w-full flex items-center justify-between p-3.5 sm:p-4 bg-white rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <i className={`${item.icon} text-lg sm:text-xl text-gray-600 w-5 h-5 flex items-center justify-center`}></i>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">{item.subLabel}</p>
                  </div>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-arrow-right-s-line text-gray-400 text-lg sm:text-xl w-4 h-4 flex items-center justify-center" />
                </div>
              </button>
            ))}
            <button className="w-full mt-3 sm:mt-4 py-3 bg-red-50 text-red-600 rounded-full font-semibold text-sm cursor-pointer whitespace-nowrap active:scale-95 transition-transform">
              계정 삭제
            </button>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-3">
            <div className="flex flex-col items-center mb-5">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-3">
                <i className="ri-notification-3-line text-3xl text-teal-500 w-8 h-8 flex items-center justify-center"></i>
              </div>
              <p className="text-sm text-gray-500">알림 설정을 관리하세요</p>
            </div>
            {[
              { state: notificationsEnabled, setter: setNotificationsEnabled, icon: 'ri-notification-3-line', title: '전체 알림', sub: '모든 알림을 켜거나 끌 수 있어요' },
              { state: pushEnabled, setter: setPushEnabled, icon: 'ri-map-pin-line', title: '푸시 알림', sub: '지오펜싱 알림과 업데이트를 받아요' },
              { state: emailEnabled, setter: setEmailEnabled, icon: 'ri-mail-send-line', title: '이메일 알림', sub: '주간 요약과 업데이트를 이메일로 받아요' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <i className={`${item.icon} text-lg sm:text-xl text-gray-600 w-5 h-5 flex items-center justify-center`}></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">{item.sub}</p>
                  </div>
                </div>
                <button
                  onClick={() => item.setter(!item.state)}
                  className={`w-12 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${item.state ? 'bg-teal-500' : 'bg-gray-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${item.state ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
            ))}
          </div>
        );
      case 'language':
        return (
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex flex-col items-center mb-5">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-3">
                <i className="ri-global-line text-3xl text-teal-500 w-8 h-8 flex items-center justify-center"></i>
              </div>
              <p className="text-sm text-gray-500">사용할 언어를 선택하세요</p>
            </div>
            {[
              { code: 'en', label: 'English', native: 'English', icon: 'ri-english-input' },
              { code: 'ko', label: 'Korean', native: '한국어', icon: 'ri-translate' },
              { code: 'ja', label: 'Japanese', native: '日本語', icon: 'ri-character-recognition-line' },
              { code: 'zh', label: 'Chinese', native: '中文', icon: 'ri-input-method-line' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all active:scale-[0.98] ${
                  selectedLanguage === lang.code ? 'bg-teal-50 border-2 border-teal-500 shadow-sm' : 'bg-white border border-gray-100 shadow-sm hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${selectedLanguage === lang.code ? 'bg-teal-100' : 'bg-gray-100'}`}>
                    <i className={`${lang.icon} text-lg sm:text-xl ${selectedLanguage === lang.code ? 'text-teal-600' : 'text-gray-600'} w-5 h-5 flex items-center justify-center`}></i>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{lang.label}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">{lang.native}</p>
                  </div>
                </div>
                {selectedLanguage === lang.code && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-check-line text-white text-lg w-4 h-4 flex items-center justify-center"></i>
                  </div>
                )}
              </button>
            ))}
          </div>
        );
      case 'help':
        if (helpSubPage) {
          return renderHelpSubPage();
        }
        return (
          <div className="space-y-2.5 sm:space-y-3">
            <div className="flex flex-col items-center mb-5">
              <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-3">
                <i className="ri-customer-service-line text-3xl text-teal-500 w-8 h-8 flex items-center justify-center"></i>
              </div>
              <p className="text-sm text-gray-500">무엇을 도와드릴까요?</p>
            </div>
            {[
              { id: 'faq', icon: 'ri-question-answer-line', label: '자주 묻는 질문', subLabel: 'FAQ' },
              { id: 'contact', icon: 'ri-customer-service-line', label: '문의하기', subLabel: 'Contact Us' },
              { id: 'feedback', icon: 'ri-feedback-line', label: '피드백 보내기', subLabel: 'Send Feedback' },
              { id: 'bug', icon: 'ri-bug-line', label: '버그 신고', subLabel: 'Report a Bug' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setHelpSubPage(item.id)}
                className="w-full flex items-center justify-between p-3.5 sm:p-4 bg-white rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <i className={`${item.icon} text-lg sm:text-xl text-gray-600 w-5 h-5 flex items-center justify-center`}></i>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">{item.subLabel}</p>
                  </div>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-arrow-right-s-line text-gray-400 text-lg sm:text-xl w-4 h-4 flex items-center justify-center" />
                </div>
              </button>
            ))}
          </div>
        );
      case 'about':
        if (aboutSubPage) {
          return renderAboutSubPage();
        }
        return (
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-teal-50 flex items-center justify-center">
                <i className="ri-apps-line text-3xl text-teal-500 w-8 h-8 flex items-center justify-center"></i>
              </div>
              <h2 className="text-2xl font-black text-gray-900">WAVEY</h2>
              <p className="text-sm text-gray-500 mt-1">버전 1.0.0</p>
            </div>
            <div className="space-y-2.5 sm:space-y-3">
              {[
                { id: 'terms', icon: 'ri-file-text-line', label: '이용약관', subLabel: 'Terms of Service' },
                { id: 'privacy', icon: 'ri-shield-check-line', label: '개인정보처리방침', subLabel: 'Privacy Policy' },
                { id: 'licenses', icon: 'ri-code-box-line', label: '오픈소스 라이선스', subLabel: 'Open Source Licenses' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setAboutSubPage(item.id)}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4 bg-white rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <i className={`${item.icon} text-lg sm:text-xl text-gray-600 w-5 h-5 flex items-center justify-center`}></i>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">{item.label}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">{item.subLabel}</p>
                    </div>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-arrow-right-s-line text-gray-400 text-lg sm:text-xl w-4 h-4 flex items-center justify-center" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Geofence notification simulation (auto trigger after 3 seconds on page load)
  useEffect(() => {
    const timer = setTimeout(() => {
      const uncollectedStamp = stamps.find(s => !s.collected);
      if (uncollectedStamp && activeTab === 'passport') {
        setPendingStamp(uncollectedStamp);
        setShowGeofenceNotification(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [activeTab, stamps]);

  return (
    <div className="min-h-screen bg-gray-100 pb-28">
      <StatusBar />

      {/* Header */}
      <div className="bg-white px-4 pt-14 pb-4">
        {currentSettingsPage ? (
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer"
            >
              <i className="ri-arrow-left-line text-xl text-gray-700"></i>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {currentSettingsPage === 'account' && (accountSubPage ?
                  { profile: '프로필 수정', email: '이메일 변경', password: '비밀번호 변경', privacy: '개인정보' }[accountSubPage] : '계정 설정')}
                {currentSettingsPage === 'notifications' && '알림 설정'}
                {currentSettingsPage === 'language' && '언어 설정'}
                {currentSettingsPage === 'help' && (helpSubPage ?
                  { faq: '자주 묻는 질문', contact: '문의하기', feedback: '피드백 보내기', bug: '버그 신고' }[helpSubPage] : '도움말')}
                {currentSettingsPage === 'about' && (aboutSubPage ?
                  { terms: '이용약관', privacy: '개인정보처리방침', licenses: '라이선스' }[aboutSubPage] : '앱 정보')}
              </h1>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">내 프로필</h1>
                <p className="text-sm text-gray-500">나의 여행 기록</p>
              </div>
              {activeTab === 'passport' && (
                <button
                  onClick={handleCapturePassport}
                  disabled={isCapturing}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap active:scale-95 transition-transform disabled:opacity-60"
                >
                  {isCapturing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                      />
                      캡처 중
                    </>
                  ) : (
                    <>
                      <i className="ri-share-forward-line text-sm w-4 h-4 flex items-center justify-center"></i>
                      공유
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Tab Toggle */}
            <div className="flex bg-gray-100 rounded-full p-1 mt-4">
              <button
                onClick={() => setActiveTab('passport')}
                className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'passport' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                여권
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'settings' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                설정
              </button>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="px-4 py-6">
        {currentSettingsPage ? (
          renderSettingsPage()
        ) : activeTab === 'passport' ? (
          <>
            {/* Passport Card — capture target */}
            <div
              ref={passportRef}
              className="relative bg-gradient-to-br from-[#1a3a5c] to-[#0d2137] rounded-2xl p-6 mb-6 overflow-hidden shadow-xl"
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)`
                }}></div>
              </div>

              {/* 상단 - 대한민국 국장 아이콘 */}
              <div className="flex flex-col items-center mb-4 relative z-10">
                <div className="w-16 h-16 mb-3 bg-white/10 rounded-full flex items-center justify-center">
                  <i className="ri-government-line text-3xl text-amber-300 w-8 h-8 flex items-center justify-center"></i>
                </div>
                <p className="text-amber-300 text-xs font-semibold tracking-[0.15em] mb-0.5">REPUBLIC OF KOREA</p>
                <p className="text-amber-300/60 text-[9px] tracking-wider">대한민국</p>
              </div>

              {/* 여권 타이틀 */}
              <div className="text-center mb-6 relative z-10">
                <h2 className="text-white text-sm font-bold tracking-[0.25em] mb-1">PASSPORT</h2>
                <p className="text-white/50 text-[9px] tracking-wider">여 권</p>
              </div>

              {/* 프로필 영역 */}
              <div className="flex gap-4 mb-4 relative z-10">
                <button className="w-20 h-24 rounded-md bg-white/10 border-2 border-dashed border-white/30 flex flex-col items-center justify-center cursor-pointer hover:bg-white/15 transition-colors">
                  <i className="ri-camera-line text-xl text-white/60 mb-1"></i>
                  <span className="text-[9px] text-white/50">사진 등록</span>
                </button>
                <div className="flex-1 text-white">
                  <div className="mb-2">
                    <p className="text-[9px] text-white/50">NAME / 성명</p>
                    <p className="text-sm font-semibold">{profileForm.name}</p>
                  </div>
                  <div className="mb-2">
                    <p className="text-[9px] text-white/50">NATIONALITY / 국적</p>
                    <p className="text-sm font-semibold">KOREA</p>
                  </div>
                </div>
              </div>

              {/* 스탬프 진행 바 */}
              <div className="relative z-10 bg-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] text-white/50 uppercase tracking-wider">스탬프 진행률</p>
                  <p className="text-xs font-bold text-amber-300">{collectedCount}/{stamps.length}</p>
                </div>

                <div className="relative h-3 bg-white/20 rounded-full overflow-hidden mb-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-amber-300 rounded-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <i className="ri-medal-line text-amber-300 text-sm"></i>
                    <span className="text-xs text-white/70">
                      {collectedCount < 3 ? '입문자' : collectedCount < 6 ? '탐험가' : collectedCount < 9 ? '모험가' : '마스터'}
                    </span>
                  </div>
                  <span className="text-xs text-white/50">
                    다음 레벨까지 {stamps.length - collectedCount}개
                  </span>
                </div>
              </div>
            </div>

            {/* Filter Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
              {filterCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedFilter(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    selectedFilter === cat.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-600 border border-gray-200'
                  }`}
                >
                  <i className={cat.icon}></i>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Recent Visit Timeline */}
            {collectedStamps.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-900">최근 방문 기록</h3>
                  <span className="text-[10px] text-gray-400">{collectedStamps.length}개 수집</span>
                </div>
                <div className="space-y-3">
                  {collectedStamps.slice(0, 3).map((stamp, idx) => {
                    const style = CATEGORY_STYLES[stamp.category] || CATEGORY_STYLES.kheritage;
                    const lastVisit = stamp.visitRecords && stamp.visitRecords.length > 0
                      ? stamp.visitRecords[stamp.visitRecords.length - 1]
                      : null;
                    return (
                      <div key={stamp.id} className="flex gap-3 items-start">
                        <div className="flex flex-col items-center pt-1">
                          <div className={`w-3 h-3 rounded-full ${idx === 0 ? `bg-gradient-to-br ${style.gradient}` : 'bg-gray-300'} flex items-center justify-center`}>
                            {idx === 0 && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                          </div>
                          {idx < 2 && <div className="w-px flex-1 bg-gray-200 min-h-[20px]"></div>}
                        </div>
                        <div className="flex-1 bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
                                <i className={`${style.stampIcon} text-[10px] text-white w-3 h-3 flex items-center justify-center`}></i>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{stamp.nameKo}</span>
                            </div>
                            <span className="text-[10px] text-gray-400">{stamp.date}</span>
                          </div>
                          {lastVisit && (
                            <p className="text-[10px] text-gray-500 flex items-center gap-1">
                              <i className="ri-time-line text-gray-400 w-3 h-3 flex items-center justify-center"></i>
                              {lastVisit.time}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stamps Grid */}
            <div className="grid grid-cols-3 gap-3">
              {filteredStamps.map((stamp) => {
                const style = CATEGORY_STYLES[stamp.category] || CATEGORY_STYLES.kheritage;
                const lastVisit = stamp.visitRecords && stamp.visitRecords.length > 0
                  ? stamp.visitRecords[stamp.visitRecords.length - 1]
                  : null;
                return (
                  <motion.button
                    key={stamp.id}
                    onClick={() => handleStampClick(stamp)}
                    whileHover={{ scale: stamp.collected ? 1.05 : 1 }}
                    whileTap={{ scale: stamp.collected ? 0.95 : 1 }}
                    className={`aspect-square rounded-xl overflow-hidden relative cursor-pointer ${stamp.collected ? '' : 'opacity-40'}`}
                  >
                    {stamp.collected ? (
                      <div className={`w-full h-full bg-gradient-to-br ${style.gradient} flex flex-col items-center justify-center p-2 relative`}>
                        {/* pattern overlay */}
                        <div className="absolute inset-0 pointer-events-none" style={{ background: style.pattern }} />
                        {/* category badge */}
                        <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-md ${style.badgeBg} ${style.badgeText} text-[8px] font-bold tracking-wider z-10`}>
                          {stamp.category.replace('k', 'K-').toUpperCase()}
                        </div>
                        {/* center icon */}
                        <div className="relative z-10 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center mb-1.5 backdrop-blur-sm border border-white/10">
                          <i className={`${style.stampIcon} text-xl text-white w-6 h-6 flex items-center justify-center`}></i>
                        </div>
                        <p className="relative z-10 text-[10px] text-white/90 text-center font-semibold leading-tight">{stamp.nameKo}</p>
                        <p className="relative z-10 text-[8px] text-white/60 mt-0.5">{stamp.date}</p>
                        {/* location hint */}
                        {lastVisit && stamp.address && (
                          <p className="relative z-10 text-[7px] text-white/40 mt-0.5 flex items-center gap-0.5">
                            <i className="ri-map-pin-2-line w-2.5 h-2.5 flex items-center justify-center"></i>
                            {(() => {
                              const addr = stamp.address || '';
                              if (addr.includes('서울')) return '서울';
                              if (addr.includes('부산')) return '부산';
                              if (addr.includes('인천')) return '인천';
                              if (addr.includes('대구')) return '대구';
                              if (addr.includes('대전')) return '대전';
                              if (addr.includes('광주')) return '광주';
                              if (addr.includes('울산')) return '울산';
                              if (addr.includes('세종')) return '세종';
                              if (addr.includes('경기')) return '경기';
                              if (addr.includes('강원')) return '강원';
                              if (addr.includes('충북') || addr.includes('충청북도')) return '충북';
                              if (addr.includes('충남') || addr.includes('충청남도')) return '충남';
                              if (addr.includes('전북') || addr.includes('전라북도')) return '전북';
                              if (addr.includes('전남') || addr.includes('전라남도')) return '전남';
                              if (addr.includes('경북') || addr.includes('경상북도')) return '경북';
                              if (addr.includes('경남') || addr.includes('경상남도')) return '경남';
                              if (addr.includes('제주')) return '제주';
                              return addr.split(' ')[0] || '위치 정보 없음';
                            })()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center relative">
                        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: style.pattern }} />
                        <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center mb-1 relative z-10">
                          <i className={`${style.stampIcon} text-lg text-gray-400 w-5 h-5 flex items-center justify-center`}></i>
                        </div>
                        <i className="ri-lock-line text-lg text-gray-400 mb-0.5 w-5 h-5 flex items-center justify-center relative z-10"></i>
                        <p className="text-[9px] text-gray-500 px-2 text-center relative z-10">{stamp.nameKo}</p>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </>
        ) : (
          /* Settings Tab */
          <div className="space-y-2.5 sm:space-y-3">
            {menuItems.map((item) => (
              <button
                key={item.page}
                onClick={() => handleMenuClick(item.page)}
                className="w-full flex items-center justify-between p-3.5 sm:p-4 bg-white rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <i className={`${item.icon} text-lg sm:text-xl text-gray-600 w-5 h-5 flex items-center justify-center`} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{item.label}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">{item.subLabel}</p>
                  </div>
                </div>
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-arrow-right-s-line text-gray-400 text-lg sm:text-xl w-4 h-4 flex items-center justify-center" />
                </div>
              </button>
            ))}

            <button className="w-full mt-3 sm:mt-4 py-3 bg-gray-200 text-gray-700 rounded-full font-semibold text-sm cursor-pointer whitespace-nowrap active:scale-95 transition-transform">
              로그아웃
            </button>
          </div>
        )}
      </div>

      {/* ── Share Modal ── */}
      <AnimatePresence>
        {showShareModal && shareImageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto"
            >
              {/* Drag handle */}
              <div className="w-full flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
              </div>

              <div className="px-5 pt-2 pb-6">
                {/* Preview */}
                <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                  <img
                    src={shareImageUrl}
                    alt="Passport Preview"
                    className="w-full object-cover"
                  />
                </div>

                {/* Caption */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">메시지 (선택)</label>
                  <textarea
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value.slice(0, 200))}
                    placeholder={`${profileForm.name}님의 WAVEY 여권을 확인해보세요!`}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    rows={2}
                    maxLength={200}
                  />
                  <p className="text-[10px] text-gray-400 text-right mt-1">{shareMessage.length}/200</p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2.5 mb-3">
                  <button
                    onClick={handleSavePassport}
                    className="flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold cursor-pointer whitespace-nowrap active:scale-95 transition-transform"
                  >
                    <i className="ri-download-line text-base w-5 h-5 flex items-center justify-center"></i>
                    저장하기
                  </button>
                  <button
                    onClick={handleSharePassport}
                    className="flex items-center justify-center gap-2 py-3 bg-teal-500 text-white rounded-full text-sm font-semibold cursor-pointer whitespace-nowrap active:scale-95 transition-transform"
                  >
                    <i className="ri-share-forward-line text-base w-5 h-5 flex items-center justify-center"></i>
                    공유하기
                  </button>
                </div>

                <button
                  onClick={handleCloseShare}
                  className="w-full py-3 text-gray-400 text-sm font-medium cursor-pointer whitespace-nowrap"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Capture Success Toast ── */}
      <AnimatePresence>
        {captureSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-0 right-0 z-50 flex justify-center px-4"
          >
            <div className="bg-gray-900 text-white px-5 py-3 rounded-full text-sm font-medium flex items-center gap-2 shadow-lg">
              <i className="ri-check-line text-teal-400 w-5 h-5 flex items-center justify-center"></i>
              저장되었습니다!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stamp Detail Modal */}
      <AnimatePresence>
        {selectedStamp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStamp(null)}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full max-h-[85vh] overflow-y-auto"
            >
              {(() => {
                const style = CATEGORY_STYLES[selectedStamp.category] || CATEGORY_STYLES.kheritage;
                const dotColor = selectedStamp.category === 'kdrama' ? 'bg-rose-400' : selectedStamp.category === 'kmovie' ? 'bg-indigo-400' : selectedStamp.category === 'kpop' ? 'bg-fuchsia-400' : 'bg-amber-400';
                return (
                  <>
                    <div className={`w-32 h-32 mx-auto mb-4 rounded-xl bg-gradient-to-br ${style.gradient} flex flex-col items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 pointer-events-none" style={{ background: style.pattern }} />
                      <div className="relative z-10 w-14 h-14 rounded-full bg-white/15 flex items-center justify-center mb-2 backdrop-blur-sm border border-white/10">
                        <i className={`${style.stampIcon} text-3xl text-white w-8 h-8 flex items-center justify-center`}></i>
                      </div>
                      <p className="relative z-10 text-xs text-white/80 font-semibold">{selectedStamp.nameKo}</p>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 text-center mb-1">{selectedStamp.name}</h3>
                    <p className="text-sm text-gray-500 text-center mb-1">{selectedStamp.nameKo}</p>
                    <div className="flex items-center justify-center gap-1 mb-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${style.badgeBg} ${style.badgeText}`}>
                        <i className={`${style.icon} w-3 h-3 flex items-center justify-center`}></i>
                        {selectedStamp.category.replace('k', 'K-').toUpperCase()}
                      </span>
                    </div>

                    {/* Visit Records */}
                    {selectedStamp.visitRecords && selectedStamp.visitRecords.length > 0 ? (
                      <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-3">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">방문 기록</h4>
                        {selectedStamp.visitRecords.map((record, idx) => (
                          <div key={idx} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-2 h-2 rounded-full ${dotColor}`}></div>
                              {idx !== selectedStamp.visitRecords.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1"></div>}
                            </div>
                            <div className="pb-2">
                              <p className="text-sm font-semibold text-gray-900">{record.date} <span className="text-gray-400 font-normal">{record.time}</span></p>
                              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                <i className="ri-map-pin-line text-gray-400 w-3 h-3 flex items-center justify-center"></i>
                                {(() => {
                                  const addr = selectedStamp.address || '';
                                  if (addr.includes('서울')) return '서울';
                                  if (addr.includes('부산')) return '부산';
                                  if (addr.includes('인천')) return '인천';
                                  if (addr.includes('대구')) return '대구';
                                  if (addr.includes('대전')) return '대전';
                                  if (addr.includes('광주')) return '광주';
                                  if (addr.includes('울산')) return '울산';
                                  if (addr.includes('세종')) return '세종';
                                  if (addr.includes('경기')) return '경기';
                                  if (addr.includes('강원')) return '강원';
                                  if (addr.includes('충북') || addr.includes('충청북도')) return '충북';
                                  if (addr.includes('충남') || addr.includes('충청남도')) return '충남';
                                  if (addr.includes('전북') || addr.includes('전라북도')) return '전북';
                                  if (addr.includes('전남') || addr.includes('전라남도')) return '전남';
                                  if (addr.includes('경북') || addr.includes('경상북도')) return '경북';
                                  if (addr.includes('경남') || addr.includes('경상남도')) return '경남';
                                  if (addr.includes('제주')) return '제주';
                                  return addr.split(' ')[0] || '위치 정보 없음';
                                })()}
                              </p>
                              {record.accuracy !== undefined && (
                                <p className="text-[10px] text-gray-400 mt-0.5">정확도: {record.accuracy}m</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 text-center mb-4">방문 기록이 없습니다.</p>
                    )}

                    <button
                      onClick={() => setSelectedStamp(null)}
                      className="w-full py-3 bg-gray-900 text-white rounded-full font-semibold text-sm cursor-pointer whitespace-nowrap"
                    >
                      닫기
                    </button>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Geofence Notification Alert */}
      <AnimatePresence>
        {showGeofenceNotification && pendingStamp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl p-5 shadow-2xl max-w-sm w-full">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                  <i className="ri-map-pin-fill text-3xl text-teal-500"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">You&apos;ve arrived!</h3>
                <p className="text-sm text-gray-600 mb-5">
                  You&apos;re near <span className="font-semibold">{pendingStamp.name}</span>. Take a photo to collect your stamp!
                </p>
                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => {
                      setShowGeofenceNotification(false);
                      setPendingStamp(null);
                    }}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold cursor-pointer whitespace-nowrap"
                  >
                    Later
                  </button>
                  <button
                    onClick={handleOpenCamera}
                    className="flex-1 py-3 bg-teal-500 text-white rounded-full text-sm font-semibold cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                  >
                    <i className="ri-camera-line text-lg"></i>
                    Take Photo
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera View Modal */}
      <AnimatePresence>
        {showCameraView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-50"
          >
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Overlay Frame */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-72 h-72 border-4 border-white/50 rounded-3xl"></div>
              </div>

              {/* Header */}
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 pt-14">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleCloseCamera}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer"
                  >
                    <i className="ri-close-line text-white text-xl"></i>
                  </button>
                  <div className="text-center">
                    <p className="text-white font-semibold">{pendingStamp?.name}</p>
                    <p className="text-white/70 text-xs">{pendingStamp?.nameKo}</p>
                  </div>
                  <div className="w-10"></div>
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 pb-12">
                <p className="text-white/80 text-sm text-center mb-6">
                  Position the landmark within the frame
                </p>
                <div className="flex items-center justify-center">
                  <button
                    onClick={handleVerifyPhoto}
                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-lg"
                  >
                    <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center">
                      <i className="ri-check-line text-white text-3xl"></i>
                    </div>
                  </button>
                </div>
                <p className="text-white/60 text-xs text-center mt-4">
                  Tap to verify your visit
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verification Loading Modal */}
      <AnimatePresence>
        {isVerifying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 border-4 border-white/30 border-t-teal-500 rounded-full mx-auto mb-4"
              />
              <p className="text-white text-lg font-semibold">Verifying...</p>
              <p className="text-white/60 text-sm mt-1">인증 중입니다</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stamp Animation */}
      <AnimatePresence>
        {showStampAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
          >
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-2xl">
                  <i className="ri-check-line text-6xl text-teal-500"></i>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-center"
              >
                <p className="text-white text-xl font-bold">Stamp Collected!</p>
                <p className="text-white/70 text-sm mt-1">스탬프를 획득했습니다!</p>
                {newlyCollectedStamp && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3"
                  >
                    <p className="text-amber-300 font-semibold">{newlyCollectedStamp.name}</p>
                    <p className="text-white/60 text-xs">{newlyCollectedStamp.nameKo}</p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}