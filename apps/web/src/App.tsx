import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BrowsePetsPage } from './pages/BrowsePetsPage';
import { PetDetailPage } from './pages/PetDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { MyApplicationsPage } from './pages/MyApplicationsPage';
import { StaffDashboardPage } from './pages/StaffDashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen">
          <Navbar />
          <main>
            <Routes>
              <Route path="/"                  element={<BrowsePetsPage />} />
              <Route path="/pets/:id"           element={<PetDetailPage />} />
              <Route path="/login"             element={<LoginPage />} />
              <Route path="/register"          element={<RegisterPage />} />
              <Route path="/my-applications"   element={<MyApplicationsPage />} />
              <Route path="/staff"             element={<StaffDashboardPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
