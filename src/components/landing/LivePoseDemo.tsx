import { useState } from 'react';
import { Button } from '../ui/UIElements';
import { Sparkles, Star, CheckCircle2, AlertCircle, Camera, Sliders } from 'lucide-react';

interface PoseData {
  id: string;
  name: string;
  category: string;
  image: string;
  score: number;
  focal: string;
  analysis: {
    head: { status: 'good' | 'adjust'; detail: string };
    shoulders: { status: 'good' | 'adjust'; detail: string };
    hands: { status: 'good' | 'adjust'; detail: string };
    body: { status: 'good' | 'adjust'; detail: string };
  };
  recommendation: string;
  skeletonSvg: {
    lines: Array<{ x1: number; y1: number; x2: number; y2: number }>;
    nodes: Array<{ cx: number; cy: number; r: number; label?: string }>;
  };
}

const DEMO_POSES: PoseData[] = [
  {
    id: 'pose-1',
    name: 'Standing Quarter-Turn',
    category: 'Editorial & Studio',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
    score: 94,
    focal: '85mm · f/1.4 · ISO 100',
    analysis: {
      head: { status: 'good', detail: 'Centered, 0.0° lateral tilt' },
      shoulders: { status: 'adjust', detail: 'Lower left shoulder 8mm' },
      hands: { status: 'adjust', detail: 'Draw right hand to waist seam' },
      body: { status: 'good', detail: '30° quarter-turn angle locked' },
    },
    recommendation: 'Rotate torso 5° toward key light. Rest right forearm lightly against waist seam.',
    skeletonSvg: {
      lines: [
        { x1: 250, y1: 130, x2: 250, y2: 195 },
        { x1: 195, y1: 205, x2: 305, y2: 195 },
        { x1: 195, y1: 205, x2: 165, y2: 295 },
        { x1: 165, y1: 295, x2: 180, y2: 380 },
        { x1: 305, y1: 195, x2: 330, y2: 280 },
        { x1: 330, y1: 280, x2: 310, y2: 365 },
        { x1: 215, y1: 380, x2: 285, y2: 375 },
      ],
      nodes: [
        { cx: 250, cy: 130, r: 5, label: 'Chin Level' },
        { cx: 195, cy: 205, r: 4, label: 'Shoulder L' },
        { cx: 305, cy: 195, r: 4, label: 'Shoulder R' },
        { cx: 165, cy: 295, r: 3.5 },
        { cx: 330, cy: 280, r: 3.5 },
        { cx: 180, cy: 380, r: 4 },
        { cx: 310, cy: 365, r: 4 },
      ],
    },
  },
  {
    id: 'pose-2',
    name: 'Seated Editorial Contrapposto',
    category: 'Commercial Lookbook',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=85',
    score: 97,
    focal: '50mm · f/2.0 · ISO 200',
    analysis: {
      head: { status: 'good', detail: 'Chin up +2° catchlight aligned' },
      shoulders: { status: 'good', detail: 'Natural 15° diagonal cascade' },
      hands: { status: 'good', detail: 'Fingers relaxed, no tension' },
      body: { status: 'good', detail: 'Spine elongated, hips offset' },
    },
    recommendation: 'Perfect composition. Hold expression and capture burst sequence.',
    skeletonSvg: {
      lines: [
        { x1: 250, y1: 140, x2: 245, y2: 200 },
        { x1: 190, y1: 205, x2: 300, y2: 195 },
        { x1: 190, y1: 205, x2: 175, y2: 290 },
        { x1: 175, y1: 290, x2: 195, y2: 370 },
        { x1: 300, y1: 195, x2: 325, y2: 285 },
        { x1: 215, y1: 380, x2: 285, y2: 380 },
      ],
      nodes: [
        { cx: 250, cy: 140, r: 5, label: 'Catchlight Lock' },
        { cx: 190, cy: 205, r: 4 },
        { cx: 300, cy: 195, r: 4 },
        { cx: 175, cy: 290, r: 3.5 },
        { cx: 325, cy: 285, r: 3.5 },
        { cx: 195, cy: 370, r: 4 },
      ],
    },
  },
  {
    id: 'pose-3',
    name: 'Dynamic Motion Walk',
    category: 'Runway & Street Style',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=85',
    score: 89,
    focal: '35mm · f/2.8 · ISO 400',
    analysis: {
      head: { status: 'good', detail: 'Eyes locked on camera lens' },
      shoulders: { status: 'good', detail: 'Relaxed natural swing' },
      hands: { status: 'adjust', detail: 'Separate fingers slightly' },
      body: { status: 'adjust', detail: 'Lengthen forward stride +10cm' },
    },
    recommendation: 'Lengthen step for coat drape flare. Keep gaze centered on lens axis.',
    skeletonSvg: {
      lines: [
        { x1: 250, y1: 120, x2: 250, y2: 190 },
        { x1: 195, y1: 195, x2: 305, y2: 195 },
        { x1: 195, y1: 195, x2: 160, y2: 280 },
        { x1: 305, y1: 195, x2: 335, y2: 280 },
        { x1: 220, y1: 370, x2: 280, y2: 370 },
      ],
      nodes: [
        { cx: 250, cy: 120, r: 5, label: 'Gaze Focus' },
        { cx: 195, cy: 195, r: 4 },
        { cx: 305, cy: 195, r: 4 },
        { cx: 160, cy: 280, r: 3.5 },
        { cx: 335, cy: 280, r: 3.5 },
      ],
    },
  },
];

