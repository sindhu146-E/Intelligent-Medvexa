import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Profile, 
  PrescriptionAnalysis, 
  PrescriptionItem, 
  SafetyAlert, 
  MedicineCatalogItem,
  UserRole 
} from '../types';
import { INITIAL_MEDICINE_CATALOG } from '../data/medicineCatalog';

const STORAGE_KEY_URL = 'medivexa_supabase_url';
const STORAGE_KEY_KEY = 'medivexa_supabase_anon_key';
const STORAGE_KEY_OFFLINE_SCANS = 'medivexa_offline_analyses_v1';
const STORAGE_KEY_OFFLINE_PROFILE = 'medivexa_offline_profile_v1';

export interface SupabaseConnectionStatus {
  isConnected: boolean;
  url: string | null;
  hasKey: boolean;
  isCustom: boolean;
}

// Get initial config from ENV or localStorage
export function getStoredSupabaseConfig(): { url: string; key: string } {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  const localUrl = localStorage.getItem(STORAGE_KEY_URL) || '';
  const localKey = localStorage.getItem(STORAGE_KEY_KEY) || '';

  return {
    url: localUrl || envUrl,
    key: localKey || envKey
  };
}

export function saveCustomSupabaseConfig(url: string, key: string) {
  if (url && key) {
    localStorage.setItem(STORAGE_KEY_URL, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, key.trim());
    clientInstance = null; // reset client
  } else {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_KEY);
    clientInstance = null;
  }
}

let clientInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (clientInstance) return clientInstance;
  const { url, key } = getStoredSupabaseConfig();
  if (url && key && url.startsWith('http')) {
    try {
      clientInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      return clientInstance;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return null;
}

export function getConnectionStatus(): SupabaseConnectionStatus {
  const { url, key } = getStoredSupabaseConfig();
  const isCustom = Boolean(localStorage.getItem(STORAGE_KEY_URL));
  const client = getSupabase();
  return {
    isConnected: Boolean(client && url && key),
    url: url || null,
    hasKey: Boolean(key),
    isCustom
  };
}

// ==========================================
// OFFLINE & LOCAL FALLBACK STORAGE
// ==========================================
function getLocalAnalyses(): PrescriptionAnalysis[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OFFLINE_SCANS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalAnalyses(list: PrescriptionAnalysis[]) {
  try {
    localStorage.setItem(STORAGE_KEY_OFFLINE_SCANS, JSON.stringify(list));
  } catch (e) {
    console.error('Error saving local analyses:', e);
  }
}

export function getLocalProfile(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OFFLINE_PROFILE);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    id: 'local-pharmacist-01',
    email: 'pharmacist@medivexa.ai',
    full_name: 'Dr. Priya Varma, PharmD',
    role: 'pharmacist',
    license_number: 'RPH-849204-TN',
    pharmacy_name: 'Apollo Hospital Clinical Pharmacy',
    created_at: new Date().toISOString()
  };
}

export function saveLocalProfile(profile: Profile) {
  localStorage.setItem(STORAGE_KEY_OFFLINE_PROFILE, JSON.stringify(profile));
}

// ==========================================
// PRESCRIPTION ANALYSES & ITEMS CRUD
// ==========================================
export async function savePrescriptionAnalysisRecord(
  analysis: PrescriptionAnalysis
): Promise<{ success: boolean; id: string; error?: string }> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      // 1. Insert analysis record
      const { data: analysisData, error: analysisError } = await supabase
        .from('prescription_analyses')
        .insert({
          id: analysis.id,
          user_id: analysis.user_id,
          patient_name: analysis.patient_name,
          patient_age: analysis.patient_age,
          doctor_name: analysis.doctor_name,
          doctor_reg_no: analysis.doctor_reg_no,
          prescription_date: analysis.prescription_date,
          private_file_path: analysis.private_file_path,
          file_name: analysis.file_name,
          file_type: analysis.file_type,
          analysis_status: analysis.analysis_status,
          pharmacist_review_status: analysis.pharmacist_review_status || 'pending_verification',
          pharmacist_notes: analysis.pharmacist_notes,
          reviewed_by: analysis.reviewed_by,
          reviewed_at: analysis.reviewed_at,
          extracted_data: {
            itemsCount: analysis.items.length,
            alertsCount: analysis.safety_alerts.length
          }
        })
        .select()
        .single();

      if (analysisError) {
        console.warn('Supabase insert failed, falling back to local store:', analysisError.message);
      } else {
        // 2. Insert items
        if (analysis.items.length > 0) {
          const itemsPayload = analysis.items.map((item) => ({
            id: item.id,
            analysis_id: analysis.id,
            medicine_name: item.medicine_name,
            brand_name: item.brand_name,
            generic_name: item.generic_name,
            strength: item.strength,
            dosage_form: item.dosage_form,
            dosage_instructions: item.dosage_instructions,
            frequency: item.frequency,
            duration: item.duration,
            extraction_confidence: item.extraction_confidence,
            confidence_score: item.confidence_score,
            verification_status: item.verification_status,
            pharmacist_correction: item.pharmacist_correction,
            notes: item.notes
          }));
          await supabase.from('prescription_items').insert(itemsPayload);
        }

        // 3. Insert safety alerts
        if (analysis.safety_alerts.length > 0) {
          const alertsPayload = analysis.safety_alerts.map((alert) => ({
            id: alert.id,
            analysis_id: analysis.id,
            alert_type: alert.alert_type,
            severity: alert.severity,
            matched_drug_a: alert.matched_drug_a,
            matched_drug_b: alert.matched_drug_b,
            description: alert.description,
            recommendation: alert.recommendation,
            pharmacist_review_status: alert.pharmacist_review_status
          }));
          await supabase.from('safety_alerts').insert(alertsPayload);
        }
      }
    } catch (e: any) {
      console.warn('Network error saving to Supabase:', e);
    }
  }

  // Always mirror to local store for fast offline access and resilience
  const currentList = getLocalAnalyses();
  const existingIdx = currentList.findIndex((a) => a.id === analysis.id);
  if (existingIdx >= 0) {
    currentList[existingIdx] = analysis;
  } else {
    currentList.unshift(analysis);
  }
  saveLocalAnalyses(currentList);

  return { success: true, id: analysis.id };
}

