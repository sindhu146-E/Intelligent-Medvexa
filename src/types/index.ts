export type UserRole = 'pharmacist' | 'doctor' | 'patient';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  license_number?: string;
  pharmacy_name?: string;
  created_at: string;
}

export type ExtractionConfidence = 'clearly_extracted' | 'uncertain' | 'not_visible';
export type VerificationStatus = 'unverified' | 'verified' | 'modified' | 'rejected';
export type AnalysisStatus = 'pending' | 'analyzed' | 'failed';
export type PharmacistReviewStatus = 'pending_verification' | 'reviewed_verified' | 'flagged_inconsistent';

export interface PrescriptionItem {
  id: string;
  analysis_id?: string;
  medicine_name: string;
  brand_name?: string;
  generic_name?: string;
  strength: string;
  dosage_form: string;
  dosage_instructions: string;
  frequency: string;
  duration: string;
  extraction_confidence: ExtractionConfidence;
  confidence_score: number;
  verification_status: VerificationStatus;
  pharmacist_correction?: string;
  notes?: string;
}

export interface PrescriptionAnalysis {
  id: string;
  user_id?: string;
  patient_name: string;
  patient_age?: number;
  doctor_name: string;
  doctor_reg_no?: string;
  prescription_date: string;
  private_file_path?: string;
  file_name?: string;
  file_type?: string;
  file_preview_url?: string;
  analysis_status: AnalysisStatus;
  pharmacist_review_status: PharmacistReviewStatus;
  pharmacist_notes?: string;
  reviewed_by?: string;
  reviewer_name?: string;
  reviewed_at?: string;
  created_at: string;
  items: PrescriptionItem[];
  safety_alerts: SafetyAlert[];
}

export type AlertType = 'LASA_SOUND_ALIKE' | 'DRUG_DRUG_INTERACTION' | 'DOSAGE_WARNING' | 'CONTRAINDICATION';
export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
export type AlertReviewStatus = 'unreviewed' | 'acknowledged' | 'overridden' | 'corrected';

export interface SafetyAlert {
  id: string;
  analysis_id?: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  matched_drug_a: string;
  matched_drug_b?: string;
  description: string;
  recommendation: string;
  pharmacist_review_status: AlertReviewStatus;
  pharmacist_action_notes?: string;
  created_at: string;
}

export interface MedicineCatalogItem {
  id: string;
  medicine_name: string;
  generic_name: string;
  strengths: string[];
  dosage_forms: string[];
  drug_class: string;
  indications: string[];
  contraindications: string[];
  common_side_effects: string[];
  interactions: {
    interacting_drug: string;
    severity: AlertSeverity;
    effect: string;
  }[];
  lasa_sound_alike_pairs: {
    confused_with: string;
    risk_description: string;
  }[];
  trusted_source_references: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  language?: 'en' | 'ta';
  contextData?: {
    drugName?: string;
    alerts?: string[];
  };
}

export type ActivePage = 
  | 'landing' 
  | 'dashboard' 
  | 'scanner' 
  | 'photo_scanner' 
  | 'catalog' 
  | 'chatbot' 
  | 'voice' 
  | 'safety_report' 
  | 'about_privacy';
