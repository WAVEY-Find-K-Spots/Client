export type SpotType = "drama" | "kpop" | "movie" | "tour";

export interface DramaItem {
  title: string;
  eps: string;
  image: string;
  play: number; // seconds for progress visual
}

export interface MusicItem {
  title: string;
  artist: string;
  image: string;
  tag: string;
}

export interface VideoItem {
  label: string;
  image: string;
}

export interface ReviewItem {
  author: string;
  flag: string;
  date: string;
  rating: number;
  text: string;
}

export interface Spot {
  id: string;
  name: string;
  loc: string;
  coord: { lat: number; lng: number };
  rating: number;
  reviewCount: number;
  type: SpotType;
  typeLabel: string;
  size: "tall" | "medium";
  image: string;
  desc: string;
  tags: string[];
  info: {
    hours: string;
    hoursNote: string;
    address: string;
    transport: string;
    phone: string;
  };
  dramas: DramaItem[];
  sceneTitle: string;
  sceneDesc: string;
  music: MusicItem[];
  videos: VideoItem[];
  reviews: ReviewItem[];
}

export const spotCategories: { key: "all" | SpotType; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "drama", label: "K-Drama" },
  { key: "kpop", label: "K-POP" },
  { key: "movie", label: "K-Movie" },
  { key: "tour", label: "관광지" },
];

// Spot list card images (portrait)
const imgGyeongbokgung = "https://readdy.ai/api/search-image?query=Gyeongbokgung%20Palace%20main%20gate%20with%20traditional%20Korean%20roof%20tiles%20and%20stone%20walls%2C%20warm%20golden%20hour%20sunlight%2C%20autumn%20trees%20with%20orange%20leaves%2C%20serene%20ancient%20architecture%2C%20editorial%20travel%20photography%2C%20soft%20warm%20brown%20tones%2C%20clean%20sky%20background%2C%20high%20detail%20harmonious%20composition&width=400&height=520&seq=spot-gyeongbokgung&orientation=portrait";
const imgGwanghwamun = "https://readdy.ai/api/search-image?query=Gwanghwamun%20Square%20in%20Seoul%20with%20King%20Sejong%20statue%20and%20modern%20city%20buildings%2C%20warm%20evening%20light%2C%20wide%20pedestrian%20plaza%2C%20editorial%20travel%20photography%2C%20soft%20warm%20brown%20and%20beige%20tones%2C%20urban%20landscape%20with%20traditional%20gate%20background%2C%20clean%20composition%20high%20detail&width=400&height=380&seq=spot-gwanghwamun&orientation=portrait";
const imgBukchon = "https://readdy.ai/api/search-image?query=Bukchon%20Hanok%20Village%20narrow%20alley%20with%20traditional%20Korean%20wooden%20houses%20and%20curved%20roof%20tiles%2C%20warm%20sunlight%20casting%20long%20shadows%2C%20peaceful%20residential%20street%2C%20editorial%20travel%20photography%2C%20soft%20warm%20earthy%20brown%20tones%2C%20clean%20minimal%20background%2C%20authentic%20Korean%20atmosphere%20high%20detail&width=400&height=520&seq=spot-bukchon&orientation=portrait";
const imgNamsan = "https://readdy.ai/api/search-image?query=N%20Seoul%20Tower%20on%20Namsan%20mountain%20with%20Seoul%20city%20skyline%20panorama%20at%20golden%20dusk%2C%20warm%20sunset%20colors%2C%20romantic%20viewpoint%20with%20cable%20car%2C%20editorial%20travel%20photography%2C%20soft%20warm%20brown%20and%20orange%20tones%2C%20clean%20sky%20background%2C%20high%20detail%20harmonious%20composition&width=400&height=380&seq=spot-namsan&orientation=portrait";
const imgHanriver = "https://readdy.ai/api/search-image?query=Han%20River%20Park%20in%20Seoul%20with%20riverside%20walking%20path%20and%20bicycle%20lane%2C%20warm%20sunset%20reflections%20on%20calm%20water%2C%20people%20enjoying%20picnic%20on%20green%20lawn%2C%20editorial%20travel%20photography%2C%20soft%20warm%20golden%20brown%20tones%2C%20clean%20natural%20background%2C%20lifestyle%20scene%20high%20detail&width=400&height=520&seq=spot-hanriver&orientation=portrait";
const imgChangdeokgung = "https://readdy.ai/api/search-image?query=Changdeokgung%20Palace%20Secret%20Garden%20with%20traditional%20Korean%20pavilion%20and%20lush%20green%20pond%2C%20dappled%20sunlight%20through%20trees%2C%20peaceful%20natural%20garden%20setting%2C%20editorial%20travel%20photography%2C%20soft%20warm%20earthy%20green%20and%20brown%20tones%2C%20clean%20serene%20background%2C%20high%20detail%20harmonious%20composition&width=400&height=380&seq=spot-changdeokgung&orientation=portrait";

