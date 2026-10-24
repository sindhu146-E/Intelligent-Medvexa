import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  ShieldAlert, 
  Check, 
  Plus, 
  Save, 
  Sparkles, 
  ZoomIn, 
  ZoomOut,
  FileCheck,
  Printer
} from 'lucide-react';
import { 
  PrescriptionAnalysis, 
  PrescriptionItem, 
  ExtractionConfidence, 
  VerificationStatus,
  ActivePage
} from '../types';
import { analyzePrescriptionSafety } from '../data/lasaDatabase';
import { savePrescriptionAnalysisRecord, updatePharmacistReview, uploadPrescriptionFile } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface PrescriptionScannerProps {
  currentAnalysis: PrescriptionAnalysis | null;
  onAnalysisSaved: (analysis: PrescriptionAnalysis) => void;
  setActivePage: (page: ActivePage) => void;
}

export const PrescriptionScanner: React.FC<PrescriptionScannerProps> = ({
  currentAnalysis,
  onAnalysisSaved,
  setActivePage
}) => {
  const { profile, isPharmacist } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(currentAnalysis?.file_preview_url || null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Analysis status state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Prescription fields
  const [patientName, setPatientName] = useState(currentAnalysis?.patient_name || 'Rajesh Kannan');
  const [patientAge, setPatientAge] = useState(currentAnalysis?.patient_age || 48);
  const [doctorName, setDoctorName] = useState(currentAnalysis?.doctor_name || 'Dr. K. Senthil, MD (Gen Med)');
  const [doctorRegNo, setDoctorRegNo] = useState(currentAnalysis?.doctor_reg_no || 'TNMC-64821');
  const [prescriptionDate, setPrescriptionDate] = useState(
    currentAnalysis?.prescription_date || new Date().toISOString().split('T')[0]
  );

  // Items
  const [items, setItems] = useState<PrescriptionItem[]>(
    currentAnalysis?.items || [
      {
        id: 'item-1',
        medicine_name: 'Celebrex',
        strength: '200mg',
        dosage_form: 'Capsule',
        dosage_instructions: '1 capsule once daily after lunch',
        frequency: 'OD (Once daily)',
        duration: '7 days',
        extraction_confidence: 'clearly_extracted',
        confidence_score: 0.96,
        verification_status: 'unverified'
      },
      {
        id: 'item-2',
        medicine_name: 'Metformin HCl',
        strength: '500mg',
        dosage_form: 'Tablet',
        dosage_instructions: '1 tablet twice daily after meals',
        frequency: 'BD (Twice daily)',
        duration: '30 days',
        extraction_confidence: 'clearly_extracted',
        confidence_score: 0.94,
        verification_status: 'unverified'
      },
      {
        id: 'item-3',
        medicine_name: 'Hydralazine',
        strength: '25mg',
        dosage_form: 'Tablet',
        dosage_instructions: '1 tablet daily at bedtime',
        frequency: 'OD (Once daily)',
        duration: '14 days',
        extraction_confidence: 'uncertain',
        confidence_score: 0.72,
        verification_status: 'unverified',
        notes: 'Handwriting slurred; cross-verify whether Hydroxyzine was intended'
      }
    ]
  );

  // Pharmacist review states
  const [reviewStatus, setReviewStatus] = useState<
    'pending_verification' | 'reviewed_verified' | 'flagged_inconsistent'
  >(currentAnalysis?.pharmacist_review_status || 'pending_verification');
  const [pharmacistNotes, setPharmacistNotes] = useState(
    currentAnalysis?.pharmacist_notes || ''
  );
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Dynamic safety alerts generated based on items
  const safetyAlerts = analyzePrescriptionSafety(items.map((i) => i.medicine_name));

  // File selection handler with type & size validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setAiError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Check type: PNG, JPEG, WEBP, PDF
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setFileError('Invalid file type. Please upload a PNG, JPG, or PDF file.');
      return;
    }

    // Check size: < 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError('File exceeds 10MB limit. Please upload a smaller image.');
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreview(url);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Perform AI Optical & Clinical Extraction
  const handleRunAiAnalysis = async () => {
    if (!selectedFile && !filePreview) {
      setFileError('Please upload an image or prescription document first.');
      return;
    }

    setIsAnalyzing(true);
    setAiError(null);

    try {
      // Call backend route
      const formData = new FormData();
      if (selectedFile) {
        formData.append('prescription', selectedFile);
      }

      const res = await fetch('/api/analyze-prescription', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'AI service not configured');
      }

      const result = await res.json();
      if (result.items && result.items.length > 0) {
        setItems(result.items);
        if (result.patientName) setPatientName(result.patientName);
        if (result.doctorName) setDoctorName(result.doctorName);
        if (result.date) setPrescriptionDate(result.date);
      }
    } catch (err: any) {
      setAiError(err.message || 'AI service not configured');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Update item field
  const handleItemChange = (index: number, field: keyof PrescriptionItem, value: any) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    setItems(next);
  };

  const handleAddItem = () => {
    const newItem: PrescriptionItem = {
      id: `item-${Date.now()}`,
      medicine_name: '',
      strength: '',
      dosage_form: 'Tablet',
      dosage_instructions: '',
      frequency: 'OD',
      duration: '5 days',
      extraction_confidence: 'clearly_extracted',
      confidence_score: 1.0,
      verification_status: 'unverified'
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Confirm Pharmacist Reviewed & Save
  const handleConfirmReviewed = async () => {
    const confirmedItems = items.map((i) => ({
      ...i,
      verification_status: (i.verification_status === 'unverified' ? 'verified' : i.verification_status) as VerificationStatus
    }));
    setItems(confirmedItems);
    setReviewStatus('reviewed_verified');

    // Build analysis object
    const analysisId = currentAnalysis?.id || `rx-${Date.now()}`;
    const analysisRecord: PrescriptionAnalysis = {
      id: analysisId,
      user_id: profile.id,
      patient_name: patientName,
      patient_age: patientAge,
      doctor_name: doctorName,
      doctor_reg_no: doctorRegNo,
      prescription_date: prescriptionDate,
      file_name: selectedFile?.name || 'prescription_scan.jpg',
      file_type: selectedFile?.type || 'image/jpeg',
      file_preview_url: filePreview || undefined,
      analysis_status: 'analyzed',
      pharmacist_review_status: 'reviewed_verified',
      pharmacist_notes: pharmacistNotes,
      reviewed_by: profile.id,
      reviewer_name: profile.full_name,
      reviewed_at: new Date().toISOString(),
      created_at: currentAnalysis?.created_at || new Date().toISOString(),
      items: confirmedItems,
      safety_alerts: safetyAlerts
    };

    if (selectedFile) {
      await uploadPrescriptionFile(selectedFile, profile.id);
    }

    await savePrescriptionAnalysisRecord(analysisRecord);
    await updatePharmacistReview(
      analysisId,
      confirmedItems,
      pharmacistNotes,
      'reviewed_verified',
      profile.id,
      profile.full_name
    );

    onAnalysisSaved(analysisRecord);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 4000);
  };

  // Save as Draft without confirming review
  const handleSaveDraft = async () => {
    const analysisId = currentAnalysis?.id || `rx-${Date.now()}`;
    const analysisRecord: PrescriptionAnalysis = {
      id: analysisId,
      user_id: profile.id,
      patient_name: patientName,
      patient_age: patientAge,
      doctor_name: doctorName,
      doctor_reg_no: doctorRegNo,
      prescription_date: prescriptionDate,
      file_name: selectedFile?.name || 'prescription_scan.jpg',
      file_type: selectedFile?.type || 'image/jpeg',
      file_preview_url: filePreview || undefined,
      analysis_status: 'analyzed',
      pharmacist_review_status: 'pending_verification',
      pharmacist_notes: pharmacistNotes,
      created_at: currentAnalysis?.created_at || new Date().toISOString(),
      items: items,
      safety_alerts: safetyAlerts
    };

    await savePrescriptionAnalysisRecord(analysisRecord);
    onAnalysisSaved(analysisRecord);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* 1. MANDATORY BANNER: PENDING PHARMACIST VERIFICATION */}
      {reviewStatus === 'pending_verification' ? (
        <div className="p-4 rounded-2xl bg-amber-950/80 border-2 border-amber-500/80 text-amber-200 shadow-xl shadow-amber-950/40 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse-slow">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-900/80 rounded-xl text-amber-300 border border-amber-500/50 mt-0.5">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-extrabold text-amber-100 tracking-wide uppercase">
                  Pending Pharmacist Verification
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-900 font-bold text-amber-200">
                  CLINICAL HOLD
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-300/90 leading-relaxed mt-0.5">
                Extracted medications must be individually reviewed by a registered pharmacist before dispensing. Confidence indicators highlight uncertainty or illegibility.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isPharmacist ? (
              <button
                onClick={handleConfirmReviewed}
                className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all transform hover:scale-102"
              >
                <FileCheck className="w-4 h-4" />
                <span>Confirm Reviewed & Authorize</span>
              </button>
            ) : (
              <span className="text-xs text-amber-400 italic font-medium px-3 py-1 bg-amber-900/50 rounded-lg">
                Pharmacist authentication required to sign off
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-900/80 rounded-xl text-emerald-300">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-emerald-100 text-sm sm:text-base">
                Pharmacist Verified & Approved
              </h3>
              <p className="text-xs text-emerald-300">
                Verified by {profile.full_name} ({profile.license_number || 'RPH License'}) on {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActivePage('safety_report')}
            className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      )}

      {saveSuccessNotice && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Prescription details and verification state successfully saved to database.</span>
        </div>
      )}

      {/* Main Grid: Upload & Preview (Left) + Extracted Details (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Document Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Prescription Document</span>
              </h2>
              {filePreview && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] text-slate-400 px-1">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(250, z + 25))}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Upload Area */}
            {!filePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-cyan-500/70 bg-slate-950/60 rounded-xl p-8 text-center cursor-pointer transition-all hover:bg-cyan-950/10 group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  className="hidden"
                />
                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:scale-105 transition-all mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  Drop prescription image or browse
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports PNG, JPG, WebP, PDF up to 10MB
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center max-h-[420px]">
                  <img
                    src={filePreview}
                    alt="Prescription Scan"
                    style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
                    className="object-contain max-h-[420px] transition-transform duration-200"
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400 truncate max-w-[200px]">
                    {selectedFile?.name || 'Uploaded Prescription'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Replace</span>
                    </button>
                    <button
                      onClick={handleRemoveFile}
                      className="px-2.5 py-1 text-xs bg-red-950/50 hover:bg-red-900/60 text-red-300 rounded-lg flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {fileError && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{fileError}</span>
              </div>
            )}

            {/* AI Extraction Trigger */}
            <div className="pt-2">
              <button
                onClick={handleRunAiAnalysis}
                disabled={isAnalyzing}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40 transition-colors"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                    <span>Analyzing Prescription OCR...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    <span>Extract with Medivexa OCR</span>
                  </>
                )}
              </button>

              {aiError && (
                <div className="mt-3 p-3 bg-amber-950/60 border border-amber-600/50 rounded-xl text-xs text-amber-200 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>AI service not configured</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    The automated optical extraction requires a valid server-side `GEMINI_API_KEY`. You can still test, edit, and verify prescription fields manually below.
                  </p>
                  <button
                    onClick={handleRunAiAnalysis}
                    className="px-3 py-1 bg-amber-900/70 hover:bg-amber-800 text-amber-200 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retry Extraction</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Active Safety Alerts for this Rx */}
          {safetyAlerts.length > 0 && (
            <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-red-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Clinical Interceptions ({safetyAlerts.length})</span>
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-red-900/80 text-red-200 font-bold uppercase">
                  HIGH RISK
                </span>
              </div>
              <div className="space-y-2.5">
                {safetyAlerts.map((alert, i) => (
                  <div key={i} className="p-3 bg-slate-950/70 border border-red-800/60 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-red-300">
                        {alert.matched_drug_a} {alert.matched_drug_b ? `⇄ ${alert.matched_drug_b}` : ''}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-800 font-bold">
                        {alert.alert_type}
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{alert.description}</p>
                    <p className="text-cyan-400 text-[11px] font-medium pt-1">
                      Action: {alert.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Editable Prescription Metadata & Items */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header Metadata */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Patient & Doctor Information</span>
              <span className="text-xs text-slate-400 font-normal">(Editable)</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Patient Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Patient Age</label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Prescription Date</label>
                <input
                  type="date"
                  value={prescriptionDate}
                  onChange={(e) => setPrescriptionDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Medication Items List with Confidence Badges */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>Prescribed Medicines ({items.length})</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Pharmacists can edit fields, adjust strengths, and assign extraction accuracy confidence.
                </p>
              </div>

              <button
                onClick={handleAddItem}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs rounded-lg flex items-center gap-1 border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => {
                const isClear = item.extraction_confidence === 'clearly_extracted';
                const isUncertain = item.extraction_confidence === 'uncertain';
                const isNotVisible = item.extraction_confidence === 'not_visible';

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border transition-colors ${
                      isNotVisible
                        ? 'bg-red-950/20 border-red-900/50'
                        : isUncertain
                        ? 'bg-amber-950/20 border-amber-900/50'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300 flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="font-semibold text-slate-200 text-sm">
                          {item.medicine_name || 'New Medicine'}
                        </span>
                      </div>

                      {/* Confidence Tag Buttons */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-medium">Confidence:</span>
                        <button
                          type="button"
                          onClick={() => handleItemChange(index, 'extraction_confidence', 'clearly_extracted')}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                            isClear
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-sm'
                              : 'bg-slate-900 text-slate-500 border-slate-800'
                          }`}
                        >
                          Clearly Extracted
                        </button>

                        <button
                          type="button"
                          onClick={() => handleItemChange(index, 'extraction_confidence', 'uncertain')}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                            isUncertain
                              ? 'bg-amber-950 text-amber-300 border-amber-500 shadow-sm'
                              : 'bg-slate-900 text-slate-500 border-slate-800'
                          }`}
                        >
                          Uncertain
                        </button>

                        <button
                          type="button"
                          onClick={() => handleItemChange(index, 'extraction_confidence', 'not_visible')}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-all ${
                            isNotVisible
                              ? 'bg-red-950 text-red-300 border-red-500 shadow-sm'
                              : 'bg-slate-900 text-slate-500 border-slate-800'
                          }`}
                        >
                          Not Visible
                        </button>

                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-slate-500 hover:text-red-400 rounded ml-1"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-3 text-xs">
                      <div className="sm:col-span-2">
                        <label className="block text-slate-400 text-[11px] mb-1">Medicine Name</label>
                        <input
                          type="text"
                          value={item.medicine_name}
                          onChange={(e) => handleItemChange(index, 'medicine_name', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-medium focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">Strength</label>
                        <input
                          type="text"
                          value={item.strength}
                          onChange={(e) => handleItemChange(index, 'strength', e.target.value)}
                          placeholder="e.g. 500mg"
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">Dosage Form</label>
                        <select
                          value={item.dosage_form}
                          onChange={(e) => handleItemChange(index, 'dosage_form', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-cyan-500"
                        >
                          <option value="Tablet">Tablet</option>
                          <option value="Capsule">Capsule</option>
                          <option value="Syrup">Syrup</option>
                          <option value="Injection">Injection</option>
                          <option value="Inhaler">Inhaler</option>
                          <option value="Ointment">Ointment</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-slate-400 text-[11px] mb-1">Directions & Instructions</label>
                        <input
                          type="text"
                          value={item.dosage_instructions}
                          onChange={(e) => handleItemChange(index, 'dosage_instructions', e.target.value)}
                          placeholder="e.g. 1-0-1 after food for 5 days"
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">Duration</label>
                        <input
                          type="text"
                          value={item.duration}
                          onChange={(e) => handleItemChange(index, 'duration', e.target.value)}
                          placeholder="5 days"
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    {item.notes && (
                      <div className="mt-2 text-[11px] text-amber-300/90 italic bg-amber-950/30 p-2 rounded-lg border border-amber-900/40">
                        Pharmacist Observation: {item.notes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pharmacist Review Sign-off Section */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Pharmacist Audit & Sign-off Notes</span>
            </h3>

            <div>
              <textarea
                rows={2}
                value={pharmacistNotes}
                onChange={(e) => setPharmacistNotes(e.target.value)}
                placeholder="Enter clinical review notes, cross-checked LASA observations, patient allergy verifications, or doctor callbacks..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="text-xs text-slate-400">
                Reviewer: <strong className="text-slate-200">{profile.full_name}</strong>{' '}
                <span className="text-cyan-400">({profile.license_number || 'Pharmacist License Active'})</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-slate-700"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Draft</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmReviewed}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-950 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Reviewed</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
