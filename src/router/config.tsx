
import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const SplashPage = lazy(() => import('../pages/splash/page'));
const OnboardingPage = lazy(() => import('../pages/onboarding/page'));
const LoginPage = lazy(() => import('../pages/login/page'));
const HomePage = lazy(() => import('../pages/home/page'));
const MapPage = lazy(() => import('../pages/map/page'));
const CameraPage = lazy(() => import('../pages/camera/page'));
const FavoritesPage = lazy(() => import('../pages/favorites/page'));
const ProfilePage = lazy(() => import('../pages/profile/page'));
const SpotDetailPage = lazy(() => import('../pages/spot/page'));
const RouteCreatePage = lazy(() => import('../pages/route-create/page'));
const RouteDetailPage = lazy(() => import('../pages/route-detail/page'));
const ContentDetailPage = lazy(() => import('../pages/content-detail/page'));
const NotificationsPage = lazy(() => import('../pages/notifications/page'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <SplashPage />,
  },
  {
    path: '/onboarding',
    element: <OnboardingPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/home',
    element: <HomePage />,
  },
  {
    path: '/map',
    element: <MapPage />,
  },
  {
    path: '/camera',
    element: <CameraPage />,
  },
  {
    path: '/favorites',
    element: <FavoritesPage />,
  },
  {
    path: '/profile',
    element: <ProfilePage />,
  },
  {
    path: '/spot/:id',
    element: <SpotDetailPage />,
  },
  {
    path: '/route-create',
    element: <RouteCreatePage />,
  },
  {
    path: '/route-detail/:id',
    element: <RouteDetailPage />,
  },
  {
    path: '/content-detail/:id',
    element: <ContentDetailPage />,
  },
  {
    path: '/notifications',
    element: <NotificationsPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export default routes;
