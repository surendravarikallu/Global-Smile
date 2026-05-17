import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PatientOverview from './pages/patient/PatientOverview';
import SmileVisualizer from './pages/patient/SmileVisualizer';
import TourismCalculator from './pages/patient/TourismCalculator';
import TrustChain from './pages/patient/TrustChain';
import Appointments from './pages/patient/Appointments';
import Documents from './pages/patient/Documents';
import Messages from './pages/patient/Messages';
import AdminOverview from './pages/admin/AdminOverview';
import LeadManagement from './pages/admin/LeadManagement';
import PatientManagement from './pages/admin/PatientManagement';
import TrustManagement from './pages/admin/TrustManagement';
import ReferralManagement from './pages/admin/ReferralManagement';
import Settings from './pages/admin/Settings';
import CommunicationTest from './pages/admin/CommunicationTest';
import DentistOverview from './pages/referral/dentist/DentistOverview';
import SpecialistOverview from './pages/referral/specialist/SpecialistOverview';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
            </Route>

            {/* Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Patient Dashboard */}
            <Route path="/patient" element={<DashboardLayout role="patient" />}>
              <Route index element={<PatientOverview />} />
              <Route path="smile-visualizer" element={<SmileVisualizer />} />
              <Route path="tourism-calculator" element={<TourismCalculator />} />
              <Route path="trust-chain" element={<TrustChain />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="documents" element={<Documents />} />
              <Route path="messages" element={<Messages />} />
            </Route>

            {/* Admin Dashboard */}
            <Route path="/admin" element={<DashboardLayout role="admin" />}>
              <Route index element={<AdminOverview />} />
              <Route path="leads" element={<LeadManagement />} />
              <Route path="patients" element={<PatientManagement />} />
              <Route path="trust" element={<TrustManagement />} />
              <Route path="referrals" element={<ReferralManagement />} />
              <Route path="test-hub" element={<CommunicationTest />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Referral Ecosystem */}
            <Route path="/referral/dentist" element={<DashboardLayout role="dentist" />}>
              <Route index element={<DentistOverview />} />
            </Route>
            <Route path="/referral/specialist" element={<DashboardLayout role="specialist" />}>
              <Route index element={<SpecialistOverview />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
