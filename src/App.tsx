/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type React from 'react';
import { Suspense, lazy, useEffect, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { useDialogA11y } from './components/layout/useDialogA11y';
import { Toaster } from './components/layout/Toaster';
import { CompanyProfile } from './components/company/CompanyProfile';
import { NewIssueModal } from './components/issues/NewIssueModal';
import { CobaSepakatLogo } from './components/brand/CobaSepakatLogo';
import { BrandKitModal } from './components/brand/BrandKitModal';
import { Play, Palette } from 'lucide-react';

// Workspace views load on demand; the landing page (CompanyProfile) stays in the main chunk.
const SpaceDashboard = lazy(() => import('./components/dashboard/SpaceDashboard').then((m) => ({ default: m.SpaceDashboard })));
const IssueDetail = lazy(() => import('./components/issues/IssueDetail').then((m) => ({ default: m.IssueDetail })));
const DecisionLibrary = lazy(() => import('./components/library/DecisionLibrary').then((m) => ({ default: m.DecisionLibrary })));
const TemplateLibrary = lazy(() => import('./components/templates/TemplateLibrary').then((m) => ({ default: m.TemplateLibrary })));
const AnalyticsDashboard = lazy(() => import('./components/analytics/AnalyticsDashboard').then((m) => ({ default: m.AnalyticsDashboard })));
const FacilitatorDirectory = lazy(() => import('./components/facilitators/FacilitatorDirectory').then((m) => ({ default: m.FacilitatorDirectory })));
const AuditLogView = lazy(() => import('./components/audit/AuditLogView').then((m) => ({ default: m.AuditLogView })));

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

  useDialogA11y();

  const [showNewIssueModal, setShowNewIssueModal] = useState(false);
  const [showBrandKitModal, setShowBrandKitModal] = useState(false);

  const selectedIssue = currentIssue || issues[0];

  // Switching tabs or issues starts at the top instead of keeping the previous scroll position.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activeTab, selectedIssue?.id]);

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
    <div className="min-h-screen flex flex-col bg-brand-surface text-brand-navy">
      <Navbar />

      <main className="relative flex-1 w-full overflow-hidden">
        {appMode === 'demo' && (
          <>
            <img src="/assets/landing/blue-green-blob.svg" alt="" aria-hidden="true" className="pointer-events-none absolute -top-16 right-[-14%] w-[60%] max-w-[800px] rotate-12 opacity-60" />
            <img src="/assets/landing/blue-green-blob.svg" alt="" aria-hidden="true" className="pointer-events-none absolute top-[55%] -left-[18%] w-[50%] max-w-[700px] -rotate-6 opacity-40" />
          </>
        )}
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
              className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6"
            >
              <Suspense fallback={<p role="status" className="py-16 text-center text-sm text-brand-slate">Memuat…</p>}>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                <div
                  role="note"
                  className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-950"
                  data-testid="demo-banner"
                >
                  <strong>Mode demo.</strong> Semua nama, angka, dan kejadian di sini adalah data contoh fiktif yang disimpan di peramban Anda. Hasil bukan bukti pasti.
                </div>

                {activeTab === 'beranda' && (
                  <SpaceDashboard onOpenNewIssueModal={() => setShowNewIssueModal(true)} />
                )}

                {(activeTab === 'isu' || activeTab === 'percobaan') && selectedIssue && (
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
                </motion.div>
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer (the company profile renders its own) */}
      {appMode === 'demo' && (
      <footer className="border-t border-brand-border bg-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CobaSepakatLogo variant="horizontal" size="sm" showTagline={true} />
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-brand-slate">
              <button type="button"
                onClick={() => {
                  setAppMode('company_profile');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-brand-navy transition-colors"
              >
                Company Profile
              </button>
              <button type="button"
                onClick={() => handleEnterDemo()}
                className="hover:text-brand-blue font-semibold transition-colors flex items-center gap-1"
              >
                <Play className="w-3 h-3 fill-brand-blue" /> Demo Interaktif
              </button>
              <button type="button"
                onClick={() => setShowBrandKitModal(true)}
                className="hover:text-brand-green font-semibold transition-colors flex items-center gap-1"
              >
                <Palette className="w-3 h-3" /> Logo & Brand Kit (No-BG)
              </button>
              <button type="button"
                onClick={() => {
                  setAppMode('demo');
                  setActiveTab('audit');
                }}
                className="hover:text-brand-navy transition-colors"
              >
                Audit & Legal
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-brand-slate">
            <div>
              &copy; 2026 Vassel Goleyu. Hak cipta dilindungi. Mode demo menyimpan data hanya di peramban Anda.
            </div>
            <div className="font-mono text-slate-400">
              Versi demo · data contoh fiktif
            </div>
          </div>
        </div>
      </footer>
      )}

      {showNewIssueModal && (
        <NewIssueModal onClose={() => setShowNewIssueModal(false)} />
      )}

      {showBrandKitModal && (
        <BrandKitModal onClose={() => setShowBrandKitModal(false)} />
      )}

      <Toaster />
    </div>
  );
};

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </MotionConfig>
  );
}
