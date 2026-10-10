import { Link } from 'react-router-dom';
import { PoselyLogo } from '../ui/PoselyLogo';
import { Camera, Sparkles, Heart } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="bg-[#08080C] text-stone-400 border-t border-white/5 pt-16 pb-12 font-sans select-none">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Col (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <PoselyLogo size="lg" showSubtitle subtitle="AI Photography Pose Assistant" />

            <p className="text-sm text-stone-400 max-w-sm leading-relaxed">
              Posely provides real-time skeletal tracking, anatomical pose directives, and high-fidelity photo grading for portrait and editorial photographers worldwide.
            </p>

            <div className="flex items-center gap-2 pt-2 text-xs font-mono text-purple-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>POSELY VISION ENGINE v4.2 · ACTIVE</span>
            </div>
          </div>

          {/* Studio Tools (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Studio Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/upload" className="hover:text-white transition-colors">
                  Live Viewfinder
                </Link>
              </li>
              <li>
                <Link to="/presets" className="hover:text-white transition-colors">
                  Pose Presets
                </Link>
              </li>
              <li>
                <Link to="/templates" className="hover:text-white transition-colors">
                  Lighting Templates
                </Link>
              </li>
              <li>
                <Link to="/studio" className="hover:text-white transition-colors">
                  Batch Processor
                </Link>
              </li>
            </ul>
          </div>

          {/* Features (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#demo" className="hover:text-white transition-colors">
                  Interactive Demo
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Pose Library
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Pricing Plans
                </a>
              </li>
            </ul>
          </div>

          {/* Directing Protocol (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Directing Engine
            </h4>
            <div className="p-4 rounded-2xl bg-[#12121A] border border-[#222230] text-xs font-mono space-y-2 text-stone-400">
              <div className="flex justify-between">
                <span>Joint Detection:</span>
                <span className="text-white">32 Coordinates</span>
              </div>
              <div className="flex justify-between">
                <span>Directing Latency:</span>
                <span className="text-emerald-400">&lt; 80 ms</span>
              </div>
              <div className="flex justify-between">
                <span>Format Support:</span>
                <span className="text-white">RAW, JPG, MP4, HDMI</span>
              </div>
              <div className="flex justify-between">
                <span>Color Science:</span>
                <span className="text-purple-400">Cinematic LUTs</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400 gap-4">
          <p>© {new Date().getFullYear()} Posely AI Inc. Built for professional photographers.</p>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#pricing" className="hover:text-white transition-colors">Terms of Service</a>
            <span className="text-stone-400">Pose better. Shoot better.</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
