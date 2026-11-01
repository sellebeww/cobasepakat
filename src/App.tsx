/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { CompanyProfile } from './components/company/CompanyProfile';
import { SpaceDashboard } from './components/dashboard/SpaceDashboard';
import { IssueDetail } from './components/issues/IssueDetail';
import { DecisionLibrary } from './components/library/DecisionLibrary';
import { TemplateLibrary } from './components/templates/TemplateLibrary';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { FacilitatorDirectory } from './components/facilitators/FacilitatorDirectory';
import { AuditLogView } from './components/audit/AuditLogView';
import { NewIssueModal } from './components/issues/NewIssueModal';
import { CobaSepakatLogo } from './components/brand/CobaSepakatLogo';
import { BrandKitModal } from './components/brand/BrandKitModal';
import { ArrowLeft, Play, Sparkles, Palette } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentIssue,
    issues,
    setActiveIssueId,
    appMode,
    setAppMode,
  } = useApp();

  const [showNewIssueModal, setShowNewIssueModal] = useState(false);
  const [showBrandKitModal, setShowBrandKitModal] = useState(false);

  const selectedIssue = currentIssue || issues[0];

  const handleEnterDemo = (issueId?: string) => {
    setAppMode('demo');
    if (issueId) {
      setActiveIssueId(issueId);
      setActiveTab('isu');
    } else {
      setActiveTab('beranda');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8FC] text-[#153A73]">
      <Navbar />

      <main className="flex-1 w-full">
        <AnimatePresence mode="wait">
          {appMode === 'company_profile' ? (
            <motion.div
              key="company_profile"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <CompanyProfile onEnterDemo={handleEnterDemo} />
            </motion.div>
          ) : (
            <motion.div
              key="demo_workspace"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6"
            >
              {activeTab === 'beranda' && (
                <SpaceDashboard onOpenNewIssueModal={() => setShowNewIssueModal(true)} />
              )}

              {activeTab === 'isu' && selectedIssue && (
                <IssueDetail
                  issue={selectedIssue}
                  onBack={() => setActiveTab('beranda')}
                />
              )}

              {activeTab === 'percobaan' && selectedIssue && (
                <IssueDetail
                  issue={selectedIssue}
                  onBack={() => setActiveTab('beranda')}
                />
              )}

              {activeTab === 'pustaka' && <DecisionLibrary />}

              {activeTab === 'templat' && <TemplateLibrary />}

              {activeTab === 'analitik' && <AnalyticsDashboard />}

              {activeTab === 'fasilitator' && <FacilitatorDirectory />}

              {activeTab === 'audit' && <AuditLogView />}

              {activeTab === 'pemasaran' && (
                <CompanyProfile onEnterDemo={handleEnterDemo} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CobaSepakatLogo variant="horizontal" size="sm" showTagline={true} />
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-[#5B6780]">
              <button
                onClick={() => {
                  setAppMode('company_profile');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#153A73] transition-colors"
              >
                Company Profile
              </button>
              <button
                onClick={() => handleEnterDemo()}
                className="hover:text-[#2272E8] font-semibold transition-colors flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-[#2272E8]" /> Demo Interaktif
              </button>
              <button
                onClick={() => setShowBrandKitModal(true)}
                className="hover:text-[#2FA882] font-semibold transition-colors flex items-center gap-1"
              >
                <Palette className="w-3 h-3" /> Logo & Brand Kit (No-BG)
              </button>
              <button
                onClick={() => {
                  setAppMode('demo');
                  setActiveTab('audit');
                }}
                className="hover:text-[#153A73] transition-colors"
              >
                Audit & Legal
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#5B6780]">
            <div>
              &copy; 2026 CobaSepakat Platform · Hak cipta dilindungi. Sesuai Undang-Undang Pelindungan Data Pribadi (UU PDP).
            </div>
            <div className="font-mono text-slate-400">
              Versi 1.0.0-PROD · Kluster Melati RT 04 Harmoni Asri
            </div>
          </div>
        </div>
      </footer>

      {showNewIssueModal && (
        <NewIssueModal onClose={() => setShowNewIssueModal(false)} />
      )}

      {showBrandKitModal && (
        <BrandKitModal onClose={() => setShowBrandKitModal(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
