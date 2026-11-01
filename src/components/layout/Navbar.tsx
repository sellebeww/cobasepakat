/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CobaSepakatLogo } from '../brand/CobaSepakatLogo';
import { scrollToSection } from '../company/CompanyProfile';
import {
  Users,
  ChevronDown,
  Building2,
  RotateCcw,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sliders,
  Layers,
  Palette,
  Play,
  FileCheck2,
  Clock,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    users,
    setCurrentUser,
    spaces,
    currentSpace,
    setCurrentSpaceId,
    activeTab,
    setActiveTab,
    appMode,
    setAppMode,
    resetAllData,
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSpaceDropdown, setShowSpaceDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Dropdowns close on outside click and Escape, like any native menu.
  useEffect(() => {
    const closeAll = () => {
      setShowUserDropdown(false);
      setShowSpaceDropdown(false);
      setConfirmReset(false);
    };
    const onPointer = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) closeAll();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAll();
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // A destructive reset needs a second click within 4s, without a blocking browser dialog.
  useEffect(() => {
    if (!confirmReset) return;
    const t = window.setTimeout(() => setConfirmReset(false), 4000);
    return () => window.clearTimeout(t);
  }, [confirmReset]);

  const companyLinks = [
    { id: 'tentang', label: 'Tentang' },
    { id: 'fitur', label: 'Fitur' },
    { id: 'cara-kerja', label: 'Cara Kerja' },
    { id: 'faq', label: 'FAQ' },
  ];

  const enterDemo = () => {
    setAppMode('demo');
    setActiveTab('beranda');
    window.scrollTo({ top: 0 });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'pengurus':
        return 'Pengurus RT/RW';
      case 'pengusul':
        return 'Pengusul';
      case 'fasilitator':
        return 'Fasilitator';
      case 'pemantau_independen':
        return 'Pemantau Independen';
      case 'pengelola_kawasan':
        return 'Estate Manager';
      default:
        return 'Warga / Anggota';
    }
  };

  return (
    <>
      {/* Top Banner when in Demo Mode to make returning to Company Profile effortless */}
      {appMode === 'demo' && (
        <div className="bg-brand-sky/60 text-brand-navy text-xs px-4 py-2 flex items-center justify-between border-b border-brand-border">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-brand-navy font-medium">
              <span className="w-2 h-2 rounded-full bg-brand-green" />
              <span className="sm:hidden">Mode Demo Interaktif</span>
              <span className="hidden sm:inline">Mode Demo Interaktif Aktif: Kluster Melati RT 04 (Hari ke-8 Uji Coba)</span>
            </span>

            <button
              onClick={() => setAppMode('company_profile')}
              className="px-3.5 py-1 bg-white hover:bg-brand-surface-blue text-brand-blue border border-brand-border rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Kembali ke Company Profile Resmi</span><span className="sm:hidden">Profil</span>
            </button>
          </div>
        </div>
      )}

      <header ref={headerRef} className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Zone 1: Brand Wordmark */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setAppMode('company_profile')}
                className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue rounded-lg"
              >
                <CobaSepakatLogo variant="horizontal" size="sm" showTagline={false} />
              </button>

              {appMode === 'demo' && (
                <span className="hidden 2xl:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-mint text-brand-green border border-brand-green-light/40">
                  Demo Interaktif
                </span>
              )}
            </div>

            {/* Zone 2: Navigation Links with Functional Dropdowns (anti-slop, clean) */}
            {appMode === 'company_profile' ? (
              <nav aria-label="Navigasi utama" className="hidden lg:flex items-center gap-10 text-sm font-semibold text-brand-navy">
                {companyLinks.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => scrollToSection(l.id)}
                    className="hover:text-brand-blue transition-colors"
                  >
                    {l.label}
                  </button>
                ))}
              </nav>
            ) : (
              /* Demo Mode Navigation Tabs */
              <nav aria-label="Navigasi demo" className="hidden lg:flex items-center gap-0.5 text-xs font-medium text-brand-slate">
                <button
                  onClick={() => setActiveTab('beranda')}
                  className={`hover:text-brand-navy transition-colors whitespace-nowrap px-2.5 py-1.5 rounded-full ${
                    activeTab === 'beranda'
                      ? 'bg-brand-sky/60 text-brand-navy font-bold'
                      : 'hover:bg-brand-surface-blue/70'
                  }`}
                >
                  Dasbor Ruang
                </button>
                <button
                  onClick={() => setActiveTab('isu')}
                  className={`hover:text-brand-navy transition-colors whitespace-nowrap px-2.5 py-1.5 rounded-full ${
                    activeTab === 'isu' || activeTab === 'percobaan'
                      ? 'bg-brand-sky/60 text-brand-navy font-bold'
                      : 'hover:bg-brand-surface-blue/70'
                  }`}
                >
                  Isu & Percobaan
                </button>
                <button
                  onClick={() => setActiveTab('pustaka')}
                  className={`hover:text-brand-navy transition-colors whitespace-nowrap px-2.5 py-1.5 rounded-full ${
                    activeTab === 'pustaka'
                      ? 'bg-brand-sky/60 text-brand-navy font-bold'
                      : 'hover:bg-brand-surface-blue/70'
                  }`}
                >
                  Pustaka Keputusan
                </button>
                <button
                  onClick={() => setActiveTab('templat')}
                  className={`hover:text-brand-navy transition-colors whitespace-nowrap px-2.5 py-1.5 rounded-full ${
                    activeTab === 'templat'
                      ? 'bg-brand-sky/60 text-brand-navy font-bold'
                      : 'hover:bg-brand-surface-blue/70'
                  }`}
                >
                  Templat Uji Coba
                </button>
                <button
                  onClick={() => setActiveTab('analitik')}
                  className={`hover:text-brand-navy transition-colors whitespace-nowrap px-2.5 py-1.5 rounded-full ${
                    activeTab === 'analitik'
                      ? 'bg-brand-sky/60 text-brand-navy font-bold'
                      : 'hover:bg-brand-surface-blue/70'
                  }`}
                >
                  Analitik Dampak
                </button>
                <button
                  onClick={() => setActiveTab('fasilitator')}
                  className={`hover:text-brand-navy transition-colors whitespace-nowrap px-2.5 py-1.5 rounded-full ${
                    activeTab === 'fasilitator'
                      ? 'bg-brand-sky/60 text-brand-navy font-bold'
                      : 'hover:bg-brand-surface-blue/70'
                  }`}
                >
                  Layanan Fasilitasi
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`hover:text-brand-navy transition-colors whitespace-nowrap px-2.5 py-1.5 rounded-full ${
                    activeTab === 'audit'
                      ? 'bg-brand-sky/60 text-brand-navy font-bold'
                      : 'hover:bg-brand-surface-blue/70'
                  }`}
                >
                  Log Audit
                </button>
              </nav>
            )}

            {/* Zone 3: CTA & Personas */}
            <div className="flex items-center gap-3 shrink-0">
              {appMode === 'company_profile' ? (
                <>
                  <button
                    onClick={() => enterDemo()}
                    className="hidden sm:block px-5 py-2 rounded-full border border-brand-blue text-brand-blue hover:bg-brand-surface-blue text-xs font-bold transition-colors"
                  >
                    Masuk
                  </button>
                  <button
                    onClick={() => enterDemo()}
                    className="px-5 py-2 bg-brand-blue-dark hover:bg-brand-navy text-white rounded-full text-xs font-bold transition-colors shadow-card"
                  >
                    Mulai Sekarang
                  </button>
                </>
              ) : (
                /* Demo Mode Persona Switcher & Space Picker */
                <>
                  {/* Space selector */}
                  <div className="relative hidden 2xl:block">
                    <button
                      onClick={() => setShowSpaceDropdown(!showSpaceDropdown)}
                      className="flex items-center gap-1.5 text-xs text-brand-slate hover:text-brand-navy font-medium py-1.5 px-2.5 rounded-xl border border-brand-border hover:bg-brand-surface transition-colors"
                    >
                      <Building2 className="w-3.5 h-3.5 text-brand-blue" />
                      <span className="truncate max-w-[130px]">{currentSpace.name}</span>
                      <ChevronDown className="w-3 h-3 text-brand-slate" />
                    </button>

                    {showSpaceDropdown && (
                      <div className="absolute right-0 mt-1 w-64 bg-white rounded-2xl shadow-lg border border-brand-border py-1 z-50">
                        <div className="px-3 py-1.5 text-xs font-bold text-brand-slate uppercase tracking-wider">
                          Pilih Ruang Komunitas
                        </div>
                        {spaces.map((sp) => (
                          <button
                            key={sp.id}
                            onClick={() => {
                              setCurrentSpaceId(sp.id);
                              setShowSpaceDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-brand-surface ${
                              sp.id === currentSpace.id
                                ? 'bg-brand-blue/5 text-brand-blue font-semibold'
                                : 'text-brand-navy'
                            }`}
                          >
                            <span>{sp.name}</span>
                            <span className="text-xs text-brand-slate">
                              {sp.unitCount} Unit · {sp.activeMemberCount} Warga Aktif
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Role Persona Switcher */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-brand-border hover:border-brand-blue bg-brand-surface hover:bg-white transition-all text-left"
                      title="Ganti Persona untuk Menguji Hak Akses (RBAC)"
                      aria-haspopup="menu"
                      aria-expanded={showUserDropdown}
                    >
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0 border border-white"
                      />
                      <div className="hidden sm:flex flex-col text-left leading-none">
                        <span className="text-xs font-semibold text-brand-navy truncate max-w-[100px]">
                          {currentUser.displayName || currentUser.name}
                        </span>
                        <span className="text-xs text-brand-green font-medium mt-0.5">
                          {getRoleBadge(currentUser.role)}
                        </span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-brand-slate" />
                    </button>

                    {showUserDropdown && (
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-brand-border py-2 z-50">
                        <div className="px-4 py-2 border-b border-brand-border">
                          <div className="text-xs font-bold text-brand-navy">Uji Peran (RBAC)</div>
                          <div className="text-xs text-brand-slate">
                            Ganti persona untuk mencoba alur dari sudut pandang warga, pengusul, pengurus, atau fasilitator:
                          </div>
                        </div>
                        <div className="max-h-72 overflow-y-auto py-1">
                          {users.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => {
                                setCurrentUser(u);
                                setShowUserDropdown(false);
                              }}
                              className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-brand-surface transition-colors ${
                                u.id === currentUser.id ? 'bg-brand-blue/5' : ''
                              }`}
                            >
                              <img
                                src={u.avatarUrl}
                                alt={u.name}
                                className="w-8 h-8 rounded-full object-cover shrink-0"
                              />
                              <div className="flex flex-col leading-tight overflow-hidden">
                                <span
                                  className={`text-xs ${
                                    u.id === currentUser.id
                                      ? 'font-bold text-brand-blue'
                                      : 'font-medium text-brand-navy'
                                  }`}
                                >
                                  {u.displayName || u.name}
                                </span>
                                <span className="text-xs text-brand-slate">
                                  {getRoleBadge(u.role)} · {u.unitLabel}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="px-4 pt-2 border-t border-brand-border flex justify-between items-center">
                          <button
                            onClick={() => {
                              if (!confirmReset) {
                                setConfirmReset(true);
                                return;
                              }
                              resetAllData();
                              setConfirmReset(false);
                              setShowUserDropdown(false);
                            }}
                            className={`text-xs flex items-center gap-1 ${
                              confirmReset ? 'text-status-stopped font-bold' : 'text-brand-slate hover:text-status-stopped'
                            }`}
                          >
                            <RotateCcw className="w-3 h-3" />
                            {confirmReset ? 'Klik lagi untuk konfirmasi' : 'Reset Data Demo'}
                          </button>
                          <span className="text-xs text-slate-400 font-mono">v1.0-MVP</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setAppMode('company_profile')}
                    aria-label="Kembali ke Company Profile"
                    title="Kembali ke Company Profile"
                    className="px-3.5 py-2 bg-brand-surface-blue hover:bg-brand-sky text-brand-navy rounded-full text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span className="hidden 2xl:inline">Company Profile</span>
                  </button>
                </>
              )}

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
                aria-expanded={mobileMenuOpen}
                className="lg:hidden p-2 rounded-lg text-brand-slate hover:text-brand-navy hover:bg-brand-surface"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-brand-border bg-white px-4 pt-2 pb-4 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-brand-border">
              <span className="text-xs font-bold text-brand-navy">Navigasi Aplikasi</span>
              <button
                onClick={() => {
                  setAppMode(appMode === 'company_profile' ? 'demo' : 'company_profile');
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-bold text-brand-blue"
              >
                {appMode === 'company_profile' ? 'Buka Demo →' : '← Company Profile'}
              </button>
            </div>

            {appMode === 'company_profile' ? (
              <div className="space-y-1">
                {companyLinks.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => {
                      scrollToSection(l.id);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-surface rounded-xl"
                  >
                    {l.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    enterDemo();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-bold text-brand-blue bg-brand-surface-blue rounded-xl"
                >
                  Masuk / Mulai Sekarang
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('beranda');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl ${
                    activeTab === 'beranda' ? 'bg-brand-blue/10 text-brand-blue font-bold' : 'text-brand-navy'
                  }`}
                >
                  Dasbor Ruang Komunitas
                </button>
                <button
                  onClick={() => {
                    setActiveTab('isu');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl ${
                    activeTab === 'isu' ? 'bg-brand-blue/10 text-brand-blue font-bold' : 'text-brand-navy'
                  }`}
                >
                  Isu & Percobaan
                </button>
                <button
                  onClick={() => {
                    setActiveTab('pustaka');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl ${
                    activeTab === 'pustaka' ? 'bg-brand-blue/10 text-brand-blue font-bold' : 'text-brand-navy'
                  }`}
                >
                  Pustaka Keputusan
                </button>
                <button
                  onClick={() => {
                    setActiveTab('templat');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl ${
                    activeTab === 'templat' ? 'bg-brand-blue/10 text-brand-blue font-bold' : 'text-brand-navy'
                  }`}
                >
                  Templat Uji Coba
                </button>
                <button
                  onClick={() => {
                    setActiveTab('analitik');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl ${
                    activeTab === 'analitik' ? 'bg-brand-blue/10 text-brand-blue font-bold' : 'text-brand-navy'
                  }`}
                >
                  Analitik Dampak
                </button>
                <button
                  onClick={() => {
                    setActiveTab('fasilitator');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl ${
                    activeTab === 'fasilitator' ? 'bg-brand-blue/10 text-brand-blue font-bold' : 'text-brand-navy'
                  }`}
                >
                  Layanan Fasilitasi
                </button>
                <button
                  onClick={() => {
                    setActiveTab('audit');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-xl ${
                    activeTab === 'audit' ? 'bg-brand-blue/10 text-brand-blue font-bold' : 'text-brand-navy'
                  }`}
                >
                  Log Audit
                </button>
              </div>
            )}
          </div>
        )}
      </header>

    </>
  );
};
