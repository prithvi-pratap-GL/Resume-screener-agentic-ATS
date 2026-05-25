import { BrowserRouter, Routes, Route } from 'react-router-dom';
// import Sidebar from './layout/Sidebar';
import Sidebar from "./components/layout/Sidebar";
import Dashboard from './components/dashboard/Dashboard';
import UploadPage from './components/screening/UploadPage';
import CandidatesPage from './components/candidates/CandidatesPage';
import RolesPage from './components/roles/RolesPage';
import ScoringConfig from './components/roles/ScoringConfig';
import ReportsPage from './components/reports/ReportsPage';
import SettingsPage from './components/settings/SettingsPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          <Routes>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/upload"        element={<UploadPage />} />
            <Route path="/candidates"    element={<CandidatesPage />} />
            <Route path="/roles"         element={<RolesPage />} />
            <Route path="/roles/:roleId/scoring" element={<ScoringConfig />} />
            <Route path="/reports"       element={<ReportsPage />} />
            <Route path="/settings"      element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}