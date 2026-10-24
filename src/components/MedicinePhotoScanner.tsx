import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Info, 
  Pill,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers
} from 'lucide-react';
import { ActivePage } from '../types';
import { analyzePrescriptionSafety } from '../data/lasaDatabase';

interface MedicinePhotoScannerProps {
  setActivePage: (page: ActivePage) => void;
}

interface DetectedMedicineDetails {
  brandName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  manufacturer: string;
  batchNumber: string;
  expiryDate: string;
  indications: string[];
  precautions: string[];
  scheduleClass: string;
  isLasaRisk: boolean;
}

export const MedicinePhotoScanner: React.FC<MedicinePhotoScannerProps> = ({ setActivePage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Detected info
  const [detected, setDetected] = useState<DetectedMedicineDetails | null>({
    brandName: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin and Potassium Clavulanate',
    strength: '500mg Amox + 125mg Clav',
    dosageForm: 'Film-Coated Tablet',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals Ltd',
    batchNumber: 'AUG-2024-8492',
    expiryDate: '11/2026',
    indications: ['Lower respiratory tract infections', 'Acute bacterial sinusitis', 'Skin and skin structure infections'],
    precautions: [
      'Take with food to minimize gastrointestinal intolerance',
      'Complete the full course even if symptoms subside',
      'Contraindicated in patients with severe penicillin anaphylaxis'
    ],
    scheduleClass: 'Schedule H1 Prescription Drug',
    isLasaRisk: false
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select an image file (PNG, JPG, or WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('File size must be under 10MB.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleScan = async () => {
    if (!selectedFile && !previewUrl) {
      setErrorMsg('Please select or capture a photo first.');
      return;
    }

    setIsScanning(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      if (selectedFile) formData.append('image', selectedFile);

      const res = await fetch('/api/identify-medicine', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error('AI service not configured');
      }

      const data = await res.json();
      setDetected(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'AI service not configured');
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Camera className="w-7 h-7 text-cyan-400" />
            <span>Medicine Packaging & Pill Photo Scanner</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visual inspection for blister strips, medicine cartons, pill markings, batch numbers, and expiry verification.
          </p>
        </div>

        <button
          onClick={() => setActivePage('scanner')}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <span>Switch to Rx Scanner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Upload / Camera Photo Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-100 flex items-center justify-between">
              <span>Photo Capture & Upload</span>
              <span className="text-[11px] text-slate-400 font-normal">Package / Tablet</span>
            </h2>

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500 bg-slate-950/60 rounded-xl p-8 text-center cursor-pointer transition-all hover:bg-cyan-950/10 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />
                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:scale-105 transition-all mb-3">
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  Take photo or upload medicine image
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Ensure drug name, strength, and manufacturer text are visible
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center max-h-[380px]">
                  <img
                    src={previewUrl}
                    alt="Medicine Preview"
                    className="object-contain max-h-[380px] w-full"
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 truncate max-w-[200px]">
                    {selectedFile?.name || 'Captured Image'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retake</span>
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-2.5 py-1 text-xs bg-red-950/50 hover:bg-red-900/60 text-red-300 rounded-lg flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-amber-950/60 border border-amber-600/50 rounded-xl text-xs text-amber-200 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>AI service not configured</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Connect `GEMINI_API_KEY` on server for multimodal visual classification. Displaying sample clinical verification below.
                </p>
                <button
                  onClick={handleScan}
                  className="px-3 py-1 bg-amber-900/70 hover:bg-amber-800 text-amber-200 rounded text-xs font-medium flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry Optical Scan</span>
                </button>
              </div>
            )}

            <button
              onClick={handleScan}
              disabled={isScanning}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white font-medium text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-950 transition-colors"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                  <span>Identifying Medicine Visuals...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Verify Medicine Photo</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Detected Pharmacology Details */}
        <div className="lg:col-span-7 space-y-4">
          {detected ? (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{detected.brandName}</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                      {detected.strength}
                    </span>
                  </div>
                  <p className="text-xs text-cyan-400 font-medium mt-0.5">
                    {detected.genericName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {detected.scheduleClass}
                  </span>
                </div>
              </div>

              {/* Grid Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-slate-400 text-[10px] block mb-1">Dosage Form</span>
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{detected.dosageForm}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-slate-400 text-[10px] block mb-1">Manufacturer</span>
                  <div className="font-semibold text-slate-200 truncate" title={detected.manufacturer}>
                    {detected.manufacturer}
                  </div>
                </div>

                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-slate-400 text-[10px] block mb-1">Batch & Expiry</span>
                  <div className="font-semibold text-slate-200 font-mono text-[11px] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{detected.batchNumber} (Exp {detected.expiryDate})</span>
                  </div>
                </div>
              </div>

              {/* Indications */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Approved Indications
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {detected.indications.map((ind, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs border border-slate-700"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>

              {/* Precautions */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Clinical Precautions & Guidance
                </h3>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {detected.precautions.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap gap-3">
                <button
                  onClick={() => setActivePage('catalog')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span>View in Drug Catalog</span>
                </button>

                <button
                  onClick={() => setActivePage('chatbot')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 flex items-center gap-1.5"
                >
                  <span>Ask Clinical Questions</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center border border-slate-800 rounded-2xl bg-slate-900/40 text-slate-400 text-sm">
              Upload a medicine photo to see optical recognition, active salt decomposition, and safety guidance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
