-- =========================================================================
-- MEDIVEXA AI — SUPABASE DATABASE FOUNDATION & RLS POLICIES
-- Project: Medivexa AI (Intelligent Medicine. Safer Decisions.)
-- Safe, idempotent migration script with Row Level Security (RLS)
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -------------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked to Supabase Auth users)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('pharmacist', 'doctor', 'patient')),
  license_number TEXT,
  pharmacy_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Pharmacists and doctors can view all profiles" ON public.profiles;
CREATE POLICY "Pharmacists and doctors can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('pharmacist', 'doctor')
    )
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile on signup" ON public.profiles;
CREATE POLICY "Users can insert their own profile on signup"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- -------------------------------------------------------------------------
-- 2. PRESCRIPTION_ANALYSES TABLE
-- Stores private file path, analysis status, pharmacist review status
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prescription_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL DEFAULT '',
  patient_age INTEGER,
  doctor_name TEXT NOT NULL DEFAULT '',
  doctor_reg_no TEXT,
  prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
  private_file_path TEXT,
  file_name TEXT,
  file_type TEXT,
  extracted_data JSONB DEFAULT '{}'::jsonb,
  analysis_status TEXT NOT NULL DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'analyzed', 'failed')),
  pharmacist_review_status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (pharmacist_review_status IN ('pending_verification', 'reviewed_verified', 'flagged_inconsistent')),
  pharmacist_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.prescription_analyses ENABLE ROW LEVEL SECURITY;

-- Prescription Analyses Policies
DROP POLICY IF EXISTS "Users can view their own prescription analyses" ON public.prescription_analyses;
CREATE POLICY "Users can view their own prescription analyses"
  ON public.prescription_analyses FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('pharmacist', 'doctor')
    )
  );

DROP POLICY IF EXISTS "Users can insert their own prescription analyses" ON public.prescription_analyses;
CREATE POLICY "Users can insert their own prescription analyses"
  ON public.prescription_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Pharmacists or owners can update prescription analyses" ON public.prescription_analyses;
CREATE POLICY "Pharmacists or owners can update prescription analyses"
  ON public.prescription_analyses FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('pharmacist', 'doctor')
    )
  );

-- -------------------------------------------------------------------------
-- 3. PRESCRIPTION_ITEMS TABLE
-- Medicine items extracted, confidence score, and pharmacist verification
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prescription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES public.prescription_analyses(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  brand_name TEXT,
  generic_name TEXT,
  strength TEXT NOT NULL DEFAULT '',
  dosage_form TEXT NOT NULL DEFAULT 'Tablet',
  dosage_instructions TEXT NOT NULL DEFAULT '',
  frequency TEXT NOT NULL DEFAULT 'Once daily',
  duration TEXT NOT NULL DEFAULT '5 days',
  extraction_confidence TEXT NOT NULL DEFAULT 'clearly_extracted' CHECK (extraction_confidence IN ('clearly_extracted', 'uncertain', 'not_visible')),
  confidence_score NUMERIC(4,3) DEFAULT 0.950,
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'verified', 'modified', 'rejected')),
  pharmacist_correction TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view items of accessible analyses" ON public.prescription_items;
CREATE POLICY "Users can view items of accessible analyses"
  ON public.prescription_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.prescription_analyses pa
      WHERE pa.id = public.prescription_items.analysis_id
      AND (
        pa.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('pharmacist', 'doctor')
        )
      )
    )
  );

DROP POLICY IF EXISTS "Users can insert items for their analyses" ON public.prescription_items;
CREATE POLICY "Users can insert items for their analyses"
  ON public.prescription_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.prescription_analyses pa
      WHERE pa.id = public.prescription_items.analysis_id
      AND pa.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Pharmacists can update prescription items" ON public.prescription_items;
CREATE POLICY "Pharmacists can update prescription items"
  ON public.prescription_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('pharmacist', 'doctor')
    ) OR
    EXISTS (
      SELECT 1 FROM public.prescription_analyses pa
      WHERE pa.id = public.prescription_items.analysis_id AND pa.user_id = auth.uid()
    )
  );

