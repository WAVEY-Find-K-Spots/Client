import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BottomNav } from '../../components/feature/BottomNav';
import { StatusBar } from '../../components/feature/StatusBar';

const koreanCultureResponses: Record<string, string> = {
  'hanbok': '한복(韓服)은 한국의 전통 의상입니다. 화려한 색상과 주머니가 없는 단순한 선이 특징이에요. 여성 한복은 저고리와 치마로 구성되며, 남성 한복은 저고리와 바지로 구성됩니다. 현대 한복은 추석, 설날 같은 명절에 주로 입어요.',
  'kimchi': '김치는 한국의 대표적인 발효 채소 음식으로, 보통 배추와 무로 만들어집니다. 고춧가루, 마늘, 생강, 젓갈 등으로 양념하고, 종류만 200가지가 넘어요! 유산균과 비타민이 풍부해서 건강에도 좋아요.',
  'palace': '서울에는 5대 궁궐이 있어요: 경복궁, 창덕궁, 창경궁, 덕수궁, 경희궁. 경복궁은 그 중 가장 크고 상징적인 곳으로, 조선시대인 1395년에 지어졌어요.',
  'kpop': 'K-pop은 1990년대에 시작되어 전 세계적으로 인기를 끌고 있어요. SM, YG, JYP, 하이브 같은 대형 엔터테인먼트 회사에서 아이돌을 수년간 트레이닝한 뒤 데뷔시켜요. K-pop은 칼군무, 중독성 있는 멜로디, 열정적인 팬 문화로 유명해요.',
  'kdrama': '한국 드라마는 매력적인 스토리, 아름다운 촬영, OST로 전 세계적으로 인기가 많아요. 유명한 촬영지로는 남산타워, 북촌한옥마을, 서울의 다양한 카페 등이 있어요. 많은 관광객이 이곳을 방문하죠!',
  'temple': '한국의 사찰에서는 템플스테이 프로그램을 통해 명상, 다도, 전통 식사를 경험할 수 있어요. 유명한 사찰로는 경주 불국사, 팔만대장경이 있는 해인사, 서울 조계사 등이 있어요.',
  'food': '한국 음식은 마늘, 생강, 참기름, 고추장 등 강한 맛이 특징이에요. 꼭 먹어봐야 할 음식으로는 비빔밥, 불고기, 삼겹살, 떡볶이, 그리고 한국 바비큐가 있어요. 식사할 때 반찬이 함께 나와요.',
  'seoul': '서울은 600년 이상의 역사를 가진 한국의 수도예요. 주요 명소로는 경복궁, N서울타워, 명동 쇼핑거리, 홍대, 한강 공원 등이 있어요. 전통과 현대가 완벽하게 어우러진 도시죠.',
  'jeju': '제주도는 한국에서 가장 큰 섬으로, 화산 지형, 아름다운 해변, 독특한 문화로 유명해요. 꼭 봐야 할 곳으로는 한라산, 성산일출봉, 그리고 유명한 해녀(여성 잠수부)들이 있어요.',
  'default': '한국 문화에 대해 좋은 질문이에요! 한국은 5,000년 이상의 역사를 가진 풍부한 전통을 보유하고 있어요. 음식, 패션, 예술, 엔터테인먼트에 독특한 전통이 있어요. 한복, 한국 요리, K-pop, 역사 유적지 등에 대해 더 알고 싶으신가요?'
};

