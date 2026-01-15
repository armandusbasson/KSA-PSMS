import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
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
import { NotFound } from './pages/NotFound';
import './index.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sites" element={<SiteList />} />
          <Route path="/sites/new" element={<SiteForm />} />
          <Route path="/sites/:id" element={<SiteDetail />} />
          <Route path="/sites/:id/edit" element={<SiteForm />} />
          <Route path="/staff" element={<StaffList />} />
          <Route path="/meetings" element={<MeetingList />} />
          <Route path="/meetings/new" element={<MeetingForm />} />
          <Route path="/meetings/:id" element={<MeetingDetail />} />
          <Route path="/meetings/:id/edit" element={<MeetingForm />} />
          <Route path="/contracts" element={<ContractsList />} />
          <Route path="/contracts/create" element={<ContractForm />} />
          <Route path="/contracts/:id/view" element={<ContractDetail />} />
          <Route path="/contracts/:id/edit" element={<ContractForm />} />
          <Route path="/supply-contracts" element={<SupplyContractsList />} />
          <Route path="/supply-contracts/create" element={<SupplyContractForm />} />
          <Route path="/supply-contracts/:id/view" element={<ContractDetail />} />
          <Route path="/supply-contracts/:id/edit" element={<SupplyContractForm />} />
          <Route path="/fleet" element={<FleetList />} />
          <Route path="/fleet/create" element={<FleetForm />} />
          <Route path="/fleet/:registrationPlate" element={<FleetDetail />} />
          <Route path="/fleet/:registrationPlate/edit" element={<FleetForm />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
