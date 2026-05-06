import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusBar } from '../../components/feature/StatusBar';
import { BottomNav } from '../../components/feature/BottomNav';
import { PlaceholderImage } from '../../components/base/PlaceholderImage';
import { Navbar } from '../home/components/Navbar';

interface Post {
  id: number;
  author: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  route: {
    name: string;
    spots: number;
    duration: string;
    image: string;
    category: string;
  };
  likes: number;
  comments: number;
  saves: number;
  timestamp: string;
  caption: string;
  isLiked: boolean;
  isSaved: boolean;
}

interface RouteOption {
  name: string;
  spots: number;
  duration: string;
  image: string;
  category: string;
}

const routeCategories: Record<string, { color: string; label: string }> = {
  'Seoul K-Drama Tour': { color: '#ec4899', label: '드라마' },
  'Busan Foodie Trail': { color: '#f97316', label: '맛집' },
  'K-Pop Star Route': { color: '#6366f1', label: 'K-Pop' },
};

const availableRoutes: RouteOption[] = [
  { name: 'Seoul K-Drama Tour', spots: 8, duration: '1 day', image: '', category: 'Seoul K-Drama Tour' },
  { name: 'Busan Foodie Trail', spots: 12, duration: '2 days', image: '', category: 'Busan Foodie Trail' },
  { name: 'K-Pop Star Route', spots: 6, duration: '4 hours', image: '', category: 'K-Pop Star Route' },
  { name: 'Jeju Nature Walk', spots: 5, duration: '1 day', image: '', category: 'Seoul K-Drama Tour' },
  { name: 'Gangnam Shopping', spots: 10, duration: '6 hours', image: '', category: 'K-Pop Star Route' },
];

