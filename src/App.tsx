import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Results from './pages/Results';
import Enhanced from './pages/Enhanced';
import Templates from './pages/Templates';
import Presets from './pages/Presets';
import StudioBatch from './pages/StudioBatch';
import UpscaleTest from './pages/UpscaleTest';
import SegmentationTest from './pages/SegmentationTest';
import AuthPage from './pages/AuthPage';
import AuthModal from './components/auth/AuthModal';
import { AuthProvider } from './context/AuthContext';

function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#0B0B0F] text-white font-sans selection:bg-purple-600 selection:text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto w-full relative">
        <div className="max-w-[1400px] mx-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Standalone Auth Pages */}
          <Route path="/login" element={<AuthPage initialMode="login" />} />
          <Route path="/signup" element={<AuthPage initialMode="signup" />} />
          <Route path="/register" element={<AuthPage initialMode="signup" />} />

          {/* Studio Dashboard & Creation Routes */}
          <Route path="/dashboard" element={<StudioLayout><Home /></StudioLayout>} />
          <Route path="/upload" element={<StudioLayout><Upload /></StudioLayout>} />
          <Route path="/results" element={<StudioLayout><Results /></StudioLayout>} />
          <Route path="/enhanced" element={<StudioLayout><Enhanced /></StudioLayout>} />
          <Route path="/edit" element={<StudioLayout><Enhanced /></StudioLayout>} />
          <Route path="/studio" element={<StudioLayout><StudioBatch /></StudioLayout>} />
          <Route path="/batch" element={<StudioLayout><StudioBatch /></StudioLayout>} />
          <Route path="/studio-batch" element={<StudioLayout><StudioBatch /></StudioLayout>} />
          <Route path="/templates" element={<StudioLayout><Templates /></StudioLayout>} />
          <Route path="/presets" element={<StudioLayout><Presets /></StudioLayout>} />
          <Route path="/studio-presets" element={<StudioLayout><Presets /></StudioLayout>} />
          <Route path="/upscale-test" element={<StudioLayout><UpscaleTest /></StudioLayout>} />
          <Route path="/debug/upscale" element={<StudioLayout><UpscaleTest /></StudioLayout>} />
          <Route path="/segmentation-test" element={<StudioLayout><SegmentationTest /></StudioLayout>} />
          <Route path="/debug/segmentation" element={<StudioLayout><SegmentationTest /></StudioLayout>} />
          <Route path="/segment" element={<StudioLayout><SegmentationTest /></StudioLayout>} />
        </Routes>
        
        {/* Global Auth Modal overlay */}
        <AuthModal />
      </Router>
    </AuthProvider>
  );
}

