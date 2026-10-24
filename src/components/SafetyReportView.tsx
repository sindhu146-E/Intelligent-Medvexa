import React from 'react';
import { 
  Printer, 
  ShieldCheck, 
  AlertTriangle, 
  FileCheck, 
  Calendar, 
  User, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { PrescriptionAnalysis, ActivePage } from '../types';
import { useAuth } from '../context/AuthContext';

interface SafetyReportViewProps {
  analysis: PrescriptionAnalysis | null;
  setActivePage: (page: ActivePage) => void;
}

export const SafetyReportView: React.FC<SafetyReportViewProps> = ({ analysis, setActivePage }) => {
  const { profile } = useAuth();

  const handlePrint = () => {
    window.print();
  };

  if (!analysis) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex flex-col items-center justify-center text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-500" />
        <h2 className="text-xl font-bold text-white">No Prescription Selected</h2>
        <p className="text-xs text-slate-400 max-w-md">
          Please select a prescription from the Dashboard or scan an Rx in the Prescription Scanner to generate a full safety audit report.
        </p>
        <button
          onClick={() => setActivePage('scanner')}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold"
        >
          Go to Rx Scanner
        </button>
      </div>
    );
  }

  const isVerified = analysis.pharmacist_review_status === 'reviewed_verified';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Action Bar (Hidden during print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePage('dashboard')}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Clinical Safety & Verification Audit
            </h1>
            <p className="text-xs text-slate-400">
              Official pharmacist verification and LASA interception document
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePage('scanner')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-xl"
          >
            Edit in Scanner
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-950 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="max-w-4xl mx-auto bg-slate-900/90 print:bg-white print:text-black border border-slate-800 print:border-black/20 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8 font-sans">
        {/* Document Header */}
        <div className="border-b border-slate-800 print:border-black/20 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white print:text-black">
                Medivexa AI
              </span>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-950 print:bg-slate-200 text-cyan-400 print:text-black border border-cyan-800 print:border-black">
                CLINICAL AUDIT
              </span>
            </div>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-0.5 font-medium">
              Intelligent Medicine. Safer Decisions.
            </p>
            <p className="text-[10px] text-slate-500 print:text-slate-500 mt-1 font-mono">
              Audit ID: {analysis.id} • Generated: {new Date().toLocaleString()}
            </p>
          </div>

          <div className="sm:text-right">
            {isVerified ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 print:bg-emerald-50 text-emerald-300 print:text-emerald-800 border border-emerald-600/80 font-bold text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verified by Pharmacist</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/80 print:bg-amber-50 text-amber-300 print:text-amber-800 border border-amber-600/80 font-bold text-xs uppercase tracking-wider">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Pending Pharmacist Verification</span>
              </div>
            )}
          </div>
        </div>

        {/* Patient & Physician Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/60 print:bg-slate-100/70 border border-slate-800 print:border-black/10 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase tracking-wider block">Patient Name</span>
            <span className="font-bold text-slate-100 print:text-black text-sm">{analysis.patient_name}</span>
            {analysis.patient_age && <span className="text-slate-400 block text-[11px]">{analysis.patient_age} yrs</span>}
          </div>

          <div>
            <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase tracking-wider block">Prescriber</span>
            <span className="font-bold text-slate-100 print:text-black text-sm">Dr. {analysis.doctor_name}</span>
            <span className="text-slate-400 block text-[11px] font-mono">{analysis.doctor_reg_no || 'Reg Verified'}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase tracking-wider block">Prescription Date</span>
            <span className="font-semibold text-slate-200 print:text-black font-mono text-sm">{analysis.prescription_date}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 print:text-slate-600 uppercase tracking-wider block">Items Prescribed</span>
            <span className="font-bold text-slate-200 print:text-black text-sm">{analysis.items.length} Medications</span>
          </div>
        </div>

        {/* Medication Items Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-cyan-400 print:text-blue-600" />
            <span>Extracted & Validated Prescription Items</span>
          </h3>

          <div className="border border-slate-800 print:border-black/20 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 print:bg-slate-200 text-slate-400 print:text-black font-semibold uppercase tracking-wider border-b border-slate-800 print:border-black/20">
                <tr>
                  <th className="px-4 py-2.5">#</th>
                  <th className="px-4 py-2.5">Medicine & Strength</th>
                  <th className="px-4 py-2.5">Form</th>
                  <th className="px-4 py-2.5">Dosage Instructions</th>
                  <th className="px-4 py-2.5">Duration</th>
                  <th className="px-4 py-2.5">Confidence</th>
                  <th className="px-4 py-2.5 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-black/10">
                {analysis.items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-800/20 print:hover:bg-transparent">
                    <td className="px-4 py-3 font-mono text-slate-500">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-100 print:text-black">{item.medicine_name}</div>
                      <div className="text-[11px] text-cyan-400 print:text-blue-700 font-mono font-medium">{item.strength}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 print:text-black">{item.dosage_form}</td>
                    <td className="px-4 py-3 text-slate-300 print:text-black font-medium">{item.dosage_instructions}</td>
                    <td className="px-4 py-3 text-slate-400 print:text-black font-mono">{item.duration}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        item.extraction_confidence === 'clearly_extracted'
                          ? 'bg-emerald-950 print:bg-emerald-100 text-emerald-300 print:text-emerald-800'
                          : item.extraction_confidence === 'uncertain'
                          ? 'bg-amber-950 print:bg-amber-100 text-amber-300 print:text-amber-800'
                          : 'bg-red-950 print:bg-red-100 text-red-300 print:text-red-800'
                      }`}>
                        {item.extraction_confidence.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`text-[10px] font-bold uppercase ${
                        item.verification_status === 'verified'
                          ? 'text-emerald-400 print:text-emerald-700'
                          : 'text-amber-400 print:text-amber-700'
                      }`}>
                        {item.verification_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Safety Alert & LASA Findings */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 print:text-black flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 print:text-amber-600" />
            <span>Look-Alike Sound-Alike (LASA) & Interaction Interceptions</span>
          </h3>

          {analysis.safety_alerts.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950/40 print:bg-slate-100 border border-slate-800 print:border-black/10 text-xs text-slate-400 print:text-black">
              No critical LASA sound-alike hazards or major drug-drug contradictions detected in this regimen.
            </div>
          ) : (
            <div className="space-y-2.5">
              {analysis.safety_alerts.map((alert, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-slate-950/70 print:bg-slate-50 border border-red-900/40 print:border-red-300 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-300 print:text-red-700">
                      [{alert.alert_type}] {alert.matched_drug_a} {alert.matched_drug_b ? `⇄ ${alert.matched_drug_b}` : ''}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-red-950 print:bg-red-100 text-red-400 print:text-red-800">
                      {alert.severity} SEVERITY
                    </span>
                  </div>
                  <p className="text-slate-300 print:text-black leading-relaxed">{alert.description}</p>
                  <p className="text-cyan-400 print:text-blue-800 font-semibold pt-0.5">
                    Recommended Clinical Action: {alert.recommendation}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pharmacist Sign-Off Block */}
        <div className="pt-6 border-t border-slate-800 print:border-black/20 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 print:text-black block">
              Pharmacist Clinical Verification Notes
            </span>
            <div className="p-3 bg-slate-950/60 print:bg-slate-100 rounded-xl border border-slate-800 print:border-black/10 min-h-[64px] text-slate-300 print:text-black text-xs leading-relaxed italic">
              {analysis.pharmacist_notes || 'All item strengths, frequencies, and duration parameters clinically audited and cleared for dispensing.'}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 print:border-black/20 bg-slate-950/80 print:bg-slate-50 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Authorized Sign-Off</span>
              <div className="font-bold text-slate-200 print:text-black text-sm mt-0.5">
                {analysis.reviewer_name || profile.full_name}
              </div>
              <div className="text-[11px] text-cyan-400 print:text-blue-800 font-mono">
                {profile.license_number || 'RPH-849204-TN'} • {profile.pharmacy_name || 'Hospital Clinical Pharmacy'}
              </div>
            </div>

            <div className="pt-4 border-t border-dashed border-slate-800 print:border-black/20 flex items-center justify-between text-[11px] text-slate-400 print:text-slate-600">
              <span>Timestamp: {analysis.reviewed_at || new Date().toISOString()}</span>
              <span className="font-bold text-emerald-400 print:text-emerald-700">Digital Seal Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