// Drama thumbnails
const dramaQueenTears = "https://readdy.ai/api/search-image?query=Romantic%20Korean%20drama%20scene%20with%20elegant%20couple%20in%20formal%20attire%20standing%20in%20grand%20palace%20courtyard%2C%20warm%20cinematic%20lighting%2C%20soft%20warm%20brown%20tones%2C%20editorial%20photography%20style%2C%20clean%20background%20with%20traditional%20architecture%2C%20high%20detail&width=300&height=160&seq=drama-queen-tears&orientation=landscape";
const dramaKingdom = "https://readdy.ai/api/search-image?query=Korean%20historical%20zombie%20drama%20scene%20with%20dark%20traditional%20palace%20interior%20and%20ancient%20architecture%2C%20dramatic%20warm%20torch%20lighting%2C%20cinematic%20atmosphere%2C%20soft%20warm%20brown%20and%20amber%20tones%2C%20clean%20moody%20background%2C%20high%20detail&width=300&height=160&seq=drama-kingdom&orientation=landscape";
const dramaGoblin = "https://readdy.ai/api/search-image?query=Fantasy%20Korean%20drama%20scene%20with%20mysterious%20man%20in%20long%20coat%20standing%20on%20modern%20city%20street%20with%20traditional%20gate%20background%2C%20warm%20cinematic%20sunset%20lighting%2C%20soft%20warm%20brown%20tones%2C%20clean%20urban%20background%2C%20editorial%20photography%20high%20detail&width=300&height=160&seq=drama-goblin&orientation=landscape";
const dramaV = "https://readdy.ai/api/search-image?query=Thriller%20Korean%20drama%20scene%20with%20female%20lead%20in%20elegant%20outfit%20walking%20through%20modern%20city%20plaza%2C%20warm%20cinematic%20lighting%2C%20soft%20warm%20brown%20and%20beige%20tones%2C%20clean%20urban%20background%2C%20editorial%20photography%20style%20high%20detail&width=300&height=160&seq=drama-v&orientation=landscape";
const dramaPsycho = "https://readdy.ai/api/search-image?query=Romantic%20Korean%20drama%20scene%20with%20couple%20walking%20through%20traditional%20Korean%20village%20alley%20with%20hanok%20houses%2C%20warm%20afternoon%20sunlight%2C%20soft%20warm%20brown%20tones%2C%20clean%20peaceful%20background%2C%20editorial%20photography%20high%20detail&width=300&height=160&seq=drama-psycho&orientation=landscape";
const dramaItaewon = "https://readdy.ai/api/search-image?query=Korean%20drama%20scene%20with%20determined%20young%20man%20in%20modern%20street%20fashion%20standing%20on%20busy%20Seoul%20street%2C%20warm%20cinematic%20lighting%2C%20soft%20warm%20brown%20and%20urban%20tones%2C%20clean%20city%20background%2C%20editorial%20photography%20high%20detail&width=300&height=160&seq=drama-itaewon&orientation=landscape";
const dramaCrash = "https://readdy.ai/api/search-image?query=Romantic%20Korean%20drama%20scene%20with%20parachuting%20couple%20in%20mountain%20forest%20with%20warm%20morning%20mist%2C%20cinematic%20lighting%2C%20soft%20warm%20brown%20and%20green%20tones%2C%20clean%20natural%20background%2C%20editorial%20photography%20high%20detail&width=300&height=160&seq=drama-crash&orientation=landscape";
const dramaStartup = "https://readdy.ai/api/search-image?query=Korean%20drama%20scene%20with%20young%20entrepreneurs%20working%20in%20modern%20tech%20office%20with%20city%20view%20through%20glass%20windows%2C%20warm%20cinematic%20lighting%2C%20soft%20warm%20brown%20and%20blue%20tones%2C%20clean%20urban%20background%2C%20editorial%20photography%20high%20detail&width=300&height=160&seq=drama-startup&orientation=landscape";
const dramaRedSleeve = "https://readdy.ai/api/search-image?query=Korean%20historical%20drama%20scene%20with%20elegant%20royal%20couple%20in%20traditional%20hanbok%20by%20lotus%20pond%20in%20palace%20garden%2C%20warm%20cinematic%20lighting%2C%20soft%20warm%20brown%20and%20pink%20tones%2C%20clean%20traditional%20background%2C%20editorial%20photography%20high%20detail&width=300&height=160&seq=drama-red-sleeve&orientation=landscape";
const dramaKing = "https://readdy.ai/api/search-image?query=Korean%20parallel%20world%20drama%20scene%20with%20king%20on%20white%20horse%20riding%20through%20modern%20Seoul%20street%20with%20traffic%20lights%2C%20warm%20cinematic%20lighting%2C%20soft%20warm%20brown%20and%20golden%20tones%2C%20clean%20urban%20background%2C%20editorial%20photography%20high%20detail&width=300&height=160&seq=drama-king&orientation=landscape";
const dramaJealousy = "https://readdy.ai/api/search-image?query=Romantic%20Korean%20drama%20scene%20with%20broadcasters%20in%20news%20studio%20with%20warm%20mood%20lighting%20and%20city%20nightscape%20behind%20glass%20windows%2C%20cinematic%20atmosphere%2C%20soft%20warm%20brown%20and%20purple%20tones%2C%20clean%20urban%20background%2C%20editorial%20photography%20high%20detail&width=300&height=160&seq=drama-jealousy&orientation=landscape";
const dramaGuardians = "https://readdy.ai/api/search-image?query=Korean%20superhero%20drama%20scene%20with%20characters%20standing%20on%20rooftop%20overlooking%20Seoul%20city%20skyline%20at%20night%20with%20warm%20city%20lights%2C%20cinematic%20atmosphere%2C%20soft%20warm%20brown%20and%20orange%20tones%2C%20clean%20urban%20background%2C%20editorial%20photography%20high%20detail&width=300&height=160&seq=drama-guardians&orientation=landscape";

