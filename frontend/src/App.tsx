import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { SiteList } from './pages/SiteList';
import { SiteDetail } from './pages/SiteDetail';
import { SiteForm, MeetingForm, ContractForm, SupplyContractForm } from './pages/FormPages';
import { StaffList } from './pages/StaffList';
import { MeetingList } from './pages/MeetingList';
import { MeetingDetail } from './pages/MeetingDetail';
import { ContractsList } from './pages/ContractsList';
import { SupplyContractsList } from './pages/SupplyContractsList';
import { ContractDetail } from './pages/ContractDetail';
import { FleetList } from './pages/FleetList';
import { FleetForm } from './pages/FleetForm';
import { FleetDetail } from './pages/FleetDetail';
import { UserManagement } from './pages/UserManagement';
import { NotFound } from './pages/NotFound';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route - Login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout><Dashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/sites" element={
            <ProtectedRoute>
              <Layout><SiteList /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/sites/new" element={
            <ProtectedRoute>
              <Layout><SiteForm /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/sites/:id" element={
            <ProtectedRoute>
              <Layout><SiteDetail /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/sites/:id/edit" element={
            <ProtectedRoute>
              <Layout><SiteForm /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/staff" element={
            <ProtectedRoute>
              <Layout><StaffList /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/meetings" element={
            <ProtectedRoute>
              <Layout><MeetingList /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/meetings/new" element={
            <ProtectedRoute>
              <Layout><MeetingForm /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/meetings/:id" element={
            <ProtectedRoute>
              <Layout><MeetingDetail /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/meetings/:id/edit" element={
            <ProtectedRoute>
              <Layout><MeetingForm /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/contracts" element={
            <ProtectedRoute>
              <Layout><ContractsList /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/contracts/create" element={
            <ProtectedRoute>
              <Layout><ContractForm /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/contracts/:id/view" element={
            <ProtectedRoute>
              <Layout><ContractDetail /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/contracts/:id/edit" element={
            <ProtectedRoute>
              <Layout><ContractForm /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/supply-contracts" element={
            <ProtectedRoute>
              <Layout><SupplyContractsList /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/supply-contracts/create" element={
            <ProtectedRoute>
              <Layout><SupplyContractForm /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/supply-contracts/:id/view" element={
            <ProtectedRoute>
              <Layout><ContractDetail /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/supply-contracts/:id/edit" element={
            <ProtectedRoute>
              <Layout><SupplyContractForm /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/fleet" element={
            <ProtectedRoute>
              <Layout><FleetList /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/fleet/create" element={
            <ProtectedRoute>
              <Layout><FleetForm /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/fleet/:registrationPlate" element={
            <ProtectedRoute>
              <Layout><FleetDetail /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/fleet/:registrationPlate/edit" element={
            <ProtectedRoute>
              <Layout><FleetForm /></Layout>
            </ProtectedRoute>
          } />
          
          {/* Admin only routes */}
          <Route path="/users" element={
            <ProtectedRoute requiredRole="admin">
              <Layout><UserManagement /></Layout>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