const getAIResponse = (userMessage: string): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('hanbok') || lowerMessage.includes('dress') || lowerMessage.includes('clothing') || lowerMessage.includes('옷') || lowerMessage.includes('한복')) {
    return koreanCultureResponses['hanbok'];
  }
  if (lowerMessage.includes('kimchi') || lowerMessage.includes('김치') || lowerMessage.includes('ferment')) {
    return koreanCultureResponses['kimchi'];
  }
  if (lowerMessage.includes('palace') || lowerMessage.includes('궁') || lowerMessage.includes('gyeongbok') || lowerMessage.includes('경복')) {
    return koreanCultureResponses['palace'];
  }
  if (lowerMessage.includes('kpop') || lowerMessage.includes('k-pop') || lowerMessage.includes('idol') || lowerMessage.includes('bts') || lowerMessage.includes('blackpink') || lowerMessage.includes('아이돌')) {
    return koreanCultureResponses['kpop'];
  }
  if (lowerMessage.includes('drama') || lowerMessage.includes('kdrama') || lowerMessage.includes('드라마') || lowerMessage.includes('series') || lowerMessage.includes('시리즈')) {
    return koreanCultureResponses['kdrama'];
  }
  if (lowerMessage.includes('temple') || lowerMessage.includes('buddhist') || lowerMessage.includes('사찰') || lowerMessage.includes('절')) {
    return koreanCultureResponses['temple'];
  }
  if (lowerMessage.includes('food') || lowerMessage.includes('eat') || lowerMessage.includes('restaurant') || lowerMessage.includes('음식') || lowerMessage.includes('bbq') || lowerMessage.includes('bibimbap') || lowerMessage.includes('맛집')) {
    return koreanCultureResponses['food'];
  }
  if (lowerMessage.includes('seoul') || lowerMessage.includes('서울') || lowerMessage.includes('capital')) {
    return koreanCultureResponses['seoul'];
  }
  if (lowerMessage.includes('jeju') || lowerMessage.includes('제주') || lowerMessage.includes('island') || lowerMessage.includes('섬')) {
    return koreanCultureResponses['jeju'];
  }
  
  return koreanCultureResponses['default'];
};

