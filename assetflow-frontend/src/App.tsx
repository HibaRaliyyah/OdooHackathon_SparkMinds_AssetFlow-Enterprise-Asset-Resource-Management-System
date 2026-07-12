import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import AssetList from './pages/assets/AssetList';
import AssetForm from './pages/assets/AssetForm';
import DepartmentList from './pages/departments/DepartmentList';
import EmployeeList from './pages/employees/EmployeeList';
import BookingList from './pages/bookings/BookingList';
import MaintenanceList from './pages/maintenance/MaintenanceList';
import TransferList from './pages/transfers/TransferList';
import Reports from './pages/reports/Reports';
import AIInsights from './pages/ai/AIInsights';
import Notifications from './pages/notifications/Notifications';
import Settings from './pages/settings/Settings';
import AssetDetails from './pages/assets/AssetDetails';
import EmployeeDetails from './pages/employees/EmployeeDetails';
import Audits from './pages/audits/Audits';

// Placeholder for missing pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-48 glass-card">
    <p className="text-slate-400 text-sm font-medium">{title} — Coming soon</p>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Placeholder title="Signup" />} />

            {/* Protected */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="assets" element={<AssetList />} />
              <Route path="assets/new" element={<AssetForm />} />
              <Route path="assets/:id" element={<AssetDetails />} />
              <Route path="assets/:id/edit" element={<Placeholder title="Edit Asset" />} />
              <Route path="assets/:id/qr" element={<AssetDetails />} />
              <Route path="departments" element={<DepartmentList />} />
              <Route path="employees" element={<EmployeeList />} />
              <Route path="employees/:id" element={<EmployeeDetails />} />
              <Route path="categories" element={<Placeholder title="Categories" />} />
              <Route path="bookings" element={<BookingList />} />
              <Route path="maintenance" element={<MaintenanceList />} />
              <Route path="transfers" element={<TransferList />} />
              <Route path="audits" element={<Audits />} />
              <Route path="reports" element={<Reports />} />
              <Route path="ai" element={<AIInsights />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
