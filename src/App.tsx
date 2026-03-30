import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Portal from './pages/Portal';
import CamperAuth from './pages/camper/CamperAuth';
import CamperLayout from './pages/camper/CamperLayout';
import AdminLayout from './pages/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import DashboardOverview from './pages/admin/DashboardOverview';
import CampsManager from './pages/admin/CampsManager';
import RegistrationsManager from './pages/admin/RegistrationsManager';
import TimelineManager from './pages/admin/TimelineManager';
import GalleryManager from './pages/admin/GalleryManager';
import ContactManager from './pages/admin/ContactManager';
import QRScanner from './pages/admin/QRScanner';
import CabinsManager from './pages/admin/CabinsManager';
import CabinAssigner from './pages/admin/CabinAssigner';
import ItineraryManager from './pages/admin/ItineraryManager';
import RegisterPage from './pages/RegisterPage';
import MedicalFormPage from './pages/MedicalFormPage';
import SuccessPage from './pages/SuccessPage';
import { ToastProvider } from './components/ui/Toast';
import { ConfirmDialogProvider } from './components/ui/ConfirmDialog';
import { AuthProvider } from './lib/auth';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmDialogProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/portal/login" element={<CamperAuth />} />
            <Route path="/portal" element={<CamperLayout />}>
              <Route index element={<Portal />} />
            </Route>
            <Route path="/ficha-medica/:id" element={<MedicalFormPage />} />
            <Route path="/confirmado" element={<SuccessPage />} />
            <Route path="/registro/:id" element={<RegisterPage />} />
            {/* Rutas de Administración */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardOverview />} />
              <Route path="campamentos" element={<CampsManager />} />
              <Route path="cabanas" element={<CabinsManager />} />
              <Route path="cabanas/asignacion" element={<CabinAssigner />} />
              <Route path="reservaciones" element={<RegistrationsManager />} />
              <Route path="scanner" element={<QRScanner />} />
              <Route path="timeline" element={<TimelineManager />} />
              <Route path="galeria" element={<GalleryManager />} />
              <Route path="contacto" element={<ContactManager />} />
              <Route path="itinerario" element={<ItineraryManager />} />
            </Route>
          </Routes>
        </BrowserRouter>
        </ConfirmDialogProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