// Music album covers
const musicDynamite = "https://readdy.ai/api/search-image?query=Retro%20disco%20themed%20album%20cover%20with%20warm%20golden%20lights%20and%20colorful%20confetti%2C%20vibrant%20energy%2C%20soft%20warm%20brown%20and%20gold%20tones%2C%20clean%20minimal%20background%2C%20editorial%20music%20photography%20high%20detail&width=120&height=120&seq=music-dynamite&orientation=squarish";
const musicFancy = "https://readdy.ai/api/search-image?query=Elegant%20pop%20album%20cover%20with%20soft%20pink%20and%20warm%20coral%20lighting%2C%20feminine%20and%20playful%20atmosphere%2C%20soft%20warm%20tones%2C%20clean%20minimal%20background%2C%20editorial%20music%20photography%20high%20detail&width=120&height=120&seq=music-fancy&orientation=squarish";
const musicSpringDay = "https://readdy.ai/api/search-image?query=Melancholic%20spring%20album%20cover%20with%20cherry%20blossoms%20and%20warm%20sunlight%2C%20nostalgic%20atmosphere%2C%20soft%20warm%20brown%20and%20pink%20tones%2C%20clean%20natural%20background%2C%20editorial%20music%20photography%20high%20detail&width=120&height=120&seq=music-springday&orientation=squarish";
const musicNewWorld = "https://readdy.ai/api/search-image?query=Empowering%20pop%20album%20cover%20with%20warm%20golden%20stage%20lights%20and%20energetic%20atmosphere%2C%20soft%20warm%20brown%20and%20gold%20tones%2C%20clean%20minimal%20background%2C%20editorial%20music%20photography%20high%20detail&width=120&height=120&seq=music-newworld&orientation=squarish";
const musicBoyWithLuv = "https://readdy.ai/api/search-image?query=Colorful%20and%20cheerful%20pop%20album%20cover%20with%20pastel%20warm%20tones%20and%20soft%20pink%20clouds%2C%20romantic%20atmosphere%2C%20clean%20minimal%20background%2C%20editorial%20music%20photography%20high%20detail&width=120&height=120&seq=music-boywithluv&orientation=squarish";
const musicCelebrity = "https://readdy.ai/api/search-image?query=Dreamy%20and%20ethereal%20album%20cover%20with%20soft%20warm%20lavender%20and%20golden%20light%2C%20contemplative%20mood%2C%20clean%20minimal%20background%2C%20editorial%20music%20photography%20high%20detail&width=120&height=120&seq=music-celebrity&orientation=squarish";
const musicBoyfriend = "https://readdy.ai/api/search-image?query=Cool%20urban%20pop%20album%20cover%20with%20neon%20warm%20lights%20and%20city%20nightscape%20reflections%2C%20romantic%20atmosphere%2C%20soft%20warm%20brown%20and%20orange%20tones%2C%20clean%20minimal%20background%2C%20editorial%20music%20photography%20high%20detail&width=120&height=120&seq=music-boyfriend&orientation=squarish";
const musicNayaNa = "https://readdy.ai/api/search-image?query=Warm%20vintage%20pop%20album%20cover%20with%20retro%20microphone%20and%20warm%20amber%20stage%20lights%2C%20nostalgic%20mood%2C%20soft%20warm%20brown%20and%20gold%20tones%2C%20clean%20minimal%20background%2C%20editorial%20music%20photography%20high%20detail&width=120&height=120&seq=music-nayana&orientation=squarish";
const musicSoIPlayed = "https://readdy.ai/api/search-image?query=Indie%20rock%20album%20cover%20with%20electric%20guitar%20and%20warm%20sunset%20sky%20background%2C%20passionate%20atmosphere%2C%20soft%20warm%20brown%20and%20orange%20tones%2C%20clean%20minimal%20background%2C%20editorial%20music%20photography%20high%20detail&width=120&height=120&seq=music-soiplayed&orientation=squarish";
const musicRainAndYou = "https://readdy.ai/api/search-image?query=Sentimental%20ballad%20album%20cover%20with%20rainy%20window%20and%20warm%20indoor%20light%20reflections%2C%20melancholic%20atmosphere%2C%20soft%20warm%20brown%20and%20blue%20tones%2C%20clean%20minimal%20background%2C%20editorial%20music%20photography%20high%20detail&width=120&height=120&seq=music-rainandyou&orientation=squarish";
const musicLoveDive = "https://readdy.ai/api/search-image?query=Elegant%20pop%20album%20cover%20with%20underwater%20warm%20light%20rays%20and%20bubbles%2C%20dreamy%20atmosphere%2C%20soft%20warm%20brown%20and%20teal%20tones%2C%20clean%20minimal%20background%2C%20editorial%20music%20photography%20high%20detail&width=120&height=120&seq=music-lovedive&orientation=squarish";
const musicFirework = "https://readdy.ai/api/search-image?query=Summer%20festival%20album%20cover%20with%20warm%20fireworks%20and%20night%20sky%20reflections%20on%20water%2C%20joyful%20atmosphere%2C%20soft%20warm%20brown%20and%20orange%20tones%2C%20clean%20minimal%20background%2C%20editorial%20music%20photography%20high%20detail&width=120&height=120&seq=music-firework&orientation=squarish";

