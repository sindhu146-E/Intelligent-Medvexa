import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  Key, 
  CheckCircle2, 
  FileText, 
  Server, 
  ShieldAlert, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ActivePage } from '../types';

interface AboutPrivacyViewProps {
  setActivePage: (page: ActivePage) => void;
}

export const AboutPrivacyView: React.FC<AboutPrivacyViewProps> = ({ setActivePage }) => {
  const { connectionStatus, openConnectModal } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopySchemaPath = () => {
    navigator.clipboard?.writeText('/supabase-schema.sql');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tables = [
    {
      name: 'profiles',
      purpose: 'Linked to Supabase auth.users. Stores name, email, verified role (pharmacist, doctor, patient), and pharmacy license numbers.',
      security: 'Users can only view and update their own profile. Authenticated pharmacists have audit read access.'
    },
    {
      name: 'prescription_analyses',
      purpose: 'Stores patient demographic metadata, doctor details, private file storage paths, extraction status, and pharmacist review sign-offs.',
      security: 'Protected by RLS: auth.uid() = user_id. Public anonymous access is completely blocked.'
    },
    {
      name: 'prescription_items',
      purpose: 'Maintains normalized list of prescribed medications, dosage instructions, extraction confidence (Clearly Extracted, Uncertain, Not Visible), and verification flags.',
      security: 'Accessible only via parent analysis authorization. Pharmacists can modify verification flags.'
    },
    {
      name: 'medicine_catalog',
      purpose: 'Formulary repository containing trusted source references (FDA, WHO, National Formulary), drug classes, interactions, and known LASA sound-alike confusion pairs.',
      security: 'Read-only access for reference checks. Write operations restricted to administrative pharmacists.'
    },
    {
      name: 'safety_alerts',
      purpose: 'Dynamic Look-Alike Sound-Alike (LASA) safety hazards, drug-drug interaction warnings, and pharmacist acknowledgement audit trails.',
      security: 'Confined to the analysis owner and verifying healthcare professionals.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Lock className="w-7 h-7 text-cyan-400" />
            <span>Medivexa AI Architecture & Security Governance</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Row Level Security (RLS) enforcement, private encrypted storage, and clinical audit compliance.
          </p>
        </div>

        <button
          onClick={openConnectModal}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 text-xs font-semibold rounded-xl flex items-center gap-2 self-start sm:self-auto"
        >
          <Database className="w-4 h-4" />
          <span>{connectionStatus.isConnected ? 'Supabase Connected' : 'Connect Supabase'}</span>
        </button>
      </div>

      {/* Security Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">PostgreSQL Row Level Security</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Every table enforces strict RLS. Patient records are segregated by UUID; anonymous users cannot read, list, or tamper with private clinical data.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">Private Storage Bucket</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Prescriptions are stored in a non-public bucket (<code className="text-cyan-300">prescriptions</code>) with folder isolation (<code className="text-cyan-300">user_id/*</code>). No public URLs are ever generated.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Server className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white text-sm">Zero Client-Side Secret Leakage</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Service-role keys and Gemini API secrets remain server-side. Frontend clients only interact via the public anon key and authenticated session tokens.
          </p>
        </div>
      </div>

      {/* Database Schema Overview */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <span>Five Protected Foundation Tables</span>
            </h2>
            <p className="text-xs text-slate-400">
              Defined in <code className="text-cyan-300">/supabase-schema.sql</code> with safe migration guards and triggers.
            </p>
          </div>

          <button
            onClick={handleCopySchemaPath}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 self-start sm:self-auto"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copied ? 'Copied path' : 'Copy SQL Schema Path'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tables.map((t, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-cyan-400 text-sm">{t.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                  RLS Active
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{t.purpose}</p>
              <div className="pt-1.5 border-t border-slate-900 text-[11px] text-slate-400 flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{t.security}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Audit Resolution Review */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Security Audit Fix Verification</span>
        </h2>
        <p className="text-xs text-slate-400">
          The two pre-existing security warnings identified during database scoping were resolved as follows:
        </p>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/40 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Resolved: Storage Bucket Public Exposure Warning</span>
            </div>
            <p className="text-slate-300">
              The <code className="text-cyan-300">prescriptions</code> bucket is created with <code className="text-cyan-300">public = false</code>. Storage RLS policies ensure file downloads and uploads strictly require <code className="text-cyan-300">auth.uid() = storage.foldername(name)[1]</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/40 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Resolved: Prescription Analysis Insert/Update Policy Tightening</span>
            </div>
            <p className="text-slate-300">
              Insert operations on <code className="text-cyan-300">prescription_analyses</code> explicitly enforce <code className="text-cyan-300">WITH CHECK (auth.uid() = user_id)</code> preventing cross-tenant data injection.
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Notice of Clinical Intent:</strong> Medivexa AI is engineered as an auxiliary clinical decision support tool for registered pharmacists, physicians, and medical institutions. It does not replace professional pharmaceutical verification. Every prescription must be validated before dispensing.
        </p>
      </div>
    </div>
  );
};
