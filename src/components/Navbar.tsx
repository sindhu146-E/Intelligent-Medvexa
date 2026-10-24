import React, { useState } from 'react';
import { 
  Shield, 
  FileText, 
  Camera, 
  BookOpen, 
  MessageSquare, 
  Mic, 
  AlertTriangle, 
  Info, 
  LayoutDashboard, 
  Menu, 
  X, 
  Database, 
  User, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { ActivePage } from '../types';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activePage, setActivePage }) => {
  const { profile, role, connectionStatus, openAuthModal, openConnectModal, isPharmacist } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems: { id: ActivePage; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'landing', label: 'Home', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'scanner', label: 'Rx Scanner', icon: <FileText className="w-4 h-4" />, badge: 'Core' },
    { id: 'photo_scanner', label: 'Pill Photo', icon: <Camera className="w-4 h-4" /> },
    { id: 'catalog', label: 'Catalog', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'chatbot', label: 'Clinical AI', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'voice', label: 'Voice (EN/TA)', icon: <Mic className="w-4 h-4 text-cyan-400" />, badge: 'தமிழ்' },
    { id: 'safety_report', label: 'Safety Report', icon: <AlertTriangle className="w-4 h-4 text-amber-400" /> },
    { id: 'about_privacy', label: 'About & RLS', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActivePage('landing')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 shadow-md shadow-cyan-500/20">
              <Shield className="w-5 h-5 text-white" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                <span className="text-[8px] font-bold text-slate-950">Rx</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-100 tracking-tight">Medivexa</span>
                <span className="text-xs px-1.5 py-0.5 rounded font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  AI
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-400 font-medium">
                Intelligent Medicine. Safer Decisions.
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 shadow-sm border border-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/50">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2.5">
            {/* Supabase Status Pill */}
            <button
              onClick={openConnectModal}
              title={connectionStatus.isConnected ? 'Connected to Supabase Project' : 'Using Local Encrypted Storage. Click to Connect Supabase.'}
              className={`hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                connectionStatus.isConnected
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-cyan-500 hover:text-cyan-300'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{connectionStatus.isConnected ? 'Supabase Connected' : 'Supabase Setup'}</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionStatus.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
            </button>

            {/* User Profile / Role Trigger */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900 text-xs text-slate-200 transition-colors"
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isPharmacist ? 'bg-cyan-500 text-slate-950' : 'bg-slate-700 text-slate-200'
                }`}>
                  {profile.full_name ? profile.full_name.charAt(0) : 'U'}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="font-medium text-slate-200 truncate max-w-[110px]">{profile.full_name}</span>
                  <span className="text-[10px] text-cyan-400 capitalize">{role}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-xl py-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-semibold text-slate-200">{profile.full_name}</p>
                    <p className="text-[11px] text-slate-400">{profile.email}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
                        {role}
                      </span>
                      {profile.license_number && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {profile.license_number}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        openConnectModal();
                      }}
                      className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Database className="w-3.5 h-3.5 text-cyan-400" />
                      Supabase Project Settings
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        openAuthModal();
                      }}
                      className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      Sign In / Switch Account
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActivePage(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                activePage === item.id
                  ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openConnectModal();
              }}
              className="w-full text-left px-3 py-2 text-xs text-cyan-300 flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              Configure Supabase Database & Storage
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
