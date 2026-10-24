/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { PrescriptionScanner } from './components/PrescriptionScanner';
import { MedicinePhotoScanner } from './components/MedicinePhotoScanner';
import { MedicineCatalogView } from './components/MedicineCatalogView';
import { ChatbotView } from './components/ChatbotView';
import { VoiceAssistantView } from './components/VoiceAssistantView';
import { SafetyReportView } from './components/SafetyReportView';
import { AboutPrivacyView } from './components/AboutPrivacyView';
import { AuthModal } from './components/AuthModal';
import { ActivePage, PrescriptionAnalysis } from './types';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  const [currentAnalysis, setCurrentAnalysis] = useState<PrescriptionAnalysis | null>(null);

  const handleSelectAnalysis = (analysis: PrescriptionAnalysis) => {
    setCurrentAnalysis(analysis);
  };

  const handleAnalysisSaved = (analysis: PrescriptionAnalysis) => {
    setCurrentAnalysis(analysis);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
        {/* Navigation Bar */}
        <Navbar activePage={activePage} setActivePage={setActivePage} />

        {/* Dynamic Page Views */}
        <main className="flex-1 flex flex-col">
          {activePage === 'landing' && (
            <LandingPage setActivePage={setActivePage} />
          )}

          {activePage === 'dashboard' && (
            <Dashboard 
              setActivePage={setActivePage} 
              onSelectAnalysis={handleSelectAnalysis} 
            />
          )}

          {activePage === 'scanner' && (
            <PrescriptionScanner 
              currentAnalysis={currentAnalysis} 
              onAnalysisSaved={handleAnalysisSaved} 
              setActivePage={setActivePage} 
            />
          )}

          {activePage === 'photo_scanner' && (
            <MedicinePhotoScanner setActivePage={setActivePage} />
          )}

          {activePage === 'catalog' && (
            <MedicineCatalogView setActivePage={setActivePage} />
          )}

          {activePage === 'chatbot' && (
            <ChatbotView setActivePage={setActivePage} />
          )}

          {activePage === 'voice' && (
            <VoiceAssistantView setActivePage={setActivePage} />
          )}

          {activePage === 'safety_report' && (
            <SafetyReportView 
              analysis={currentAnalysis} 
              setActivePage={setActivePage} 
            />
          )}

          {activePage === 'about_privacy' && (
            <AboutPrivacyView setActivePage={setActivePage} />
          )}
        </main>

        {/* Global Supabase Auth & Connection Modal */}
        <AuthModal />
      </div>
    </AuthProvider>
  );
}
