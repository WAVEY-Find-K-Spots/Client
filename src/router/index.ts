import { useNavigate, type NavigateFunction } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App as CapacitorApp } from "@capacitor/app";
import { Browser } from "@capacitor/browser";
import routes from "./config";

let navigateResolver: (navigate: ReturnType<typeof useNavigate>) => void;

declare global {
  interface Window {
    REACT_APP_NAVIGATE: ReturnType<typeof useNavigate>;
  }
}

export const navigatePromise = new Promise<NavigateFunction>((resolve) => {
  navigateResolver = resolve;
});

export function AppRoutes() {
  const element = useRoutes(routes);
  const navigate = useNavigate();
  useEffect(() => {
    window.REACT_APP_NAVIGATE = navigate;
    navigateResolver(window.REACT_APP_NAVIGATE);
  });

  // Handles the wavey://oauth/callback?code=... deep link the system browser
  // returns to after a native social login (see Client #69 / Server #122).
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listenerPromise = CapacitorApp.addListener("appUrlOpen", ({ url }) => {
      const deepLink = new URL(url);
      if (deepLink.protocol !== "wavey:" || deepLink.hostname !== "oauth") return;

      Browser.close().catch(() => {});
      navigate(`/oauth/callback${deepLink.search}`, { replace: true });
    });

    return () => {
      listenerPromise.then((listener) => listener.remove());
    };
  }, [navigate]);

  return element;
}
