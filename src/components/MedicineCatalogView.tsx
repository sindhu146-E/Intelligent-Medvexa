import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle, 
  Pill, 
  Filter, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { MedicineCatalogItem, ActivePage } from '../types';
import { INITIAL_MEDICINE_CATALOG } from '../data/medicineCatalog';

interface MedicineCatalogViewProps {
  setActivePage: (page: ActivePage) => void;
}

export const MedicineCatalogView: React.FC<MedicineCatalogViewProps> = ({ setActivePage }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineCatalogItem | null>(
    INITIAL_MEDICINE_CATALOG[0]
  );

  const classes = Array.from(new Set(INITIAL_MEDICINE_CATALOG.map((m) => m.drug_class)));

  const filtered = INITIAL_MEDICINE_CATALOG.filter((m) => {
    const matchesSearch =
      m.medicine_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.generic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.indications.some((ind) => ind.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesClass = selectedClass === 'all' || m.drug_class === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-7 h-7 text-teal-400" />
            <span>Clinical Drug Reference Catalog</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Grounded in FDA Orange Book, WHO Model List of Essential Medicines, and National Formulary references.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-teal-950/60 text-teal-300 border border-teal-800">
            {INITIAL_MEDICINE_CATALOG.length} Verified Monographs
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by brand name, active generic salt, indication (e.g. Celebrex, Metformin, Hypertension)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full sm:w-60 px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Therapeutic Classes</option>
            {classes.map((c) => (
              <option key={c} value={c}>
                {c.length > 38 ? c.substring(0, 38) + '...' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2-Column Layout: Drug List (Left) + Detailed Monograph (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs border border-slate-800 rounded-xl bg-slate-900/50">
              No matching drugs found in formulary.
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = selectedMedicine?.id === item.id;
              const hasLasa = item.lasa_sound_alike_pairs.length > 0;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedMedicine(item)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/80 shadow-md shadow-cyan-950/40'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{item.medicine_name}</span>
                        {hasLasa && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            LASA Alert
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-cyan-400 font-medium mt-0.5">{item.generic_name}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-1">{item.drug_class}</div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-cyan-400 translate-x-1' : 'text-slate-600'}`} />
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {item.strengths.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 text-slate-300 border border-slate-800 font-mono">
                        {s}
                      </span>
                    ))}
                    {item.strengths.length > 3 && (
                      <span className="text-[10px] text-slate-500">+{item.strengths.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Detailed Monograph */}
        <div className="lg:col-span-7">
          {selectedMedicine ? (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
              {/* Header */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedMedicine.medicine_name}</h2>
                    <p className="text-sm text-cyan-400 font-medium">{selectedMedicine.generic_name}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedMedicine.dosage_forms.join(', ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  Class: <span className="text-slate-200">{selectedMedicine.drug_class}</span>
                </p>
              </div>

              {/* LASA Warnings Alert */}
              {selectedMedicine.lasa_sound_alike_pairs.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600/50 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Look-Alike Sound-Alike (LASA) Critical Advisory</span>
                  </div>
                  {selectedMedicine.lasa_sound_alike_pairs.map((lasa, i) => (
                    <div key={i} className="text-slate-300 text-xs pl-6">
                      <strong className="text-amber-200">Confused with: {lasa.confused_with}</strong>
                      <p className="text-[11px] text-slate-300 mt-0.5">{lasa.risk_description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Strengths & Forms */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Available Strengths & Formulations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMedicine.strengths.map((s, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Indications & Contraindications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <h4 className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approved Indications</span>
                  </h4>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {selectedMedicine.indications.map((ind, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500">•</span>
                        <span>{ind}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-slate-950/60 border border-red-950/60 rounded-xl space-y-2">
                  <h4 className="font-semibold text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Contraindications</span>
                  </h4>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {selectedMedicine.contraindications.map((ci, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-red-500">•</span>
                        <span>{ci}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Drug Interactions */}
              {selectedMedicine.interactions.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Known Drug Interactions
                  </h3>
                  <div className="space-y-2">
                    {selectedMedicine.interactions.map((inter, i) => (
                      <div key={i} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-200">
                            + {inter.interacting_drug}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                            inter.severity === 'CRITICAL' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {inter.severity} Risk
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{inter.effect}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Source References */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Trusted clinical sources:</span>
                  <span className="text-slate-300 font-medium">
                    {selectedMedicine.trusted_source_references.join(', ')}
                  </span>
                </div>
                <button
                  onClick={() => setActivePage('scanner')}
                  className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold"
                >
                  Verify in Rx Scanner
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border border-slate-800 rounded-2xl bg-slate-900/40 text-slate-400 text-sm">
              Select a drug to view its full clinical reference monograph.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
