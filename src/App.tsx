import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { RouteProvider } from "./store/route";
import { StampsProvider } from "./store/stamps";
import { ProfileProvider } from "./store/profile";
import { SettingsProvider } from "./store/settings";
import { NotificationsProvider } from "./store/notifications";
import { AuthProvider } from "./store/auth";


function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter basename={__BASE_PATH__}>
        <AuthProvider>
          <ProfileProvider>
            <SettingsProvider>
              <NotificationsProvider>
                <RouteProvider>
                  <StampsProvider>
                    <AppRoutes />
                  </StampsProvider>
                </RouteProvider>
              </NotificationsProvider>
            </SettingsProvider>
          </ProfileProvider>
        </AuthProvider>
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
