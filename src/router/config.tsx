import type { RouteObject } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import NotFound from "@/pages/NotFound";
import SpotList from "@/pages/home/page";
import SpotDetail from "@/pages/detail/page";
import RouteTab from "@/pages/route/page";
import StampTab from "@/pages/stamp/page";
import MyPage from "@/pages/mypage/page";
import LoginPage from "@/pages/login/page";
import WelcomePage from "@/pages/welcome/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <SpotList /> },
      { path: "welcome", element: <WelcomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "spot/:id", element: <SpotDetail /> },
      { path: "route", element: <RouteTab /> },
      { path: "stamp", element: <StampTab /> },
      { path: "mypage", element: <MyPage /> },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;