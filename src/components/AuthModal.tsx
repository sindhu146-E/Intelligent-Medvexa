import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSupabase } from '../lib/supabase';
import { UserRole } from '../types';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    isConnectModalOpen, 
    closeConnectModal,
    connectionStatus,
    connectSupabaseCredentials,
    disconnectSupabase,
    profile,
    switchRole
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'connect'>('connect');
  const [supabaseUrl, setSupabaseUrl] = useState(connectionStatus.url || '');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('pharmacist');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isAuthModalOpen && !isConnectModalOpen) return null;

  const handleConnectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter both Supabase Project URL and Anon Public Key.' });
      return;
    }
    try {
      connectSupabaseCredentials(supabaseUrl.trim(), supabaseKey.trim());
      setStatusMessage({ type: 'success', text: 'Supabase credentials saved! Client initialized.' });
      setTimeout(() => {
        closeConnectModal();
        closeAuthModal();
      }, 1000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to initialize Supabase client.' });
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const supabase = getSupabase();
    if (!supabase) {
      setStatusMessage({ 
        type: 'error', 
        text: 'Supabase is not configured yet. Connect your Supabase project in the "Connect Project" tab.' 
      });
      setIsSubmitting(false);
      return;
    }

    try {
      if (activeTab === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });
        if (error) throw error;
        setStatusMessage({ type: 'success', text: 'Signed in successfully!' });
        setTimeout(() => closeAuthModal(), 1200);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: selectedRole,
              license_number: selectedRole === 'pharmacist' ? licenseNumber.trim() : null
            }
          }
        });
        if (error) throw error;
        setStatusMessage({ 
          type: 'success', 
          text: data.session ? 'Account created and signed in!' : 'Account created! Please check your email to confirm.' 
        });
        setTimeout(() => closeAuthModal(), 1500);
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Authentication failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySqlNotice = () => {
    setCopiedSql(true);
    navigator.clipboard?.writeText(
      `-- Medivexa AI Supabase schema is available in /supabase-schema.sql in the project root.`
    );
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-950 border border-cyan-500/30 rounded-lg text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-lg">
                Medivexa AI Database & Auth
              </h3>
              <p className="text-xs text-slate-400">
                Supabase secure clinical cloud integration
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              closeAuthModal();
              closeConnectModal();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('connect')}
            className={`pb-3 px-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'connect'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            Supabase Project
            {connectionStatus.isConnected && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('signin')}
            className={`pb-3 px-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'signin'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Sign In
          </button>

          <button
            onClick={() => setActiveTab('signup')}
            className={`pb-3 px-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'signup'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Register Account
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {statusMessage && (
            <div
              className={`mb-5 p-3.5 rounded-xl flex items-start gap-3 text-sm border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : 'bg-red-950/40 border-red-500/40 text-red-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">{statusMessage.text}</div>
            </div>
          )}

          {activeTab === 'connect' && (
            <form onSubmit={handleConnectSubmit} className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
                <div className="flex items-center justify-between text-cyan-400 font-medium">
                  <span>Supabase Connection Status:</span>
                  <span className={connectionStatus.isConnected ? 'text-emerald-400 flex items-center gap-1.5' : 'text-amber-400'}>
                    {connectionStatus.isConnected ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" /> Connected
                      </>
                    ) : (
                      'Local Fallback Mode Active'
                    )}
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  Medivexa AI persists all prescription scans, pharmacist modifications, and safety alerts securely. When your Supabase credentials are configured, data saves directly into your protected Supabase tables with RLS and the private storage bucket.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Supabase Project URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Supabase Anon (Public) Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500 font-mono"
                />
                <span className="block mt-1 text-[11px] text-slate-500">
                  Never use the service-role key. Only use the public `anon` key.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleCopySqlNotice}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{copiedSql ? 'Schema Reference Copied' : 'Schema file: /supabase-schema.sql'}</span>
                </button>

                <div className="flex gap-2">
                  {connectionStatus.isConnected && (
                    <button
                      type="button"
                      onClick={disconnectSupabase}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-red-950/50 hover:text-red-300 border border-slate-700 text-slate-300 text-sm rounded-xl transition-colors"
                    >
                      Disconnect
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-cyan-900/40 transition-colors"
                  >
                    Save & Connect
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Active Clinical Role Simulation
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {(['pharmacist', 'doctor', 'patient'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => switchRole(r)}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                        profile.role === r
                          ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-950/40'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="capitalize">{r}</div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        {r === 'pharmacist' ? 'Full verification' : r === 'doctor' ? 'Prescriber review' : 'Patient view'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {activeTab === 'signin' && (
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="pharmacist@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl shadow-lg shadow-cyan-900/40 transition-colors"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In to Medivexa AI'}
              </button>

              <p className="text-center text-xs text-slate-400 pt-2">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('signup')}
                  className="text-cyan-400 hover:underline font-medium"
                >
                  Create one now
                </button>
              </p>
            </form>
          )}

          {activeTab === 'signup' && (
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Dr. S. Priya, PharmD"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="priya.pharmacist@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Clinical Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['pharmacist', 'doctor', 'patient'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`p-2 rounded-xl border text-xs font-medium text-center transition-all ${
                        selectedRole === r
                          ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="capitalize">{r}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedRole === 'pharmacist' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Pharmacy Registration / License Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RPH-49201-TN"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium text-sm rounded-xl shadow-lg shadow-cyan-900/40 transition-colors"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
