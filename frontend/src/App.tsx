import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { SiteList } from './pages/SiteList';
import { SiteDetail } from './pages/SiteDetail';
import { SiteForm, MeetingForm, ContractForm } from './pages/FormPages';
import { StaffList } from './pages/StaffList';
import { MeetingList } from './pages/MeetingList';
import { MeetingDetail } from './pages/MeetingDetail';
import { ContractsList } from './pages/ContractsList';
import { ContractDetail } from './pages/ContractDetail';
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
