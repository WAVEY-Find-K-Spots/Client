import { useLocation, useNavigate } from "react-router-dom";
import { Compass, Route, BadgeCheck, User, type LucideIcon } from "lucide-react";

interface TabItem {
  key: string;
  label: string;
  icon: LucideIcon;
  path: string;
  match: (p: string) => boolean;
}

const tabs: TabItem[] = [
  {
    key: "spots",
    label: "스팟",
    icon: Compass,
    path: "/",
    match: (p) => p === "/" || p.startsWith("/spot"),
  },
  {
    key: "route",
    label: "루트",
    icon: Route,
    path: "/route",
    match: (p) => p === "/route",
  },
  {
    key: "stamp",
    label: "스탬프",
    icon: BadgeCheck,
    path: "/stamp",
    match: (p) => p === "/stamp",
  },
  {
    key: "mypage",
    label: "마이페이지",
    icon: User,
    path: "/mypage",
    match: (p) => p === "/mypage",
  },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="absolute z-40 bottom-[22px] left-1/2 -translate-x-1/2 w-[340px] h-[60px] rounded-[30px] bg-ink shadow-nav flex items-center justify-around px-2"
      aria-label="하단 내비게이션"
    >
      {tabs.map((tab) => {
        const active = tab.match(pathname);
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => navigate(tab.path)}
            className="flex flex-col items-center justify-center h-full w-[68px] cursor-pointer whitespace-nowrap"
            aria-current={active ? "page" : undefined}
          >
            <span className="flex items-center justify-center w-5 h-5">
              <Icon
                size={20}
                strokeWidth={active ? 2.2 : 1.8}
                color={active ? "#A8623E" : "#7B6B64"}
              />
            </span>
            <span
              className="text-[10px] font-medium leading-none mt-[3px]"
              style={{ color: active ? "#A8623E" : "#7B6B64" }}
            >
              {tab.label}
            </span>
            <span
              className="h-1 w-1 rounded-full mt-[3px]"
              style={{
                backgroundColor: active ? "#A8623E" : "transparent",
              }}
            />
          </button>
        );
      })}
    </nav>
  );
}