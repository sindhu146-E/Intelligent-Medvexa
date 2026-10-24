import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Camera, 
  Mic, 
  Plus, 
  Search, 
  Eye, 
  Printer, 
  Database,
  UserCheck,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { ActivePage, PrescriptionAnalysis } from '../types';
import { fetchPrescriptionAnalyses } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface DashboardProps {
  setActivePage: (page: ActivePage) => void;
  onSelectAnalysis: (analysis: PrescriptionAnalysis) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActivePage, onSelectAnalysis }) => {
  const { profile, role, isPharmacist, openConnectModal, connectionStatus } = useAuth();
  const [analyses, setAnalyses] = useState<PrescriptionAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified'>('all');

  useEffect(() => {
    loadData();
  }, [profile.id]);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchPrescriptionAnalyses();
    setAnalyses(data);
    setLoading(false);
  };

  const filtered = analyses.filter((a) => {
    const matchesSearch = 
      a.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.doctor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.items.some((item) => item.medicine_name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterStatus === 'pending') return a.pharmacist_review_status === 'pending_verification';
    if (filterStatus === 'verified') return a.pharmacist_review_status === 'reviewed_verified';
    return true;
  });

  const totalScans = analyses.length;
  const pendingCount = analyses.filter((a) => a.pharmacist_review_status === 'pending_verification').length;
  const verifiedCount = analyses.filter((a) => a.pharmacist_review_status === 'reviewed_verified').length;
  const totalAlerts = analyses.reduce((acc, curr) => acc + (curr.safety_alerts?.length || 0), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Clinical Operations Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase">
              {role}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time prescription analysis queue, pharmacist verification audit trails, and safety intercept alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setActivePage('scanner')}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-950/40 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Rx Scan</span>
          </button>

          <button
            onClick={() => setActivePage('photo_scanner')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-colors"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            <span>Pill Photo</span>
          </button>
        </div>
      </div>

      {/* Metrics Counter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scans */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="p-3 bg-blue-950/60 border border-blue-500/20 text-blue-400 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalScans}</div>
            <div className="text-xs text-slate-400">Total Scans Processed</div>
          </div>
        </div>

        {/* Pending Verification */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-900/30 flex items-center gap-4">
          <div className="p-3 bg-amber-950/60 border border-amber-500/20 text-amber-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400">{pendingCount}</div>
            <div className="text-xs text-slate-400">Pending Review</div>
          </div>
        </div>

        {/* Verified by Pharmacist */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-900/30 flex items-center gap-4">
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400">{verifiedCount}</div>
            <div className="text-xs text-slate-400">Verified & Approved</div>
          </div>
        </div>

        {/* Active Safety Alerts */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-red-900/30 flex items-center gap-4">
          <div className="p-3 bg-red-950/60 border border-red-500/20 text-red-400 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">{totalAlerts}</div>
            <div className="text-xs text-slate-400">LASA / Drug Alerts</div>
          </div>
        </div>
      </div>

      {/* Cloud & Governance Status Card */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Database className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-slate-300">
            Database Storage:{' '}
            <strong className={connectionStatus.isConnected ? 'text-emerald-400' : 'text-slate-200'}>
              {connectionStatus.isConnected ? 'Supabase Project Active with RLS' : 'Local Storage Mode'}
            </strong>
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">
            Logged in as: <strong className="text-slate-200">{profile.full_name}</strong> ({profile.role})
          </span>
        </div>
        <button
          onClick={openConnectModal}
          className="text-cyan-400 hover:underline font-medium flex items-center gap-1 self-start sm:self-auto"
        >
          <span>{connectionStatus.isConnected ? 'Manage Connection' : 'Connect Supabase'}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Recent Prescriptions Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Prescription Review Queue</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-normal">
              {filtered.length} records
            </span>
          </h2>

          {/* Search & Filter Controls */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient, doctor, medicine..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-48 sm:w-64"
              />
            </div>

            <div className="flex border border-slate-800 rounded-lg overflow-hidden bg-slate-900 text-xs">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-2.5 py-1.5 transition-colors ${
                  filterStatus === 'all' ? 'bg-slate-800 text-cyan-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('pending')}
                className={`px-2.5 py-1.5 transition-colors ${
                  filterStatus === 'pending' ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('verified')}
                className={`px-2.5 py-1.5 transition-colors ${
                  filterStatus === 'verified' ? 'bg-slate-800 text-emerald-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Verified
              </button>
            </div>
          </div>
        </div>

        {/* Table / List */}
        <div className="border border-slate-800 rounded-2xl bg-slate-900/60 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-sm">
              Loading clinical records...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-slate-400 text-sm">No prescriptions found matching criteria.</p>
              <button
                onClick={() => setActivePage('scanner')}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold"
              >
                Scan First Prescription
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Patient / Doctor</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Medicines Prescribed</th>
                    <th className="px-4 py-3">Verification Status</th>
                    <th className="px-4 py-3">Safety Alerts</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filtered.map((analysis) => {
                    const isPending = analysis.pharmacist_review_status === 'pending_verification';
                    const hasAlerts = (analysis.safety_alerts?.length || 0) > 0;

                    return (
                      <tr key={analysis.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-200">{analysis.patient_name || 'Patient (Unspecified)'}</div>
                          <div className="text-[11px] text-slate-400">Dr. {analysis.doctor_name || 'Prescribing Physician'}</div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-300 font-mono">
                          {analysis.prescription_date}
                        </td>
                        <td className="px-4 py-3.5 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {analysis.items.slice(0, 3).map((item, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 text-[10px]"
                              >
                                {item.medicine_name} {item.strength}
                              </span>
                            ))}
                            {analysis.items.length > 3 && (
                              <span className="text-[10px] text-slate-500 self-center">
                                +{analysis.items.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {isPending ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-950/70 text-amber-300 border border-amber-800/80">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              Pending Verification
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800/80">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Verified by Pharmacist
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {hasAlerts ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-red-950/60 text-red-300 border border-red-800/80">
                              <AlertTriangle className="w-3 h-3 text-red-400" />
                              {analysis.safety_alerts.length} Safety Alert{analysis.safety_alerts.length > 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-slate-500 text-[11px]">No alerts</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              onSelectAnalysis(analysis);
                              setActivePage('scanner');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium border border-slate-700 transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>{isPharmacist && isPending ? 'Verify' : 'View'}</span>
                          </button>

                          <button
                            onClick={() => {
                              onSelectAnalysis(analysis);
                              setActivePage('safety_report');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors inline-flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Report</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
