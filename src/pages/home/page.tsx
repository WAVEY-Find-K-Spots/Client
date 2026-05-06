
import { Hero } from './components/Hero';
import { FeaturedRoutes } from './components/FeaturedRoutes';
import { RecommendedSpots } from './components/RecommendedSpots';
import { TrendingContent } from './components/TrendingContent';
import { Navbar } from './components/Navbar';
import { BottomNav } from '../../components/feature/BottomNav';
import { StatusBar } from '../../components/feature/StatusBar';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white pb-36">
      <StatusBar />
      <Navbar />
      <div className="pt-24">
        <Hero />
        <FeaturedRoutes />
        <RecommendedSpots />
        <TrendingContent />
      </div>
      <BottomNav />
    </div>
  );
}