// Video thumbnails (per spot)
const vidGyeongbokMV = "https://readdy.ai/api/search-image?query=Korean%20palace%20main%20courtyard%20with%20traditional%20roof%20and%20stone%20path%2C%20cinematic%20music%20video%20still%2C%20warm%20golden%20sunlight%2C%20soft%20warm%20brown%20tones%2C%20clean%20editorial%20background%2C%20high%20detail&width=300&height=160&seq=vid-gyeongbok-mv&orientation=landscape";
const vidGyeongbokBehind = "https://readdy.ai/api/search-image?query=Film%20production%20crew%20and%20cameras%20at%20Korean%20palace%20location%2C%20warm%20documentary%20style%20photography%2C%20soft%20warm%20brown%20tones%2C%20clean%20background%2C%20high%20detail&width=300&height=160&seq=vid-gyeongbok-behind&orientation=landscape";
const vidGyeongbokFan = "https://readdy.ai/api/search-image?query=Young%20fans%20visiting%20Korean%20palace%20with%20smartphones%20and%20cameras%2C%20warm%20candid%20photography%20style%2C%20soft%20warm%20brown%20tones%2C%20clean%20natural%20background%2C%20high%20detail&width=300&height=160&seq=vid-gyeongbok-fan&orientation=landscape";

const vidGwanghwamunMV = "https://readdy.ai/api/search-image?query=Modern%20Seoul%20city%20plaza%20with%20statue%20and%20traffic%2C%20cinematic%20music%20video%20still%2C%20warm%20evening%20light%2C%20soft%20warm%20brown%20and%20beige%20tones%2C%20clean%20urban%20background%2C%20high%20detail&width=300&height=160&seq=vid-gwanghwamun-mv&orientation=landscape";
const vidGwanghwamunBehind = "https://readdy.ai/api/search-image?query=Film%20crew%20filming%20in%20busy%20Seoul%20city%20square%2C%20warm%20documentary%20photography%2C%20soft%20warm%20brown%20tones%2C%20clean%20background%2C%20high%20detail&width=300&height=160&seq=vid-gwanghwamun-behind&orientation=landscape";
const vidGwanghwamunFan = "https://readdy.ai/api/search-image?query=Crowd%20of%20fans%20walking%20through%20Seoul%20plaza%20with%20camera%20phones%2C%20warm%20candid%20photography%2C%20soft%20warm%20brown%20tones%2C%20clean%20urban%20background%2C%20high%20detail&width=300&height=160&seq=vid-gwanghwamun-fan&orientation=landscape";

