import { Route, Routes } from 'react-router';
import { ROUTES } from './const.js'

import HomePage from './pages/HomePage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import SettingPage from './pages/SettingPage.jsx';
import OthersAppsPage from './pages/OtherAppsPage.jsx';
import CodeRefPage from './pages/CodeRefPage.jsx';

import './App.css'

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.HISTORY} element={<HistoryPage />} />
      <Route path={ROUTES.SETTINGS} element={<SettingPage />} />
      <Route path={ROUTES.OTHER_APPS} element={<OthersAppsPage />} />
      <Route path={ROUTES.CODE_REF} element={<CodeRefPage />} />
    </Routes>
  );
}