-- -------------------------------------------------------------------------
-- 4. MEDICINE_CATALOG TABLE
-- Reference repository with generic names, interactions, sources
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medicine_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_name TEXT NOT NULL UNIQUE,
  generic_name TEXT NOT NULL,
  strengths TEXT[] NOT NULL DEFAULT '{}',
  dosage_forms TEXT[] NOT NULL DEFAULT '{}',
  drug_class TEXT NOT NULL,
  indications TEXT[] NOT NULL DEFAULT '{}',
  contraindications TEXT[] NOT NULL DEFAULT '{}',
  common_side_effects TEXT[] NOT NULL DEFAULT '{}',
  interactions JSONB DEFAULT '[]'::jsonb,
  lasa_sound_alike_pairs TEXT[] DEFAULT '{}',
  trusted_source_references TEXT[] NOT NULL DEFAULT '{"FDA", "WHO"}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.medicine_catalog ENABLE ROW LEVEL SECURITY;

-- Medicine Catalog is publicly readable for clinical safety reference
DROP POLICY IF EXISTS "Medicine catalog is readable by all authenticated and anon users" ON public.medicine_catalog;
CREATE POLICY "Medicine catalog is readable by all authenticated and anon users"
  ON public.medicine_catalog FOR SELECT
  USING (true);

-- Only pharmacists/admins can modify catalog
DROP POLICY IF EXISTS "Only pharmacists can manage medicine catalog" ON public.medicine_catalog;
CREATE POLICY "Only pharmacists can manage medicine catalog"
  ON public.medicine_catalog FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'pharmacist'
    )
  );

-- -------------------------------------------------------------------------
-- 5. SAFETY_ALERTS TABLE
-- Look-Alike Sound-Alike (LASA) flags, interactions, severity
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.safety_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.prescription_analyses(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('LASA_SOUND_ALIKE', 'DRUG_DRUG_INTERACTION', 'DOSAGE_WARNING', 'CONTRAINDICATION')),
  severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MODERATE', 'LOW')),
  matched_drug_a TEXT NOT NULL,
  matched_drug_b TEXT,
  description TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  pharmacist_review_status TEXT NOT NULL DEFAULT 'unreviewed' CHECK (pharmacist_review_status IN ('unreviewed', 'acknowledged', 'overridden', 'corrected')),
  pharmacist_action_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.safety_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view alerts for their accessible analyses" ON public.safety_alerts;
CREATE POLICY "Users can view alerts for their accessible analyses"
  ON public.safety_alerts FOR SELECT
  USING (
    analysis_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.prescription_analyses pa
      WHERE pa.id = public.safety_alerts.analysis_id
      AND (
        pa.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('pharmacist', 'doctor')
        )
      )
    )
  );

DROP POLICY IF EXISTS "Pharmacists and owners can update safety alerts" ON public.safety_alerts;
CREATE POLICY "Pharmacists and owners can update safety alerts"
  ON public.safety_alerts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role IN ('pharmacist', 'doctor')
    ) OR
    EXISTS (
      SELECT 1 FROM public.prescription_analyses pa
      WHERE pa.id = public.safety_alerts.analysis_id AND pa.user_id = auth.uid()
    )
  );

-- -------------------------------------------------------------------------
-- 6. PRIVATE SUPABASE STORAGE BUCKET: prescriptions
-- -------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'prescriptions',
  'prescriptions',
  false,
  10485760, -- 10MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760;

-- Storage RLS Policies: Owner-only private upload & download
DROP POLICY IF EXISTS "Users can upload their own prescriptions" ON storage.objects;
CREATE POLICY "Users can upload their own prescriptions"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'prescriptions' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can read their own prescriptions" ON storage.objects;
CREATE POLICY "Users can read their own prescriptions"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'prescriptions' AND
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() AND p.role IN ('pharmacist', 'doctor')
      )
    )
  );

-- -------------------------------------------------------------------------
-- 7. PERFORMANCE INDEXES
-- -------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_prescription_analyses_user ON public.prescription_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_prescription_analyses_date ON public.prescription_analyses(prescription_date DESC);
CREATE INDEX IF NOT EXISTS idx_prescription_items_analysis ON public.prescription_items(analysis_id);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_analysis ON public.safety_alerts(analysis_id);
CREATE INDEX IF NOT EXISTS idx_medicine_catalog_name ON public.medicine_catalog(medicine_name);
CREATE INDEX IF NOT EXISTS idx_medicine_catalog_generic ON public.medicine_catalog(generic_name);

-- -------------------------------------------------------------------------
-- 8. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- -------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