const vidBukchonMV = "https://readdy.ai/api/search-image?query=Traditional%20Korean%20hanok%20village%20alley%20with%20wooden%20doors%2C%20cinematic%20music%20video%20still%2C%20warm%20afternoon%20light%2C%20soft%20warm%20brown%20tones%2C%20clean%20editorial%20background%2C%20high%20detail&width=300&height=160&seq=vid-bukchon-mv&orientation=landscape";
const vidBukchonBehind = "https://readdy.ai/api/search-image?query=Camera%20crew%20filming%20in%20narrow%20Korean%20traditional%20village%20street%2C%20warm%20documentary%20photography%2C%20soft%20warm%20brown%20tones%2C%20clean%20background%2C%20high%20detail&width=300&height=160&seq=vid-bukchon-behind&orientation=landscape";
const vidBukchonFan = "https://readdy.ai/api/search-image?query=Visitors%20walking%20through%20Korean%20hanok%20alley%20taking%20photos%2C%20warm%20candid%20photography%2C%20soft%20warm%20brown%20tones%2C%20clean%20natural%20background%2C%20high%20detail&width=300&height=160&seq=vid-bukchon-fan&orientation=landscape";

const vidNamsanMV = "https://readdy.ai/api/search-image?query=Seoul%20tower%20and%20city%20skyline%20at%20sunset%2C%20cinematic%20music%20video%20still%2C%20warm%20golden%20light%2C%20soft%20warm%20brown%20and%20orange%20tones%2C%20clean%20panoramic%20background%2C%20high%20detail&width=300&height=160&seq=vid-namsan-mv&orientation=landscape";
const vidNamsanBehind = "https://readdy.ai/api/search-image?query=Film%20production%20on%20mountain%20viewpoint%20with%20Seoul%20city%20backdrop%2C%20warm%20documentary%20photography%2C%20soft%20warm%20brown%20tones%2C%20clean%20background%2C%20high%20detail&width=300&height=160&seq=vid-namsan-behind&orientation=landscape";
const vidNamsanFan = "https://readdy.ai/api/search-image?query=Couple%20taking%20selfie%20at%20Seoul%20tower%20observation%20deck%2C%20warm%20candid%20photography%2C%20soft%20warm%20brown%20tones%2C%20clean%20background%2C%20high%20detail&width=300&height=160&seq=vid-namsan-fan&orientation=landscape";

const vidHanriverMV = "https://readdy.ai/api/search-image?query=Riverside%20park%20with%20sunset%20and%20water%20reflections%2C%20cinematic%20music%20video%20still%2C%20warm%20golden%20light%2C%20soft%20warm%20brown%20and%20blue%20tones%2C%20clean%20natural%20background%2C%20high%20detail&width=300&height=160&seq=vid-hanriver-mv&orientation=landscape";
const vidHanriverBehind = "https://readdy.ai/api/search-image?query=Film%20crew%20setting%20up%20equipment%20at%20riverside%20park%2C%20warm%20documentary%20photography%2C%20soft%20warm%20brown%20tones%2C%20clean%20background%2C%20high%20detail&width=300&height=160&seq=vid-hanriver-behind&orientation=landscape";
const vidHanriverFan = "https://readdy.ai/api/search-image?query=People%20enjoying%20picnic%20at%20riverside%20park%20with%20city%20view%2C%20warm%20candid%20photography%2C%20soft%20warm%20brown%20tones%2C%20clean%20natural%20background%2C%20high%20detail&width=300&height=160&seq=vid-hanriver-fan&orientation=landscape";