const mockPosts: Post[] = [
  {
    id: 1,
    author: {
      name: 'Sarah Kim',
      avatar: '',
      verified: true,
    },
    route: {
      name: 'Seoul K-Drama Tour',
      spots: 8,
      duration: '1 day',
      image: '',
      category: 'Seoul K-Drama Tour',
    },
    likes: 1243,
    comments: 89,
    saves: 456,
    timestamp: '2시간 전',
    caption: '방금 이 멋진 K-Drama 루트를 완료했어요! 모든 장소가 마법 같았어요 ✨ 드라마 팬들에게 강력 추천!',
    isLiked: false,
    isSaved: false,
  },
  {
    id: 2,
    author: {
      name: 'Mike Chen',
      avatar: '',
      verified: false,
    },
    route: {
      name: 'Busan Foodie Trail',
      spots: 12,
      duration: '2 days',
      image: '',
      category: 'Busan Foodie Trail',
    },
    likes: 892,
    comments: 67,
    saves: 321,
    timestamp: '5시간 전',
    caption: '최고의 해산물 경험! 🦞🐟 부산은 언제나 실망시키지 않아요',
    isLiked: true,
    isSaved: false,
  },
  {
    id: 3,
    author: {
      name: 'Emma Park',
      avatar: '',
      verified: true,
    },
    route: {
      name: 'K-Pop Star Route',
      spots: 6,
      duration: '4 hours',
      image: '',
      category: 'K-Pop Star Route',
    },
    likes: 2156,
    comments: 134,
    saves: 789,
    timestamp: '1일 전',
    caption: 'K-Pop의 꿈을 살아요! 💜 이 곳에서 많은 팬들을 만났어요',
    isLiked: false,
    isSaved: true,
  },
];

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [activeTab, setActiveTab] = useState<'following' | 'explore'>('explore');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [caption, setCaption] = useState('');
  const [showRouteDropdown, setShowRouteDropdown] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLike = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
  };

  const handleSave = (postId: number) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, isSaved: !post.isSaved, saves: post.isSaved ? post.saves - 1 : post.saves + 1 }
          : post
      )
    );
  };

  const handleRouteClick = (routeName: string) => {
    alert(`"${routeName}" 루트를 확인하시겠습니까?`);
  };

  const handleCreatePost = () => {
    if (!selectedRoute || !caption.trim()) return;

    const newPost: Post = {
      id: Date.now(),
      author: {
        name: 'Guest User',
        avatar: '',
        verified: false,
      },
      route: {
        name: selectedRoute.name,
        spots: selectedRoute.spots,
        duration: selectedRoute.duration,
        image: selectedRoute.image,
        category: selectedRoute.category,
      },
      likes: 0,
      comments: 0,
      saves: 0,
      timestamp: '방금 전',
      caption: caption.trim(),
      isLiked: false,
      isSaved: false,
    };

    setPosts((prev) => [newPost, ...prev]);
    setShowCreateModal(false);
    setSelectedRoute(null);
    setCaption('');
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2500);
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      <StatusBar />
      <Navbar />

      <div className="pt-16">
        {/* Tabs */}
        <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
          <div className="px-4 flex items-center justify-between">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('following')}
                className={`py-4 text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'following' ? 'text-gray-900 border-b-2 border-teal-500' : 'text-gray-400'
                }`}
              >
                팔로잉
              </button>
              <button
                onClick={() => setActiveTab('explore')}
                className={`py-4 text-sm font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'explore' ? 'text-gray-900 border-b-2 border-teal-500' : 'text-gray-400'
                }`}
              >
                둘러보기
              </button>
            </div>
            {/* Create Post Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-full text-xs font-semibold cursor-pointer whitespace-nowrap active:scale-95 transition-transform"
            >
              <i className="ri-add-line text-sm w-4 h-4 flex items-center justify-center"></i>
              <span>작성</span>
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="pb-4">
          {posts.map((post) => {
            const routeCat = routeCategories[post.route.name] || routeCategories['Seoul K-Drama Tour'];
            return (
              <div key={post.id} className="bg-white mb-3">
                {/* Post Header */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <PlaceholderImage alt={post.author.name} className="w-10 h-10 rounded-full" iconClassName="text-lg" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-gray-900">{post.author.name}</span>
                        {post.author.verified && <i className="ri-verified-badge-fill text-teal-500 text-sm"></i>}
                      </div>
                      <span className="text-xs text-gray-400">{post.timestamp}</span>
                    </div>
                  </div>
                  <button className="w-8 h-8 flex items-center justify-center cursor-pointer active:scale-90 transition-transform">
                    <i className="ri-more-2-fill text-xl text-gray-300"></i>
                  </button>
                </div>

                {/* Route Image Card */}
                <div
                  onClick={() => handleRouteClick(post.route.name)}
                  className="relative mx-4 rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
                >
                  <div className="w-full h-72 sm:h-80">
                    <PlaceholderImage alt={post.route.name} className="w-full h-full" iconClassName="text-4xl sm:text-5xl" label={post.route.name} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: routeCat.color }}></span>
                      <span style={{ color: routeCat.color }}>{routeCat.label}</span>
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-bold text-white mb-2">{post.route.name}</h3>
                    <div className="flex items-center gap-4 text-white/90 text-xs">
                      <span className="flex items-center gap-1">
                        <i className="ri-map-pin-line"></i>
                        {post.route.spots}개 스팟
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="ri-time-line"></i>
                        {post.route.duration}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Post Actions */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-5">
                    <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 cursor-pointer active:scale-90 transition-transform">
                      <i className={`${post.isLiked ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-gray-700'} text-2xl`}></i>
                      <span className="text-sm font-bold text-gray-900">{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-1.5 cursor-pointer active:scale-90 transition-transform">
                      <i className="ri-chat-3-line text-2xl text-gray-700"></i>
                      <span className="text-sm font-bold text-gray-900">{post.comments}</span>
                    </button>
                    <button className="flex items-center gap-1.5 cursor-pointer active:scale-90 transition-transform">
                      <i className="ri-share-line text-2xl text-gray-700"></i>
                    </button>
                  </div>
                  <button onClick={() => handleSave(post.id)} className="cursor-pointer active:scale-90 transition-transform">
                    <i className={`${post.isSaved ? 'ri-bookmark-fill text-teal-500' : 'ri-bookmark-line text-gray-700'} text-2xl`}></i>
                  </button>
                </div>

                {/* Caption */}
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-800 leading-relaxed">
                    <span className="font-bold mr-2">{post.author.name}</span>
                    {post.caption}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Action Button (mobile fallback) */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed right-4 bottom-20 sm:bottom-24 w-14 h-14 bg-teal-500 text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer active:scale-90 transition-transform z-40"
      >
        <i className="ri-add-line text-2xl w-6 h-6 flex items-center justify-center"></i>
      </button>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowCreateModal(false);
              setShowRouteDropdown(false);
            }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-between z-10 rounded-t-2xl">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowRouteDropdown(false);
                  }}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
                >
                  <i className="ri-close-line text-xl text-gray-700 w-5 h-5 flex items-center justify-center"></i>
                </button>
                <h2 className="text-lg font-bold text-gray-900">새 포스트</h2>
                <button
                  onClick={handleCreatePost}
                  disabled={!selectedRoute || !caption.trim()}
                  className={`px-5 py-2 rounded-full text-sm font-semibold cursor-pointer whitespace-nowrap transition-all ${
                    selectedRoute && caption.trim()
                      ? 'bg-teal-500 text-white active:scale-95'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  공유
                </button>
              </div>

              <div className="p-4 space-y-5">
                {/* Author preview */}
                <div className="flex items-center gap-3">
                  <PlaceholderImage alt="Guest User" className="w-10 h-10 rounded-full" iconClassName="text-lg" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Guest User</p>
                    <p className="text-xs text-gray-500">방금 전</p>
                  </div>
                </div>

                {/* Route Selector */}
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">루트 선택</label>
                  <button
                    onClick={() => setShowRouteDropdown(!showRouteDropdown)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      selectedRoute
                        ? 'bg-teal-50 border-teal-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center ${selectedRoute ? 'bg-teal-100' : 'bg-gray-100'}`}>
                        <i className={`${selectedRoute ? 'ri-route-fill text-teal-600' : 'ri-route-line text-gray-400'} text-lg w-5 h-5 flex items-center justify-center`}></i>
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-medium ${selectedRoute ? 'text-gray-900' : 'text-gray-400'}`}>
                          {selectedRoute ? selectedRoute.name : '루트를 선택하세요'}
                        </p>
                        {selectedRoute && (
                          <p className="text-xs text-gray-500">{selectedRoute.spots}개 스팟 · {selectedRoute.duration}</p>
                        )}
                      </div>
                    </div>
                    <i className={`${showRouteDropdown ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} text-gray-400 text-lg w-5 h-5 flex items-center justify-center`}></i>
                  </button>

                  <AnimatePresence>
                    {showRouteDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden z-20"
                      >
                        {availableRoutes.map((route) => {
                          const cat = routeCategories[route.name] || routeCategories['Seoul K-Drama Tour'];
                          return (
                            <button
                              key={route.name}
                              onClick={() => {
                                setSelectedRoute(route);
                                setShowRouteDropdown(false);
                              }}
                              className={`w-full flex items-center gap-3 p-3.5 text-left cursor-pointer transition-colors hover:bg-gray-50 ${
                                selectedRoute?.name === route.name ? 'bg-teal-50' : ''
                              }`}
                            >
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${selectedRoute?.name === route.name ? 'bg-teal-100' : 'bg-gray-100'}`}>
                                <i className={`${selectedRoute?.name === route.name ? 'ri-check-line text-teal-600' : 'ri-map-pin-line text-gray-400'} text-lg w-5 h-5 flex items-center justify-center`}></i>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{route.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="inline-flex items-center gap-1 text-xs">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }}></span>
                                    <span style={{ color: cat.color }} className="font-medium">{cat.label}</span>
                                  </span>
                                  <span className="text-xs text-gray-400">· {route.spots}개 스팟</span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Caption */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">캡션</label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value.slice(0, 500))}
                    placeholder="어떤 경험을 공유하고 싶나요?"
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent h-32 resize-none"
                    maxLength={500}
                  />
                  <div className="flex justify-end mt-1.5">
                    <span className="text-xs text-gray-400">{caption.length}/500</span>
                  </div>
                </div>

                {/* Route Preview Card */}
                {selectedRoute && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-2xl p-4 border border-gray-100"
                  >
                    <p className="text-xs text-gray-500 mb-2">선택한 루트</p>
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                        <PlaceholderImage alt={selectedRoute.name} className="w-full h-full" iconClassName="text-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{selectedRoute.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <i className="ri-map-pin-line text-xs"></i>
                            {selectedRoute.spots}개 스팟
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <i className="ri-time-line text-xs"></i>
                            {selectedRoute.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-gray-900 text-white px-5 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
              <i className="ri-check-line text-teal-400 text-lg w-5 h-5 flex items-center justify-center"></i>
              포스트가 공유되었습니다!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}