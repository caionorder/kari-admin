import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CampaignList from './pages/Campaigns/CampaignList';
import CampaignForm from './pages/Campaigns/CampaignForm';
import CampaignDetail from './pages/Campaigns/CampaignDetail';
import ParticipantList from './pages/Participants/ParticipantList';
import VotingDashboard from './pages/Voting/VotingDashboard';
import WinnerManagement from './pages/Winners/WinnerManagement';
import ContentManagement from './pages/Content/ContentManagement';
import AboutKariEditor from './pages/Content/AboutKariEditor';
import UserManagement from './pages/Users/UserManagement';
import TestimonialList from './pages/Testimonials/TestimonialList';
import TestimonialForm from './pages/Testimonials/TestimonialForm';
import TestimonialDetail from './pages/Testimonials/TestimonialDetail';

// Import styles
import './styles/admin.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Private Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Campaigns Routes */}
              <Route path="campaigns" element={<CampaignList />} />
              <Route path="campaigns/new" element={<CampaignForm />} />
              <Route path="campaigns/:id" element={<CampaignDetail />} />
              <Route path="campaigns/:id/edit" element={<CampaignForm />} />
              
              {/* Participants Routes */}
              <Route path="participants" element={<ParticipantList />} />
              
              {/* Voting Routes */}
              <Route path="voting" element={<VotingDashboard />} />
              
              {/* Winners Routes */}
              <Route path="winners" element={<WinnerManagement />} />
              
              {/* Testimonials Routes */}
              <Route path="testimonials" element={<TestimonialList />} />
              <Route path="testimonials/new" element={<TestimonialForm />} />
              <Route path="testimonials/:id" element={<TestimonialDetail />} />
              <Route path="testimonials/:id/edit" element={<TestimonialForm />} />
              
              {/* Content Routes */}
              <Route path="content" element={<ContentManagement />} />
              <Route path="content/about-kari" element={<AboutKariEditor />} />
              
              {/* Users Routes */}
              <Route path="users" element={<UserManagement />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
