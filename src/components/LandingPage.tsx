import React from 'react';
import { 
  FileText, 
  Camera, 
  AlertTriangle, 
  Mic, 
  BookOpen, 
  MessageSquare, 
  CheckCircle2, 
  Lock, 
  Sparkles,
  ArrowRight,
  Database
} from 'lucide-react';
import { ActivePage } from '../types';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  setActivePage: (page: ActivePage) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActivePage }) => {
  const { connectionStatus, openConnectModal } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Glow ambient background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/20 via-blue-600/15 to-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Medivexa AI Platform — Version 2.4 Ready</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
              Intelligent Medicine.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
                Safer Decisions.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Clinical-grade prescription extraction, automated Look-Alike Sound-Alike (LASA) safety checks, and pharmacist-in-the-loop verification protecting patient care at every step.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setActivePage('scanner')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-900/50 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <FileText className="w-4 h-4" />
                <span>Scan Prescription</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActivePage('voice')}
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 text-slate-200 font-semibold text-sm flex items-center gap-2 transition-all"
              >
                <Mic className="w-4 h-4 text-cyan-400" />
                <span>Voice Assistant (தமிழ் / EN)</span>
              </button>

              <button
                onClick={() => setActivePage('dashboard')}
                className="px-5 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-sm font-medium transition-all"
              >
                View Dashboard
              </button>
            </div>

            {/* Supabase Banner Notice */}
            <div className="pt-4">
              <div className="inline-flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 border border-slate-800 px-3.5 py-1.5 rounded-lg">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  Supabase database foundation:{' '}
                  <strong className={connectionStatus.isConnected ? 'text-emerald-400' : 'text-slate-200'}>
                    {connectionStatus.isConnected ? 'Connected & Protecting Records' : 'Active with RLS local parity'}
                  </strong>
                </span>
                {!connectionStatus.isConnected && (
                  <button
                    onClick={openConnectModal}
                    className="ml-2 text-cyan-400 hover:underline font-semibold"
                  >
                    Connect Project
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid: 6 Core Capabilities */}
      <section className="py-12 bg-slate-900/50 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Integrated Clinical Modules
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl mx-auto">
              Nine interconnected tools engineered for precision dispensing, error interception, and patient education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Prescription Scanner */}
            <div 
              onClick={() => setActivePage('scanner')}
              className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer hover:shadow-xl hover:shadow-cyan-950/30 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg text-slate-100 group-hover:text-cyan-300 transition-colors">
                    Prescription Scanner
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800">
                    Pending Verification
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mt-2">
                  Upload handwritten or typed doctor prescriptions. Categorizes field confidence into Clearly Extracted, Uncertain, or Not Visible with pharmacist review confirmation.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-medium">
                <span>Start Rx extraction</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 2: Medicine Photo Scanner */}
            <div 
              onClick={() => setActivePage('photo_scanner')}
              className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer hover:shadow-xl hover:shadow-cyan-950/30 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-105 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-slate-100 group-hover:text-blue-300 transition-colors">
                  Medicine Photo Scanner
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mt-2">
                  Snap strips, pill blisters, or syrup cartons. Extracts active salts, brand names, manufacturers, batch numbers, and standard precautions.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-blue-400 font-medium">
                <span>Scan medicine package</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 3: LASA & Safety Engine */}
            <div 
              onClick={() => setActivePage('safety_report')}
              className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer hover:shadow-xl hover:shadow-amber-950/30 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 transition-transform">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-slate-100 group-hover:text-amber-300 transition-colors">
                  LASA Safety Interception
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mt-2">
                  Live detection of Look-Alike Sound-Alike drug pairs (e.g. Celebrex vs Celexa, Hydralazine vs Hydroxyzine) to prevent life-threatening dispensing blunders.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-amber-400 font-medium">
                <span>Generate safety audit</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 4: Voice Assistant (EN / Tamil) */}
            <div 
              onClick={() => setActivePage('voice')}
              className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer hover:shadow-xl hover:shadow-cyan-950/30 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-105 transition-transform">
                  <Mic className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg text-slate-100 group-hover:text-indigo-300 transition-colors">
                    Voice Assistant
                  </h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    English & தமிழ்
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mt-2">
                  Speak medication queries in English or Tamil. Features speech recognition with review-before-sending and speech synthesis audio playback.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-medium">
                <span>Try voice assistant</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 5: Medicine Catalog */}
            <div 
              onClick={() => setActivePage('catalog')}
              className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer hover:shadow-xl hover:shadow-cyan-950/30 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-950/80 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-slate-100 group-hover:text-teal-300 transition-colors">
                  Clinical Drug Catalog
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mt-2">
                  Search trusted monographs grounded in FDA, WHO, and National Formulary references with indications, adverse effects, and interaction matrix.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-teal-400 font-medium">
                <span>Browse formulary</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Card 6: AI Clinical Consultation */}
            <div 
              onClick={() => setActivePage('chatbot')}
              className="group p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer hover:shadow-xl hover:shadow-cyan-950/30 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg text-slate-100 group-hover:text-purple-300 transition-colors">
                  AI Consultation Assistant
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed mt-2">
                  Ask clinical questions, verify dosage calculations, check contraindications, and review patient discharge instructions safely.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-purple-400 font-medium">
                <span>Launch medical chat</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Compliance Pledge */}
      <section className="py-12 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-900 to-cyan-950/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                <Lock className="w-4 h-4" />
                <span>Clinical Governance & Privacy Guarantee</span>
              </div>
              <h3 className="text-xl font-bold text-white">
                Zero Autonomous Verification. Pharmacist-In-The-Loop.
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                All prescription extractions are strictly held under <span className="text-amber-400 font-medium">PENDING PHARMACIST VERIFICATION</span> until an authenticated licensed pharmacist verifies strength, directions, and cross-references LASA hazards. Patient files are safeguarded in private owner-only buckets via PostgreSQL Row Level Security (RLS).
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={() => setActivePage('about_privacy')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                Inspect RLS Architecture
              </button>
              <button
                onClick={() => setActivePage('scanner')}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-950 transition-colors"
              >
                Scan a Prescription
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