export default function LivePoseDemo() {
  const [selectedPoseId, setSelectedPoseId] = useState<string>('pose-1');
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);

  const current = DEMO_POSES.find((p) => p.id === selectedPoseId) || DEMO_POSES[0];

  return (
    <section id="demo" className="py-20 md:py-28 bg-[#0D0D14] text-white border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/60 text-purple-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Interactive Pose Engine</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white">
              See vision AI directing in action.
            </h2>
            <p className="text-stone-400 text-sm md:text-base max-w-xl">
              Switch through studio poses to see real-time anatomical analysis, joint tracking coordinates, and automated directorial guidance.
            </p>
          </div>

          {/* Pose Selector Tabs & Skeleton Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-[#161622] border border-[#2B2B38] p-1 rounded-xl flex items-center">
              {DEMO_POSES.map((pose) => (
                <button
                  key={pose.id}
                  onClick={() => setSelectedPoseId(pose.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                    selectedPoseId === pose.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {pose.name.split(' ')[0]}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowSkeleton(!showSkeleton)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                showSkeleton
                  ? 'bg-purple-950/80 text-purple-300 border-purple-700/80'
                  : 'bg-[#161622] text-stone-400 border-[#2B2B38] hover:text-white'
              }`}
            >
              Skeleton: {showSkeleton ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Viewfinder with Live AI Overlay */}
          <div className="lg:col-span-7 rounded-3xl bg-[#14141E] border border-[#262635] p-4 sm:p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between text-xs text-stone-400">
              <span className="font-bold text-white">{current.name}</span>
              <span className="font-mono">{current.focal}</span>
            </div>

            <div className="relative aspect-[4/5] rounded-2xl bg-black overflow-hidden border border-white/10">
              <img
                src={current.image}
                alt={current.name}
                className="w-full h-full object-cover"
              />

              {/* Glowing Skeleton Overlay */}
              {showSkeleton && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 500 500"
                  preserveAspectRatio="xMidYMid meet"
                >
                  {/* Lines */}
                  {current.skeletonSvg.lines.map((l, i) => (
                    <line
                      key={i}
                      x1={l.x1}
                      y1={l.y1}
                      x2={l.x2}
                      y2={l.y2}
                      stroke="#A78BFA"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      opacity="0.9"
                    />
                  ))}

                  {/* Nodes */}
                  {current.skeletonSvg.nodes.map((n, i) => (
                    <g key={i}>
                      <circle
                        cx={n.cx}
                        cy={n.cy}
                        r={n.r}
                        fill="#8B5CF6"
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                      {n.label && (
                        <text
                          x={n.cx + 8}
                          y={n.cy + 4}
                          fill="#FFFFFF"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          {n.label}
                        </text>
                      )}
                    </g>
                  ))}
                </svg>
              )}

              {/* HUD Tags */}
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>32 PTS DETECTED</span>
              </div>

              <div className="absolute top-4 right-4 bg-purple-600/90 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1 shadow-lg">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                <span>{current.score}% Match</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
              <span>CAMERA SENSOR 36×24MM</span>
              <span>SAMPLING 60FPS</span>
            </div>
          </div>

          {/* Right: Directorial Analysis Card */}
          <div className="lg:col-span-5 rounded-3xl bg-[#14141E] border border-[#262635] p-6 sm:p-7 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#252535] pb-4">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block">
                  Pose Evaluation Docket
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {current.name}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black font-display text-white">{current.score}</div>
                <div className="text-[10px] text-stone-400 uppercase tracking-wider">Overall Score</div>
              </div>
            </div>

            {/* Anatomical breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Anatomical Alignment
              </h4>

              {Object.entries(current.analysis).map(([key, val]) => (
                <div
                  key={key}
                  className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    {val.status === 'good' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    )}
                    <span className="font-semibold text-white capitalize">{key}:</span>
                    <span className="text-stone-300">{val.detail}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    val.status === 'good' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                  }`}>
                    {val.status === 'good' ? 'Optimal' : 'Adjust'}
                  </span>
                </div>
              ))}
            </div>

            {/* Automated Directing Cue */}
            <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-800/50 space-y-2">
              <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Automated Directing Voice</span>
              </div>
              <p className="text-sm text-white font-medium leading-relaxed">
                "{current.recommendation}"
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
