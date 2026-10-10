import { useState } from 'react';
import LandingNav from '../components/landing/LandingNav';
import HeroSection from '../components/landing/HeroSection';
import LivePoseDemo from '../components/landing/LivePoseDemo';
import PhotoDemoGallery from '../components/landing/PhotoDemoGallery';
import HowItWorks from '../components/landing/HowItWorks';
import LiveCameraSection from '../components/landing/LiveCameraSection';
import ForPhotographers from '../components/landing/ForPhotographers';
import AIPoseIntelligence from '../components/landing/AIPoseIntelligence';
import SocialProof from '../components/landing/SocialProof';
import PricingSection from '../components/landing/PricingSection';
import FinalCTA from '../components/landing/FinalCTA';
import LandingFooter from '../components/landing/LandingFooter';
import InteractivePoseModal from '../components/landing/InteractivePoseModal';

export default function LandingPage() {
  const [demoModalOpen, setDemoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white font-sans antialiased selection:bg-purple-600 selection:text-white relative">
      {/* Navigation */}
      <LandingNav onOpenDemo={() => setDemoModalOpen(true)} />

      {/* Hero */}
      <HeroSection onOpenDemo={() => setDemoModalOpen(true)} />

      {/* Live Pose Demo (Section 7) */}
      <LivePoseDemo />

      {/* Photo Demo Gallery (Section 8) */}
      <PhotoDemoGallery />

      {/* How It Works (Section 9) */}
      <HowItWorks />

      {/* Live Camera Section (Section 10) */}
      <LiveCameraSection />

      {/* For Photographers (Section 11) */}
      <ForPhotographers />

      {/* AI Pose Intelligence (Section 12) */}
      <AIPoseIntelligence />

      {/* Social Proof (Section 13) */}
      <SocialProof />

      {/* Pricing Section (Section 14) */}
      <PricingSection />

      {/* Final CTA (Section 14) */}
      <FinalCTA onOpenDemo={() => setDemoModalOpen(true)} />

      {/* Footer (Section 15) */}
      <LandingFooter />

      {/* Interactive Try Posely Modal */}
      <InteractivePoseModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
      />
    </div>
  );
}