const vidChangdeokgungMV = "https://readdy.ai/api/search-image?query=Traditional%20Korean%20garden%20with%20pond%20and%20pavilion%2C%20cinematic%20music%20video%20still%2C%20warm%20dappled%20sunlight%2C%20soft%20warm%20green%20and%20brown%20tones%2C%20clean%20editorial%20background%2C%20high%20detail&width=300&height=160&seq=vid-changdeokgung-mv&orientation=landscape";
const vidChangdeokgungBehind = "https://readdy.ai/api/search-image?query=Film%20crew%20filming%20at%20Korean%20palace%20garden%20location%2C%20warm%20documentary%20photography%2C%20soft%20warm%20brown%20tones%2C%20clean%20background%2C%20high%20detail&width=300&height=160&seq=vid-changdeokgung-behind&orientation=landscape";
const vidChangdeokgungFan = "https://readdy.ai/api/search-image?query=Visitors%20admiring%20Korean%20palace%20secret%20garden%20scenery%2C%20warm%20candid%20photography%2C%20soft%20warm%20brown%20tones%2C%20clean%20natural%20background%2C%20high%20detail&width=300&height=160&seq=vid-changdeokgung-fan&orientation=landscape";

export const spots: Spot[] = [
  {
    id: "gyeongbokgung",
    name: "경복궁",
    loc: "서울 종로구",
    coord: { lat: 37.5796, lng: 126.977 },
    rating: 4.9,
    reviewCount: 1204,
    type: "drama",
    typeLabel: "드라마",
    size: "tall",
    image: imgGyeongbokgung,
    desc: "조선의 으뜸 궁궐, 사극의 얼굴",
    tags: ["눈물의 여왕", "킹덤", "BTS"],
    info: {
      hours: "09:00 - 18:00",
      hoursNote: "월요일 휴관",
      address: "서울 종로구 사직로 161",
      transport: "3호선 경복궁역 5번 출구 도보 5분",
      phone: "02-3700-3900",
    },
    dramas: [
      { title: "눈물의 여왕", eps: "EP.3 · EP.7", image: dramaQueenTears, play: 0 },
      { title: "킹덤 시즌1", eps: "EP.1 · EP.5", image: dramaKingdom, play: 0 },
    ],
    sceneTitle: "촬영 장면",
    sceneDesc:
      "경복궁 근정전 앞마당에서 밤하늘을 배경으로 한 왕의 등장 신, 그리고 향원정 연못에서 두 주인공이 재회하는 장면이 촬영됐어요.",
    music: [
      { title: "Dynamite", artist: "BTS", image: musicDynamite, tag: "MV 촬영지" },
      { title: "FANCY", artist: "TWICE", image: musicFancy, tag: "댄스 챌린지" },
    ],
    videos: [
      { label: "공식 MV", image: vidGyeongbokMV },
      { label: "촬영 비하인드", image: vidGyeongbokBehind },
      { label: "팬 영상", image: vidGyeongbokFan },
    ],
    reviews: [
      { author: "Sophie M.", flag: "미국", date: "2026.08.12", rating: 5, text: "눈물의 여왕 촬영지를 직접 보니 감동이에요. 수문장 교대식은 꼭 보세요!" },
      { author: "Tanaka R.", flag: "일본", date: "2026.08.04", rating: 5, text: "킹덤에서 봤던 그 경내 그대로네요. 한복 대여하고 다니면 분위기 두 배." },
      { author: "Emily K.", flag: "독일", date: "2026.07.28", rating: 4, text: "아침 일찍 가면 사람 적고 조용해요. 가이드 앱 경로 덕분에 효율적!" },
    ],
  },
  {
    id: "gwanghwamun",
    name: "광화문광장",
    loc: "서울 종로구",
    coord: { lat: 37.572, lng: 126.9766 },
    rating: 4.6,
    reviewCount: 862,
    type: "movie",
    typeLabel: "영화",
    size: "medium",
    image: imgGwanghwamun,
    desc: "서울의 중심, 시위와 축제의 광장",
    tags: ["도깨비", "브이"],
    info: {
      hours: "24시간 개방",
      hoursNote: "연중무휴",
      address: "서울 종로구 세종대로 172",
      transport: "5호선 광화문역 2번 출구 도보 1분",
      phone: "02-120",
    },
    dramas: [
      { title: "도깨비", eps: "EP.1 · EP.2", image: dramaGoblin, play: 0 },
      { title: "브이", eps: "EP.4", image: dramaV, play: 0 },
    ],
    sceneTitle: "촬영 장면",
    sceneDesc:
      "세종대왕 동상 앞에서 도깨비와 은탁이 첫 만남을 가진 유명한 장면. 인파가 많아 새벽 촬영이 많았어요.",
    music: [
      { title: "봄날", artist: "BTS", image: musicSpringDay, tag: "광장 이벤트" },
      { title: "다시 만난 세계", artist: "소녀시대", image: musicNewWorld, tag: "길거리 무대" },
    ],
    videos: [
      { label: "공식 MV", image: vidGwanghwamunMV },
      { label: "비하인드", image: vidGwanghwamunBehind },
      { label: "팬 영상", image: vidGwanghwamunFan },
    ],
    reviews: [
      { author: "Lucas G.", flag: "프랑스", date: "2026.08.20", rating: 5, text: "드라마 장면 따라 걸으니 새로워요. 광화문 야경이 특히 아름다워요." },
      { author: "Mina P.", flag: "스페인", date: "2026.08.09", rating: 4, text: "도깨비 스팟 지도가 정확해요. 근처 카페도 추천해요!" },
    ],
  },
  {
    id: "bukchon",
    name: "북촌한옥마을",
    loc: "서울 종로구",
    coord: { lat: 37.5828, lng: 126.9837 },
    rating: 4.8,
    reviewCount: 975,
    type: "tour",
    typeLabel: "관광지",
    size: "tall",
    image: imgBukchon,
    desc: "골목마다 펼쳐지는 전통 한옥 풍경",
    tags: ["사이코지만 괜찮아", "이태원 클라쓰"],
    info: {
      hours: "상시 개방",
      hoursNote: "골목 안내소 09:00-18:00",
      address: "서울 종로구 계동길 37",
      transport: "3호선 안국역 2번 출구 도보 10분",
      phone: "02-2148-4123",
    },
    dramas: [
      { title: "사이코지만 괜찮아", eps: "EP.2 · EP.5", image: dramaPsycho, play: 0 },
      { title: "이태원 클라쓰", eps: "EP.7", image: dramaItaewon, play: 0 },
    ],
    sceneTitle: "촬영 장면",
    sceneDesc:
      "문태가 문강을 따라 한옥 골목을 걸어가며 대화를 나눈 장면이 이곳에서 촬영됐어요. 붉은 벽돌과 기와 지붕이 인상적이에요.",
    music: [
      { title: "Boy With Luv", artist: "BTS", image: musicBoyWithLuv, tag: "로드 무비" },
      { title: "Celebrity", artist: "아이유", image: musicCelebrity, tag: "콜라보" },
    ],
    videos: [
      { label: "공식 MV", image: vidBukchonMV },
      { label: "비하인드", image: vidBukchonBehind },
      { label: "팬 영상", image: vidBukchonFan },
    ],
    reviews: [
      { author: "Yuki T.", flag: "일본", date: "2026.08.18", rating: 5, text: "한옥 골목이 사진 명소! 아침에 가면 한적해서 좋아요." },
      { author: "Anna D.", flag: "캐나다", date: "2026.07.30", rating: 4, text: "주민 배려로 조용히 다니기. 드라마 장면 가이드가 좋아요." },
    ],
  },
  {
    id: "namsan",
    name: "남산타워",
    loc: "서울 용산구",
    coord: { lat: 37.5512, lng: 126.9882 },
    rating: 4.7,
    reviewCount: 1530,
    type: "kpop",
    typeLabel: "K-POP",
    size: "medium",
    image: imgNamsan,
    desc: "서울 야경의 심장, 자물쇠 언덕",
    tags: ["가디언즈", "하늘의 자물쇠"],
    info: {
      hours: "10:30 - 23:00",
      hoursNote: "전망대 매표 22:30 마감",
      address: "서울 용산구 남산공원길 105",
      transport: "4호선 명동역 3번 출구 → 케이블카",
      phone: "02-3455-9277",
    },
    dramas: [
      { title: "사랑의 불시착", eps: "EP.4", image: dramaCrash, play: 0 },
      { title: "질투의 화신", eps: "EP.9", image: dramaJealousy, play: 0 },
    ],
    sceneTitle: "촬영 장면",
    sceneDesc:
      "정혁과 세리가 남산 전망대에서 도시의 불빛을 내려다보며 이야기를 나눈 장면. 밤 촬영이라 인상적이었어요.",
    music: [
      { title: "Boyfriend", artist: "BIGBANG", image: musicBoyfriend, tag: "야경 무대" },
      { title: "나야 나", artist: "아이유", image: musicNayaNa, tag: "컴백 촬영" },
    ],
    videos: [
      { label: "공식 MV", image: vidNamsanMV },
      { label: "비하인드", image: vidNamsanBehind },
      { label: "팬 영상", image: vidNamsanFan },
    ],
    reviews: [
      { author: "David L.", flag: "영국", date: "2026.08.15", rating: 5, text: "케이블카 타고 올라가는 것만으로도 설레요. 야경 최고!" },
      { author: "Hana K.", flag: "한국", date: "2026.08.02", rating: 4, text: "사랑의 불시착 스팟이에요. 주말은 피하세요." },
    ],
  },
  {
    id: "hanriver",
    name: "한강공원",
    loc: "서울 영등포구",
    coord: { lat: 37.528, lng: 126.933 },
    rating: 4.5,
    reviewCount: 1180,
    type: "kpop",
    typeLabel: "K-POP",
    size: "tall",
    image: imgHanriver,
    desc: "피크닉과 불꽃의 한강",
    tags: ["다이너마이트", "러브 다이브"],
    info: {
      hours: "상시 개방",
      hoursNote: "일부 시설 09:00-22:00",
      address: "서울 영등포구 여의동로 330",
      transport: "5호선 여의나루역 2번 출구",
      phone: "02-3780-0511",
    },
    dramas: [
      { title: "프로듀사", eps: "EP.6", image: dramaGoblin, play: 0 },
      { title: "스타트업", eps: "EP.12", image: dramaStartup, play: 0 },
    ],
    sceneTitle: "촬영 장면",
    sceneDesc:
      "저녁 노을이 지는 한강 둔치에서 피크닉을 즐기는 그룹 장면이 촬영됐어요. 돗자리와 조명 세트가 인상적이었죠.",
    music: [
      { title: "Dynamite", artist: "BTS", image: musicDynamite, tag: "불꽃 행사" },
      { title: "LOVE DIVE", artist: "IVE", image: musicLoveDive, tag: "여름 축제" },
    ],
    videos: [
      { label: "공식 MV", image: vidHanriverMV },
      { label: "비하인드", image: vidHanriverBehind },
      { label: "팬 영상", image: vidHanriverFan },
    ],
    reviews: [
      { author: "Peter W.", flag: "호주", date: "2026.08.11", rating: 5, text: "치킨이랑 라면 먹는 피크닉 문화 최고! 노을 질 때가 황금 시간." },
      { author: "Jiyeon P.", flag: "한국", date: "2026.07.25", rating: 4, text: "여름엔 야시장도 열려요. MV 장면 따라 걷기 좋아요." },
    ],
  },
  {
    id: "changdeokgung",
    name: "창덕궁",
    loc: "서울 종로구",
    coord: { lat: 37.5795, lng: 126.991 },
    rating: 4.8,
    reviewCount: 720,
    type: "drama",
    typeLabel: "드라마",
    size: "medium",
    image: imgChangdeokgung,
    desc: "유네스코 세계유산 비원의 정취",
    tags: ["옷소매", "짝사랑"],
    info: {
      hours: "09:00 - 17:30",
      hoursNote: "월요일 휴관",
      address: "서울 종로구 율곡로 99",
      transport: "3호선 안국역 3번 출구 도보 5분",
      phone: "02-762-9513",
    },
    dramas: [
      { title: "옷소매 붉은 끝동", eps: "EP.3 · EP.9", image: dramaRedSleeve, play: 0 },
      { title: "더 킹", eps: "EP.5", image: dramaKing, play: 0 },
    ],
    sceneTitle: "촬영 장면",
    sceneDesc:
      "비원의 부용정 앞 연못에서 왕과 궁녀가 얽힌 장면이 촬영됐어요. 가을 단풍이 가장 아름다워요.",
    music: [
      { title: "그래서 나는 음악을 했어", artist: "새소년", image: musicSoIPlayed, tag: "산책 테마" },
      { title: "비와 당신", artist: "박효신", image: musicRainAndYou, tag: "수묵화 무드" },
    ],
    videos: [
      { label: "공식 MV", image: vidChangdeokgungMV },
      { label: "비하인드", image: vidChangdeokgungBehind },
      { label: "팬 영상", image: vidChangdeokgungFan },
    ],
    reviews: [
      { author: "Sofia R.", flag: "이탈리아", date: "2026.08.16", rating: 5, text: "비원 가이드 투어 꼭 예약하세요. 한국 정원의 정수를 봤어요." },
      { author: "Minho C.", flag: "한국", date: "2026.07.20", rating: 4, text: "옷소매 촬영지라 드라마팬에게 추천! 조용하고 아름다워요." },
    ],
  },
];

export const spotGradientMap: Record<string, string> = {
  drama: "linear-gradient(158deg,#7a3d28,#c96a42)",
  kpop: "linear-gradient(158deg,#7a2f5e,#c85f8e)",
  movie: "linear-gradient(158deg,#5b4936,#b59a78)",
  tour: "linear-gradient(158deg,#2f5e4f,#5fb493)",
};