export default function CameraPage() {
  const [selectedMode, setSelectedMode] = useState<'translator' | 'docent' | null>(null);
  const [inputMode, setInputMode] = useState<'text' | 'camera' | 'voice'>('text');
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: '안녕하세요! AI 도슨트입니다. 한국 문화, 역사, 여행 팁에 대해 무엇이든 물어보세요!' }
  ]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const userMessage = inputText;
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInputText('');
    
    setTimeout(() => {
      const aiResponse = getAIResponse(userMessage);
      setChatMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    }, 1000);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-purple-50 to-pink-50 pb-20">
      <StatusBar />

      {/* Header */}
      <div className="px-3 sm:px-4 py-4 sm:py-6 pt-12 sm:pt-14">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-0.5 sm:mb-1">
          AI 가이드
        </h1>
        <p className="text-xs sm:text-sm text-gray-600">
          당신의 스마트한 한국 여행 파트너
        </p>
      </div>

      {/* Mode Selection Landing */}
      {!selectedMode && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-3 sm:px-4 py-3 sm:py-4"
        >
          <div className="text-center mb-6 sm:mb-8">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 bg-white rounded-2xl sm:rounded-3xl shadow-lg flex items-center justify-center"
            >
              <i className="ri-sparkling-fill text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-br from-teal-400 to-purple-500"></i>
            </motion.div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2">
              AI 기능 선택
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              어떤 도움이 필요하신가요?
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* AI Translator */}
            <motion.button
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMode('translator')}
              className="w-full bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <i className="ri-translate-2 text-xl sm:text-2xl text-white"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5 sm:mb-1">
                    AI 번역기
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                    실시간 번역으로 언어 장벽을 없애세요
                  </p>
                </div>
                <i className="ri-arrow-right-s-line text-xl sm:text-2xl text-gray-400 flex-shrink-0"></i>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-teal-50 text-teal-700 rounded-full text-[10px] sm:text-xs font-medium">텍스트</span>
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-teal-50 text-teal-700 rounded-full text-[10px] sm:text-xs font-medium">카메라 AR</span>
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-teal-50 text-teal-700 rounded-full text-[10px] sm:text-xs font-medium">음성</span>
              </div>
            </motion.button>

            {/* AI Docent */}
            <motion.button
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMode('docent')}
              className="w-full bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer text-left group"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                  <i className="ri-guide-line text-xl sm:text-2xl text-white"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-0.5 sm:mb-1">
                    AI 도슨트
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                    한국 문화를 깊이 있게 이해하세요
                  </p>
                </div>
                <i className="ri-arrow-right-s-line text-xl sm:text-2xl text-gray-400 flex-shrink-0"></i>
              </div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-50 text-purple-700 rounded-full text-[10px] sm:text-xs font-medium">챗봇 가이드</span>
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-50 text-purple-700 rounded-full text-[10px] sm:text-xs font-medium">비전 AI</span>
                <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-purple-50 text-purple-700 rounded-full text-[10px] sm:text-xs font-medium">문화재 정보</span>
              </div>
            </motion.button>
          </div>

          {/* Quick Tips */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 sm:mt-6 bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5"
          >
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
              <i className="ri-lightbulb-line text-amber-500"></i>
              사용 팁
            </h3>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                <i className="ri-camera-line text-teal-500 flex-shrink-0"></i>
                <span>카메라 모드: 메뉴판, 간판, 랜드마크를 비춰보세요</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                <i className="ri-chat-3-line text-purple-500 flex-shrink-0"></i>
                <span>텍스트 모드: 질문을 입력하거나 텍스트를 붙여넣으세요</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                <i className="ri-mic-line text-teal-500 flex-shrink-0"></i>
                <span>음성 모드: 말하면 실시간 번역이 제공됩니다</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Translator Mode */}
      {selectedMode === 'translator' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-3 sm:px-4 flex flex-col"
          style={{ height: 'calc(100vh - 200px)' }}
        >
          {/* Back & Mode Toggle */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <button
              onClick={() => setSelectedMode(null)}
              className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              <i className="ri-arrow-left-line text-lg sm:text-xl"></i>
              <span className="text-xs sm:text-sm font-medium">뒤로</span>
            </button>
            <div className="flex bg-gray-100 rounded-full p-0.5 sm:p-1">
              <button
                onClick={() => setInputMode('text')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  inputMode === 'text' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                <i className="ri-text mr-0.5 sm:mr-1"></i>텍스트
              </button>
              <button
                onClick={() => setInputMode('camera')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  inputMode === 'camera' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                <i className="ri-camera-line mr-0.5 sm:mr-1"></i>카메라
              </button>
              <button
                onClick={() => setInputMode('voice')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  inputMode === 'voice' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                <i className="ri-mic-line mr-0.5 sm:mr-1"></i>음성
              </button>
            </div>
          </div>

          {inputMode === 'text' ? (
            <div className="flex-1 flex flex-col gap-3 sm:gap-4 overflow-hidden pb-3 sm:pb-4">
              {/* Input Box */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm flex-1 flex flex-col">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <span className="text-[10px] sm:text-xs font-semibold text-gray-500">한국어</span>
                  <button className="w-5 h-5 sm:w-6 sm:h-6 bg-teal-100 rounded-full flex items-center justify-center cursor-pointer">
                    <i className="ri-swap-line text-teal-600 text-xs sm:text-sm"></i>
                  </button>
                  <span className="text-[10px] sm:text-xs font-semibold text-gray-500">영어</span>
                </div>
                <textarea
                  placeholder="번역할 텍스트를 입력하세요..."
                  className="w-full flex-1 min-h-[60px] sm:min-h-[80px] resize-none text-xs sm:text-sm text-gray-900 focus:outline-none"
                  maxLength={500}
                ></textarea>
              </div>
              
              {/* Output Box */}
              <div className="bg-teal-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-teal-600 mb-1.5 sm:mb-2">번역 결과</p>
                <p className="text-xs sm:text-sm text-gray-700">번역 결과가 여기에 표시됩니다...</p>
              </div>
            </div>
          ) : inputMode === 'camera' ? (
            <div className="flex-1 flex flex-col items-center justify-start pt-2 pb-3 sm:pb-4">
              <div className="w-full h-44 sm:h-56 bg-gray-900 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 relative overflow-hidden">
                <div className="absolute inset-3 sm:inset-4 border-2 border-white/50 rounded-lg sm:rounded-xl"></div>
                <i className="ri-camera-line text-4xl sm:text-5xl text-white/50"></i>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 text-center mb-3 sm:mb-4">
                카메라를 한국어 텍스트에 비춰보세요<br/>
                <span className="text-[10px] sm:text-xs text-gray-400">메뉴판, 간판 등을 비춰주세요</span>
              </p>
              <button className="px-6 sm:px-8 py-2.5 sm:py-3 bg-teal-500 text-white rounded-full text-xs sm:text-sm font-semibold cursor-pointer whitespace-nowrap">
                <i className="ri-camera-fill mr-1.5 sm:mr-2"></i>
                촬영하고 번역하기
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-start pt-2 pb-3 sm:pb-4">
              {/* Voice Translation UI */}
              <div className="w-full bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm mb-3 sm:mb-4">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-[10px] sm:text-xs font-bold text-teal-700">KO</span>
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">한국어</span>
                  </div>
                  <button className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer">
                    <i className="ri-swap-line text-gray-600 text-sm"></i>
                  </button>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-xs sm:text-sm font-medium text-gray-700">영어</span>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-[10px] sm:text-xs font-bold text-teal-700">EN</span>
                    </div>
                  </div>
                </div>
                <div className="h-16 sm:h-20 bg-gray-50 rounded-lg sm:rounded-xl flex items-center justify-center mb-1.5 sm:mb-2">
                  {isRecording ? (
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [10, 20, 10] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                          className="w-1 bg-teal-500 rounded-full"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-400">마이크를 눌러 말하세요</p>
                  )}
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500 text-center">
                  {isRecording ? '듣는 중...' : '길게 눌러 말하세요'}
                </p>
              </div>

              {/* Mic Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleRecording}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shadow-lg cursor-pointer mb-3 sm:mb-4 ${
                  isRecording 
                    ? 'bg-red-500' 
                    : 'bg-gradient-to-br from-teal-400 to-teal-500'
                }`}
              >
                <i className={`${isRecording ? 'ri-stop-fill' : 'ri-mic-fill'} text-2xl sm:text-3xl text-white`}></i>
              </motion.button>

              {/* Translation Result */}
              <div className="w-full bg-teal-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold text-teal-600 mb-1.5 sm:mb-2">번역 결과</p>
                <p className="text-xs sm:text-sm text-gray-700">
                  {isRecording ? '번역 중...' : '음성 번역 결과가 여기에 표시됩니다...'}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Docent Mode */}
      {selectedMode === 'docent' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-3 sm:px-4 flex flex-col"
          style={{ height: 'calc(100vh - 200px)' }}
        >
          {/* Back & Mode Toggle */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <button
              onClick={() => setSelectedMode(null)}
              className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              <i className="ri-arrow-left-line text-lg sm:text-xl"></i>
              <span className="text-xs sm:text-sm font-medium">뒤로</span>
            </button>
            <div className="flex bg-gray-100 rounded-full p-0.5 sm:p-1">
              <button
                onClick={() => setInputMode('text')}
                className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  inputMode === 'text' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                <i className="ri-chat-3-line mr-0.5 sm:mr-1"></i>채팅
              </button>
              <button
                onClick={() => setInputMode('camera')}
                className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  inputMode === 'camera' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                <i className="ri-camera-line mr-0.5 sm:mr-1"></i>비전
              </button>
            </div>
          </div>

          {inputMode === 'text' ? (
            <div className="flex-1 flex flex-col overflow-hidden pb-3 sm:pb-4">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3 mb-2 sm:mb-3">
                {chatMessages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm ${
                        msg.role === 'user'
                          ? 'bg-purple-500 text-white rounded-br-md'
                          : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input */}
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white rounded-full p-1.5 sm:p-2 shadow-sm">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="질문을 입력하세요..."
                  className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0"
                >
                  <i className="ri-send-plane-fill text-white text-sm sm:text-base"></i>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-start pt-2 pb-3 sm:pb-4">
              <div className="w-full h-44 sm:h-56 bg-gray-900 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 relative overflow-hidden">
                <div className="absolute inset-3 sm:inset-4 border-2 border-white/50 rounded-lg sm:rounded-xl"></div>
                <i className="ri-ancient-gate-line text-4xl sm:text-5xl text-white/50"></i>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 text-center mb-3 sm:mb-4">
                랜드마크나 문화재를 비춰보세요<br/>
                <span className="text-[10px] sm:text-xs text-gray-400">유적지나 문화재를 비춰주세요</span>
              </p>
              <button className="px-6 sm:px-8 py-2.5 sm:py-3 bg-purple-500 text-white rounded-full text-xs sm:text-sm font-semibold cursor-pointer whitespace-nowrap">
                <i className="ri-camera-fill mr-1.5 sm:mr-2"></i>
                인식하고 설명하기
              </button>
            </div>
          )}
        </motion.div>
      )}

      <BottomNav />
    </div>
  );
}
