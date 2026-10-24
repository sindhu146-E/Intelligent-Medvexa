import { SafetyAlert } from '../types';
import { INITIAL_MEDICINE_CATALOG } from './medicineCatalog';

export interface LasaPairDefinition {
  drugA: string;
  drugB: string;
  indicationA: string;
  indicationB: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE';
  reason: string;
  recommendation: string;
}

export const KNOWN_LASA_PAIRS: LasaPairDefinition[] = [
  {
    drugA: 'Celebrex',
    drugB: 'Celexa',
    indicationA: 'Pain & Arthritis (NSAID)',
    indicationB: 'Depression & Anxiety (SSRI)',
    severity: 'CRITICAL',
    reason: 'Sound-alike, look-alike drug name. Dispensing Celexa instead of Celebrex can precipitate serotonin toxicity or leave acute inflammation untreated.',
    recommendation: 'Confirm diagnosis with prescriber. Verify whether indication is pain/inflammation (Celebrex) or psychological (Celexa).'
  },
  {
    drugA: 'Hydralazine',
    drugB: 'Hydroxyzine',
    indicationA: 'Hypertension vasodilator',
    indicationB: 'Antihistamine / Anxiolytic',
    severity: 'CRITICAL',
    reason: 'Commonly reported dispensing error. Administering Hydralazine instead of Hydroxyzine can cause acute profound hypotension and reflex tachycardia.',
    recommendation: 'Double check blood pressure and clinical indication before dispensing. Require indication on Rx.'
  },
  {
    drugA: 'Prednisone',
    drugB: 'Prednisolone',
    indicationA: 'Oral corticosteroid prodrug',
    indicationB: 'Active corticosteroid',
    severity: 'HIGH',
    reason: 'Prednisone requires hepatic conversion to prednisolone. Patients with severe hepatic failure cannot activate Prednisone.',
    recommendation: 'Check patient liver function (LFTs). Pediatric suspensions typically use Prednisolone.'
  },
  {
    drugA: 'Metformin',
    drugB: 'Metoprolol',
    indicationA: 'Type 2 Diabetes Mellitus',
    indicationB: 'Hypertension / Heart Failure',
    severity: 'HIGH',
    reason: 'Both start with "Meto-". Administering Metoprolol for diabetes can cause hypotension and mask hypoglycemia symptoms.',
    recommendation: 'Verify blood glucose and heart rate/blood pressure records.'
  },
  {
    drugA: 'Clonazepam',
    drugB: 'Lorazepam',
    indicationA: 'Seizures & Panic Disorder (Long-acting)',
    indicationB: 'Acute Anxiety & Sedation (Intermediate)',
    severity: 'HIGH',
    reason: 'Different dosing potencies (Clonazepam 0.5mg is not 1:1 with Lorazepam 0.5mg). Risk of oversedation or withdrawal.',
    recommendation: 'Confirm exact milligram dose and equivalency table.'
  },
  {
    drugA: 'Glipizide',
    drugB: 'Glyburide',
    indicationA: 'Sulfonylurea antidiabetic (shorter acting)',
    indicationB: 'Sulfonylurea antidiabetic (long-acting with active metabolites)',
    severity: 'HIGH',
    reason: 'Glyburide has high risk of prolonged severe hypoglycemia, particularly in elderly or renal impairment.',
    recommendation: 'Avoid Glyburide in geriatric patients (Beers Criteria). Use Glipizide or alternative.'
  },
  {
    drugA: 'Lamictal',
    drugB: 'Lamisil',
    indicationA: 'Anticonvulsant / Bipolar (Lamotrigine)',
    indicationB: 'Antifungal (Terbinafine)',
    severity: 'CRITICAL',
    reason: 'Rapid titration of Lamictal due to dosing error can trigger fatal Stevens-Johnson Syndrome (SJS).',
    recommendation: 'Confirm indication (neurological vs fungal). Verify slow dose escalation protocol.'
  }
];

function levenshteinDistance(s1: string, s2: string): number {
  const a = s1.toLowerCase().trim();
  const b = s2.toLowerCase().trim();
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function analyzePrescriptionSafety(
  medicineNames: string[],
  analysisId?: string
): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];
  const processedPairs = new Set<string>();

  // 1. Check Known LASA pairs
  for (const name of medicineNames) {
    if (!name || name.trim().length === 0) continue;
    const cleanName = name.trim().toLowerCase();

    for (const pair of KNOWN_LASA_PAIRS) {
      const drugALower = pair.drugA.toLowerCase();
      const drugBLower = pair.drugB.toLowerCase();

      // Check if current drug matches drugA or drugB
      const matchesA = cleanName.includes(drugALower) || levenshteinDistance(cleanName, drugALower) <= 2;
      const matchesB = cleanName.includes(drugBLower) || levenshteinDistance(cleanName, drugBLower) <= 2;

      if (matchesA || matchesB) {
        const primary = matchesA ? pair.drugA : pair.drugB;
        const confusedWith = matchesA ? pair.drugB : pair.drugA;
        const pairKey = `${pair.drugA}-${pair.drugB}`;

        if (!processedPairs.has(pairKey)) {
          processedPairs.add(pairKey);
          alerts.push({
            id: `alert-lasa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            analysis_id: analysisId,
            alert_type: 'LASA_SOUND_ALIKE',
            severity: pair.severity,
            matched_drug_a: primary,
            matched_drug_b: confusedWith,
            description: `Potential Look-Alike Sound-Alike (LASA) confusion risk with "${confusedWith}". ${pair.reason}`,
            recommendation: pair.recommendation,
            pharmacist_review_status: 'unreviewed',
            created_at: new Date().toISOString()
          });
        }
      }
    }
  }

  // 2. Check Drug-Drug interactions among prescribed items
  for (let i = 0; i < medicineNames.length; i++) {
    for (let j = i + 1; j < medicineNames.length; j++) {
      const drug1 = medicineNames[i].toLowerCase().trim();
      const drug2 = medicineNames[j].toLowerCase().trim();

      // Look up in catalog
      const cat1 = INITIAL_MEDICINE_CATALOG.find(
        (m) =>
          drug1.includes(m.medicine_name.toLowerCase()) ||
          drug1.includes(m.generic_name.toLowerCase())
      );

      if (cat1 && cat1.interactions) {
        for (const inter of cat1.interactions) {
          if (drug2.includes(inter.interacting_drug.toLowerCase())) {
            alerts.push({
              id: `alert-ddi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              analysis_id: analysisId,
              alert_type: 'DRUG_DRUG_INTERACTION',
              severity: inter.severity,
              matched_drug_a: cat1.medicine_name,
              matched_drug_b: inter.interacting_drug,
              description: `Known Drug-Drug Interaction: ${cat1.medicine_name} + ${inter.interacting_drug}. ${inter.effect}`,
              recommendation: 'Evaluate risk-benefit ratio. Adjust dosing schedule or substitute interacting agent.',
              pharmacist_review_status: 'unreviewed',
              created_at: new Date().toISOString()
            });
          }
        }
      }
    }
  }

  return alerts;
}