export async function fetchPrescriptionAnalyses(
  userId?: string
): Promise<PrescriptionAnalysis[]> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      let query = supabase
        .from('prescription_analyses')
        .select(`
          *,
          items:prescription_items(*),
          safety_alerts(*)
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as PrescriptionAnalysis[];
      }
    } catch (e) {
      console.warn('Error querying Supabase prescription_analyses:', e);
    }
  }

  // Fallback to local store
  return getLocalAnalyses();
}

export async function updatePharmacistReview(
  analysisId: string,
  items: PrescriptionItem[],
  pharmacistNotes: string,
  pharmacistStatus: 'reviewed_verified' | 'flagged_inconsistent',
  pharmacistId: string,
  reviewerName?: string
): Promise<boolean> {
  const supabase = getSupabase();

  const updateData = {
    pharmacist_review_status: pharmacistStatus,
    pharmacist_notes: pharmacistNotes,
    reviewed_by: pharmacistId,
    reviewed_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      await supabase
        .from('prescription_analyses')
        .update(updateData)
        .eq('id', analysisId);

      for (const item of items) {
        await supabase
          .from('prescription_items')
          .update({
            verification_status: item.verification_status,
            pharmacist_correction: item.pharmacist_correction || null,
            medicine_name: item.medicine_name,
            strength: item.strength,
            dosage_instructions: item.dosage_instructions
          })
          .eq('id', item.id);
      }
    } catch (e) {
      console.warn('Error updating Supabase review:', e);
    }
  }

  // Update local store
  const list = getLocalAnalyses();
  const target = list.find((a) => a.id === analysisId);
  if (target) {
    target.pharmacist_review_status = pharmacistStatus;
    target.pharmacist_notes = pharmacistNotes;
    target.reviewed_by = pharmacistId;
    target.reviewer_name = reviewerName;
    target.reviewed_at = new Date().toISOString();
    target.items = items;
    saveLocalAnalyses(list);
  }

  return true;
}

// Upload file to Supabase private storage bucket 'prescriptions'
export async function uploadPrescriptionFile(
  file: File,
  userId: string
): Promise<{ path: string | null; error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { path: `local/prescriptions/${Date.now()}_${file.name}`, error: null };
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error } = await supabase.storage
      .from('prescriptions')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      return { path: null, error: error.message };
    }
    return { path: filePath, error: null };
  } catch (err: any) {
    return { path: null, error: err.message || 'File upload error' };
  }
}

// Medicine Catalog search
export async function searchMedicineCatalog(
  query: string
): Promise<MedicineCatalogItem[]> {
  const supabase = getSupabase();

  if (supabase && query.trim()) {
    try {
      const { data, error } = await supabase
        .from('medicine_catalog')
        .select('*')
        .or(`medicine_name.ilike.%${query}%,generic_name.ilike.%${query}%`)
        .limit(20);

      if (!error && data && data.length > 0) {
        return data as MedicineCatalogItem[];
      }
    } catch (e) {
      console.warn('Error fetching Supabase medicine_catalog:', e);
    }
  }

  // Fallback to in-memory catalogue
  const q = query.toLowerCase().trim();
  if (!q) return INITIAL_MEDICINE_CATALOG;
  return INITIAL_MEDICINE_CATALOG.filter(
    (m) =>
      m.medicine_name.toLowerCase().includes(q) ||
      m.generic_name.toLowerCase().includes(q) ||
      m.drug_class.toLowerCase().includes(q) ||
      m.indications.some((ind) => ind.toLowerCase().includes(q))
  );
}
