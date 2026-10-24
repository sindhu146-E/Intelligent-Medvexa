import { MedicineCatalogItem } from '../types';

export const INITIAL_MEDICINE_CATALOG: MedicineCatalogItem[] = [
  {
    id: 'med-1',
    medicine_name: 'Celebrex',
    generic_name: 'Celecoxib',
    strengths: ['100mg', '200mg', '400mg'],
    dosage_forms: ['Capsule'],
    drug_class: 'Nonsteroidal Anti-inflammatory Drug (NSAID) - COX-2 Selective',
    indications: ['Osteoarthritis', 'Rheumatoid Arthritis', 'Acute pain', 'Ankylosing Spondylitis'],
    contraindications: ['Severe heart failure', 'Active GI bleeding', 'Sulfonamide allergy', 'Third-trimester pregnancy'],
    common_side_effects: ['Dyspepsia', 'Peripheral edema', 'Headache', 'Hypertension'],
    interactions: [
      {
        interacting_drug: 'Warfarin',
        severity: 'HIGH',
        effect: 'Increased bleeding risk due to potentiation of anticoagulant effect'
      },
      {
        interacting_drug: 'Lisinopril',
        severity: 'MODERATE',
        effect: 'Reduced antihypertensive effect and increased risk of acute kidney impairment'
      }
    ],
    lasa_sound_alike_pairs: [
      {
        confused_with: 'Celexa (Citalopram)',
        risk_description: 'CRITICAL LASA Risk: Celebrex is an NSAID anti-inflammatory, whereas Celexa is an SSRI antidepressant. Dispensing error may lead to untreated depression or severe GI toxicity.'
      },
      {
        confused_with: 'Cerebyx (Fosphenytoin)',
        risk_description: 'HIGH LASA Risk: Cerebyx is an injectable anticonvulsant. Phonetic name confusion.'
      }
    ],
    trusted_source_references: ['FDA Orange Book', 'WHO Model List of Essential Medicines', 'USP-NF Standard']
  },
  {
    id: 'med-2',
    medicine_name: 'Celexa',
    generic_name: 'Citalopram Hydrobromide',
    strengths: ['10mg', '20mg', '40mg'],
    dosage_forms: ['Tablet', 'Oral Solution'],
    drug_class: 'Selective Serotonin Reuptake Inhibitor (SSRI)',
    indications: ['Major Depressive Disorder', 'Generalized Anxiety Disorder'],
    contraindications: ['Concurrent MAOIs (within 14 days)', 'Known QT prolongation', 'Concurrent Pimozide'],
    common_side_effects: ['Nausea', 'Dry mouth', 'Somnolence', 'Insomnia', 'Diaphoresis'],
    interactions: [
      {
        interacting_drug: 'Tramadol',
        severity: 'CRITICAL',
        effect: 'Elevated risk of Serotonin Syndrome and lowered seizure threshold'
      },
      {
        interacting_drug: 'Aspirin',
        severity: 'MODERATE',
        effect: 'Increased risk of upper gastrointestinal bleeding'
      }
    ],
    lasa_sound_alike_pairs: [
      {
        confused_with: 'Celebrex (Celecoxib)',
        risk_description: 'CRITICAL LASA Risk: Celexa (SSRI antidepressant) vs Celebrex (COX-2 inhibitor pain medication). High reported dispensing error rate.'
      }
    ],
    trusted_source_references: ['FDA MedWatch Safety Alert', 'National Formulary (BNF)', 'WHO Collaborating Centre']
  },
  {
    id: 'med-3',
    medicine_name: 'Metformin',
    generic_name: 'Metformin Hydrochloride',
    strengths: ['500mg', '850mg', '1000mg', 'ER 500mg', 'ER 1000mg'],
    dosage_forms: ['Tablet', 'Extended-Release Tablet'],
    drug_class: 'Biguanide Antidiabetic Agent',
    indications: ['Type 2 Diabetes Mellitus', 'Polycystic Ovary Syndrome (Off-label)'],
    contraindications: ['Severe renal impairment (eGFR < 30 mL/min)', 'Acute metabolic acidosis', 'Severe hepatic impairment'],
    common_side_effects: ['Diarrhea', 'Nausea', 'Abdominal discomfort', 'Metallic taste', 'Vitamin B12 deficiency'],
    interactions: [
      {
        interacting_drug: 'Iodinated Radiocontrast',
        severity: 'CRITICAL',
        effect: 'Withhold Metformin 48h prior/post to avoid acute contrast-induced nephropathy and lactic acidosis'
      },
      {
        interacting_drug: 'Alcohol',
        severity: 'HIGH',
        effect: 'Potentiates effects on lactate metabolism increasing lactic acidosis risk'
      }
    ],
    lasa_sound_alike_pairs: [
      {
        confused_with: 'Metoprolol (Beta Blocker)',
        risk_description: 'HIGH LASA Risk: Both start with "Meto". Metformin controls blood glucose; Metoprolol controls blood pressure and heart rate. Misadministration can cause hypoglycemia or severe bradycardia.'
      }
    ],
    trusted_source_references: ['ADA Clinical Guidelines 2024', 'WHO Model Formulary', 'FDA Prescribing Info']
  },
  {
    id: 'med-4',
    medicine_name: 'Metoprolol',
    generic_name: 'Metoprolol Tartrate / Succinate',
    strengths: ['25mg', '50mg', '100mg', '200mg ER'],
    dosage_forms: ['Tablet', 'Extended-Release Tablet (Succinate)'],
    drug_class: 'Cardioselective Beta-1 Adrenergic Receptor Blocker',
    indications: ['Hypertension', 'Angina Pectoris', 'Heart Failure (Succinate)', 'Post-myocardial infarction'],
    contraindications: ['Sinus bradycardia', 'Second/third-degree AV block', 'Cardiogenic shock', 'Decompensated heart failure'],
    common_side_effects: ['Bradycardia', 'Fatigue', 'Dizziness', 'Hypotension', 'Cold extremities'],
    interactions: [
      {
        interacting_drug: 'Diltiazem / Verapamil',
        severity: 'HIGH',
        effect: 'Synergistic negative inotropic and dromotropic effects leading to severe bradycardia or heart block'
      }
    ],
    lasa_sound_alike_pairs: [
      {
        confused_with: 'Metformin (Biguanide)',
        risk_description: 'HIGH LASA Risk: Metoprolol (cardiac) vs Metformin (diabetic). Sound-alike beginning.'
      }
    ],
    trusted_source_references: ['ACC/AHA Guidelines', 'FDA Drug Label', 'USP Drug Information']
  },
  {
    id: 'med-5',
    medicine_name: 'Prednisone',
    generic_name: 'Prednisone',
    strengths: ['5mg', '10mg', '20mg', '50mg'],
    dosage_forms: ['Tablet'],
    drug_class: 'Systemic Glucocorticoid / Corticosteroid',
    indications: ['Asthma exacerbation', 'Autoimmune disorders', 'Severe allergic states', 'Inflammatory conditions'],
    contraindications: ['Systemic fungal infections', 'Live virus vaccines during immunosuppressive doses'],
    common_side_effects: ['Hyperglycemia', 'Fluid retention', 'Insomnia', 'Increased appetite', 'Osteoporosis (long term)'],
    interactions: [
      {
        interacting_drug: 'NSAIDs (e.g. Ibuprofen)',
        severity: 'HIGH',
        effect: 'Significantly elevated risk of peptic ulcer disease and GI hemorrhage'
      }
    ],
    lasa_sound_alike_pairs: [
      {
        confused_with: 'Prednisolone',
        risk_description: 'HIGH LASA Risk: Prednisone is a prodrug activated by the liver into prednisolone. In patients with severe hepatic failure, Prednisone is ineffective.'
      }
    ],
    trusted_source_references: ['FDA Approved Label', 'WHO Essential Medicines', 'Endocrine Society Practice Guidelines']
  },
  {
    id: 'med-6',
    medicine_name: 'Hydralazine',
    generic_name: 'Hydralazine Hydrochloride',
    strengths: ['10mg', '25mg', '50mg', '100mg'],
    dosage_forms: ['Tablet', 'Injection'],
    drug_class: 'Direct-Acting Peripheral Vasodilator',
    indications: ['Essential Hypertension', 'Heart Failure (in combination with Isosorbide Dinitrate)'],
    contraindications: ['Coronary artery disease', 'Mitral valvular rheumatic heart disease'],
    common_side_effects: ['Reflex tachycardia', 'Headache', 'Palpitations', 'Fluid retention', 'Lupus-like syndrome'],
    interactions: [
      {
        interacting_drug: 'Sildenafil (PDE5 inhibitors)',
        severity: 'HIGH',
        effect: 'Additive potent vasodilation resulting in profound hypotension'
      }
    ],
    lasa_sound_alike_pairs: [
      {
        confused_with: 'Hydroxyzine (Antihistamine / Anxiolytic)',
        risk_description: 'CRITICAL LASA Risk: Hydralazine lowers blood pressure; Hydroxyzine is a sedating antihistamine for anxiety/pruritus. Mistaking one for the other causes severe hypotension or excessive sedation.'
      }
    ],
    trusted_source_references: ['ISMP High-Alert Medication List', 'FDA Safety Communication', 'WHO Model List']
  },
  {
    id: 'med-7',
    medicine_name: 'Hydroxyzine',
    generic_name: 'Hydroxyzine Pamoate / Hydrochloride',
    strengths: ['10mg', '25mg', '50mg'],
    dosage_forms: ['Capsule', 'Tablet', 'Oral Syrup'],
    drug_class: 'First-Generation H1 Antihistamine / Piperazine Derivative',
    indications: ['Pruritus due to allergic conditions', 'Pre-operative sedation', 'Generalized anxiety relief'],
    contraindications: ['Prolonged QT interval', 'Early pregnancy', 'Concurrent anticholinergics without caution'],
    common_side_effects: ['Drowsiness', 'Dry mouth', 'Anticholinergic symptoms', 'Urinary retention in elderly'],
    interactions: [
      {
        interacting_drug: 'Benzodiazepines / Opioids',
        severity: 'HIGH',
        effect: 'Profound CNS depression, respiratory depression, and severe sedation'
      }
    ],
    lasa_sound_alike_pairs: [
      {
        confused_with: 'Hydralazine (Antihypertensive)',
        risk_description: 'CRITICAL LASA Risk: Frequently confused look-alike sound-alike drug name. Dispensing Hydralazine causes rapid vasodilation.'
      }
    ],
    trusted_source_references: ['ISMP Confused Drug Names List', 'FDA Safety Alerts', 'British National Formulary']
  },
  {
    id: 'med-8',
    medicine_name: 'Amoxicillin + Clavulanate (Augmentin)',
    generic_name: 'Amoxicillin and Clavulanate Potassium',
    strengths: ['625mg', '1000mg', '375mg', 'Dry Syrup 228.5mg/5ml'],
    dosage_forms: ['Tablet', 'Oral Suspension'],
    drug_class: 'Beta-Lactam Antibiotic with Beta-Lactamase Inhibitor',
    indications: ['Bacterial Sinusitis', 'Community Acquired Pneumonia', 'Otitis Media', 'Skin and soft tissue infections'],
    contraindications: ['History of Penicillin anaphylaxis', 'History of amoxicillin-clavulanate-associated cholestatic jaundice/hepatic impairment'],
    common_side_effects: ['Diarrhea', 'Nausea', 'Vaginal candidiasis', 'Maculopapular rash'],
    interactions: [
      {
        interacting_drug: 'Methotrexate',
        severity: 'HIGH',
        effect: 'Decreased renal clearance of methotrexate leading to toxic bone marrow suppression'
      }
    ],
    lasa_sound_alike_pairs: [],
    trusted_source_references: ['IDSA Guidelines', 'FDA Prescribing Information', 'WHO AWaRe Classification']
  },
  {
    id: 'med-9',
    medicine_name: 'Atorvastatin',
    generic_name: 'Atorvastatin Calcium',
    strengths: ['10mg', '20mg', '40mg', '80mg'],
    dosage_forms: ['Tablet'],
    drug_class: 'HMG-CoA Reductase Inhibitor (Statin)',
    indications: ['Hypercholesterolemia', 'Primary and secondary prevention of Cardiovascular disease'],
    contraindications: ['Active liver disease', 'Unexplained persistent transaminase elevations', 'Pregnancy and lactation'],
    common_side_effects: ['Myalgia', 'Arthralgia', 'Diarrhea', 'Nasopharyngitis', 'Elevated hepatic transaminases'],
    interactions: [
      {
        interacting_drug: 'Clarithromycin / Ketoconazole (Strong CYP3A4 inhibitors)',
        severity: 'CRITICAL',
        effect: 'Markedly elevates atorvastatin plasma concentrations, increasing risk of rhabdomyolysis and renal failure'
      }
    ],
    lasa_sound_alike_pairs: [
      {
        confused_with: 'Atomoxetine (Strattera for ADHD)',
        risk_description: 'MODERATE LASA Risk: Sound-alike phonetic beginning.'
      }
    ],
    trusted_source_references: ['AHA/ACC Cholesterol Guidelines', 'FDA Orange Book', 'WHO Essential Medicines']
  },
  {
    id: 'med-10',
    medicine_name: 'Losartan',
    generic_name: 'Losartan Potassium',
    strengths: ['25mg', '50mg', '100mg'],
    dosage_forms: ['Tablet'],
    drug_class: 'Angiotensin II Receptor Blocker (ARB)',
    indications: ['Hypertension', 'Diabetic Nephropathy in Type 2 Diabetes', 'Stroke risk reduction in hypertension with LVH'],
    contraindications: ['Co-administration with Aliskiren in diabetic patients', 'Pregnancy (Black Box Warning: fetal toxicity)'],
    common_side_effects: ['Dizziness', 'Hyperkalemia', 'Hypotension', 'Fatigue'],
    interactions: [
      {
        interacting_drug: 'Potassium Supplements / Spironolactone',
        severity: 'HIGH',
        effect: 'Severe hyperkalemia requiring cardiac monitoring'
      }
    ],
    lasa_sound_alike_pairs: [
      {
        confused_with: 'Lotensin (Benazepril)',
        risk_description: 'MODERATE LASA Risk: Sound-alike cardiovascular medication.'
      }
    ],
    trusted_source_references: ['FDA Black Box Warning', 'JNC8 Guidelines', 'National Formulary of India (NFI)']
  }
];
