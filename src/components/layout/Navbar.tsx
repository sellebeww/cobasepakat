/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CobaSepakatLogo } from '../brand/CobaSepakatLogo';
import { BrandKitModal } from '../brand/BrandKitModal';
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
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [showCommunityDropdown, setShowCommunityDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBrandKitModal, setShowBrandKitModal] = useState(false);

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
        <div className="bg-[#153A73] text-white text-xs px-4 py-2 flex items-center justify-between border-b border-[#2272E8]/20">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-200">
              <span className="w-2 h-2 rounded-full bg-[#2FA882]" />
              <span>Mode Demo Interaktif Aktif: Kluster Melati RT 04 (Hari ke-8 Uji Coba)</span>
            </span>

            <button
              onClick={() => setAppMode('company_profile')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Company Profile Resmi
            </button>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Zone 1: Brand Wordmark */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setAppMode('company_profile')}
                className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2272E8] rounded-lg"
              >
                <CobaSepakatLogo variant="horizontal" size="sm" showTagline={false} />
              </button>

              {/* Mode indicator pill */}
              <span
                className={`hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  appMode === 'company_profile'
                    ? 'bg-blue-50 text-[#2272E8] border border-blue-200'
                    : 'bg-emerald-50 text-[#2FA882] border border-emerald-200'
                }`}
              >
                {appMode === 'company_profile' ? 'Company Profile' : 'Demo Interaktif'}
              </span>
            </div>

            {/* Zone 2: Navigation Links with Functional Dropdowns (anti-slop, clean) */}
            {appMode === 'company_profile' ? (
              <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-[#5B6780]">
                {/* Metodologi 9 Tahap Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowMethodDropdown(!showMethodDropdown)}
                    onBlur={() => setTimeout(() => setShowMethodDropdown(false), 200)}
                    className="flex items-center gap-1 hover:text-[#153A73] transition-colors py-1"
                  >
                    <span>Metodologi 9 Tahap</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {showMethodDropdown && (
                    <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-2 z-50 space-y-1">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-[#5B6780] uppercase tracking-wider">
                        Alur Resolusi Empiris
                      </div>
                      <button
                        onClick={() => {
                          setAppMode('demo');
                          setActiveTab('isu');
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#F5F8FC] transition-colors flex items-start gap-2.5"
                      >
                        <Sliders className="w-4 h-4 text-[#2272E8] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-[#153A73]">Dugaan & Bukti Pengubah</div>
                          <div className="text-[10px] text-[#5B6780]">Mind-changing evidence sebelum pengujian</div>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setAppMode('demo');
                          setActiveTab('isu');
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#F5F8FC] transition-colors flex items-start gap-2.5"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-[#153A73]">Gerbang Kelayakan (Safety Gate)</div>
                          <div className="text-[10px] text-[#5B6780]">7 butir filter & 2 penghalang mutlak</div>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setAppMode('demo');
                          setActiveTab('percobaan');
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#F5F8FC] transition-colors flex items-start gap-2.5"
                      >
                        <Clock className="w-4 h-4 text-[#2FA882] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-[#153A73]">Pelaksanaan 14 Hari</div>
                          <div className="text-[10px] text-[#5B6780]">Garis dasar, guardrail, & pencatatan data</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Komunitas & Sasaran Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowCommunityDropdown(!showCommunityDropdown)}
                    onBlur={() => setTimeout(() => setShowCommunityDropdown(false), 200)}
                    className="flex items-center gap-1 hover:text-[#153A73] transition-colors py-1"
                  >
                    <span>Solusi Komunitas</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {showCommunityDropdown && (
                    <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] p-2 z-50 space-y-1">
                      <button
                        onClick={() => {
                          setAppMode('demo');
                          setActiveTab('beranda');
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-[#F5F8FC] text-xs font-semibold text-[#153A73]"
                      >
                        RT/RW & Paguyuban Perumahan
                      </button>
                      <button
                        onClick={() => {
                          setAppMode('demo');
                          setActiveTab('templat');
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-[#F5F8FC] text-xs font-semibold text-[#153A73]"
                      >
                        Koperasi & Organisasi Mahasiswa
                      </button>
                      <button
                        onClick={() => {
                          setAppMode('demo');
                          setActiveTab('analitik');
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-[#F5F8FC] text-xs font-semibold text-[#153A73]"
                      >
                        Pengelola Kawasan & Apartemen
                      </button>
                    </div>
                  )}
                </div>

                {/* Direct quick links */}
                <button
                  onClick={() => {
                    setAppMode('demo');
                    setActiveTab('pustaka');
                  }}
                  className="hover:text-[#153A73] transition-colors whitespace-nowrap"
                >
                  Studi Kasus Lorong B
                </button>

                <button
                  onClick={() => setShowBrandKitModal(true)}
                  className="hover:text-[#2FA882] transition-colors whitespace-nowrap flex items-center gap-1"
                >
                  <Palette className="w-3.5 h-3.5 text-[#2FA882]" />
                  Brand Kit (No-BG)
                </button>
              </nav>
            ) : (
              /* Demo Mode Navigation Tabs */
              <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-[#5B6780]">
                <button
                  onClick={() => setActiveTab('beranda')}
                  className={`hover:text-[#153A73] transition-colors whitespace-nowrap py-1 border-b-2 ${
                    activeTab === 'beranda'
                      ? 'border-[#2272E8] text-[#153A73] font-bold'
                      : 'border-transparent'
                  }`}
                >
                  Dasbor Ruang
                </button>
                <button
                  onClick={() => setActiveTab('isu')}
                  className={`hover:text-[#153A73] transition-colors whitespace-nowrap py-1 border-b-2 ${
                    activeTab === 'isu' || activeTab === 'percobaan'
                      ? 'border-[#2272E8] text-[#153A73] font-bold'
                      : 'border-transparent'
                  }`}
                >
                  Isu & Percobaan
                </button>
                <button
                  onClick={() => setActiveTab('pustaka')}
                  className={`hover:text-[#153A73] transition-colors whitespace-nowrap py-1 border-b-2 ${
                    activeTab === 'pustaka'
                      ? 'border-[#2272E8] text-[#153A73] font-bold'
                      : 'border-transparent'
                  }`}
                >
                  Pustaka Keputusan
                </button>
                <button
                  onClick={() => setActiveTab('templat')}
                  className={`hover:text-[#153A73] transition-colors whitespace-nowrap py-1 border-b-2 ${
                    activeTab === 'templat'
                      ? 'border-[#2272E8] text-[#153A73] font-bold'
                      : 'border-transparent'
                  }`}
                >
                  Templat Uji Coba
                </button>
                <button
                  onClick={() => setActiveTab('analitik')}
                  className={`hover:text-[#153A73] transition-colors whitespace-nowrap py-1 border-b-2 ${
                    activeTab === 'analitik'
                      ? 'border-[#2272E8] text-[#153A73] font-bold'
                      : 'border-transparent'
                  }`}
                >
                  Analitik Dampak
                </button>
                <button
                  onClick={() => setActiveTab('fasilitator')}
                  className={`hover:text-[#153A73] transition-colors whitespace-nowrap py-1 border-b-2 ${
                    activeTab === 'fasilitator'
                      ? 'border-[#2272E8] text-[#153A73] font-bold'
                      : 'border-transparent'
                  }`}
                >
                  Layanan Fasilitasi
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`hover:text-[#153A73] transition-colors whitespace-nowrap py-1 border-b-2 ${
                    activeTab === 'audit'
                      ? 'border-[#2272E8] text-[#153A73] font-bold'
                      : 'border-transparent'
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
                    onClick={() => setShowBrandKitModal(true)}
                    className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#153A73] bg-[#F5F8FC] hover:bg-slate-100 border border-[#E2E8F0] transition-colors"
                  >
                    <Palette className="w-3.5 h-3.5 text-[#2FA882]" />
                    <span>Brand Kit</span>
                  </button>
                  <button
                    onClick={() => setAppMode('demo')}
                    className="px-4 py-2 bg-[#2272E8] hover:bg-[#1A58B8] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Masuk ke Demo Interaktif</span>
                  </button>
                </>
              ) : (
                /* Demo Mode Persona Switcher & Space Picker */
                <>
                  {/* Space selector */}
                  <div className="relative hidden xl:block">
                    <button
                      onClick={() => setShowSpaceDropdown(!showSpaceDropdown)}
                      className="flex items-center gap-1.5 text-xs text-[#5B6780] hover:text-[#153A73] font-medium py-1.5 px-2.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F5F8FC] transition-colors"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#2272E8]" />
                      <span className="truncate max-w-[130px]">{currentSpace.name}</span>
                      <ChevronDown className="w-3 h-3 text-[#5B6780]" />
                    </button>

                    {showSpaceDropdown && (
                      <div className="absolute right-0 mt-1 w-64 bg-white rounded-2xl shadow-lg border border-[#E2E8F0] py-1 z-50">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-[#5B6780] uppercase tracking-wider">
                          Pilih Ruang Komunitas
                        </div>
                        {spaces.map((sp) => (
                          <button
                            key={sp.id}
                            onClick={() => {
                              setCurrentSpaceId(sp.id);
                              setShowSpaceDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-[#F5F8FC] ${
                              sp.id === currentSpace.id
                                ? 'bg-[#2272E8]/5 text-[#2272E8] font-semibold'
                                : 'text-[#153A73]'
                            }`}
                          >
                            <span>{sp.name}</span>
                            <span className="text-[10px] text-[#5B6780]">
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
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[#E2E8F0] hover:border-[#2272E8] bg-[#F5F8FC] hover:bg-white transition-all text-left"
                      title="Ganti Persona untuk Menguji Hak Akses (RBAC)"
                    >
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0 border border-white"
                      />
                      <div className="hidden sm:flex flex-col text-left leading-none">
                        <span className="text-xs font-semibold text-[#153A73] truncate max-w-[100px]">
                          {currentUser.displayName || currentUser.name}
                        </span>
                        <span className="text-[10px] text-[#2FA882] font-medium mt-0.5">
                          {getRoleBadge(currentUser.role)}
                        </span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-[#5B6780]" />
                    </button>

                    {showUserDropdown && (
                      <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#E2E8F0] py-2 z-50">
                        <div className="px-4 py-2 border-b border-[#E2E8F0]">
                          <div className="text-xs font-bold text-[#153A73]">Uji Peran (RBAC)</div>
                          <div className="text-[11px] text-[#5B6780]">
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
                              className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-[#F5F8FC] transition-colors ${
                                u.id === currentUser.id ? 'bg-[#2272E8]/5' : ''
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
                                      ? 'font-bold text-[#2272E8]'
                                      : 'font-medium text-[#153A73]'
                                  }`}
                                >
                                  {u.displayName || u.name}
                                </span>
                                <span className="text-[10px] text-[#5B6780]">
                                  {getRoleBadge(u.role)} · {u.unitLabel}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="px-4 pt-2 border-t border-[#E2E8F0] flex justify-between items-center">
                          <button
                            onClick={() => {
                              if (confirm('Kembalikan semua data ke kondisi seed awal?')) {
                                resetAllData();
                                setShowUserDropdown(false);
                              }
                            }}
                            className="text-[11px] text-[#5B6780] hover:text-[#DC2626] flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Reset Data Demo
                          </button>
                          <span className="text-[10px] text-slate-400 font-mono">v1.0-MVP</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setAppMode('company_profile')}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-[#153A73] rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Company Profile</span>
                  </button>
                </>
              )}

              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-[#5B6780] hover:text-[#153A73] hover:bg-[#F5F8FC]"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E2E8F0] bg-white px-4 pt-2 pb-4 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
              <span className="text-xs font-bold text-[#153A73]">Navigasi Aplikasi</span>
              <button
                onClick={() => {
                  setAppMode(appMode === 'company_profile' ? 'demo' : 'company_profile');
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-bold text-[#2272E8]"
              >
                {appMode === 'company_profile' ? 'Buka Demo →' : '← Company Profile'}
              </button>
            </div>

            {appMode === 'company_profile' ? (
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setAppMode('demo');
                    setActiveTab('beranda');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-[#2272E8] bg-blue-50 rounded-xl"
                >
                  ▶ Masuk ke Demo Interaktif
                </button>
                <button
                  onClick={() => {
                    setShowBrandKitModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-[#153A73] hover:bg-[#F5F8FC] rounded-xl"
                >
                  Logo & Brand Kit (No-BG)
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
                    activeTab === 'beranda' ? 'bg-[#2272E8]/10 text-[#2272E8] font-bold' : 'text-[#153A73]'
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
                    activeTab === 'isu' ? 'bg-[#2272E8]/10 text-[#2272E8] font-bold' : 'text-[#153A73]'
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
                    activeTab === 'pustaka' ? 'bg-[#2272E8]/10 text-[#2272E8] font-bold' : 'text-[#153A73]'
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
                    activeTab === 'templat' ? 'bg-[#2272E8]/10 text-[#2272E8] font-bold' : 'text-[#153A73]'
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
                    activeTab === 'analitik' ? 'bg-[#2272E8]/10 text-[#2272E8] font-bold' : 'text-[#153A73]'
                  }`}
                >
                  Analitik Dampak
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Brand Kit Modal Trigger */}
      {showBrandKitModal && <BrandKitModal onClose={() => setShowBrandKitModal(false)} />}
    </>
  );
};
