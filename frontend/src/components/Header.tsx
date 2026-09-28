import React, { useState } from 'react';
import { 
  Building2, MapPin, Search, Play, Award, 
  Layers, CheckCircle2, AlertTriangle, ShieldCheck, 
  FileText, History, BarChart3, Database, SplitSquareVertical, Eye,
  Home, LogOut, ChevronDown, User
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRunDemo: () => void;
  onOpenPresentation: () => void;
  onGoToLanding: () => void;
  onOpenLogin: () => void;
  currentUser: { username: string; name: string; role: string; designation: string } | null;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSubmit: () => void;
  pendingCount: number;
  conflictCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRunDemo,
  onOpenPresentation,
  onGoToLanding,
  onOpenLogin,
  currentUser,
  onLogout,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  pendingCount,
  conflictCount
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'map', label: 'GIS Map Explorer', icon: MapPin },
    { id: 'ingestion', label: 'Data Ingestion', icon: Database },
    { id: 'harmonization', label: 'CRS & Schema Harmonizer', icon: Layers },
    { id: 'intelligence', label: 'Parcel Intelligence', icon: ShieldCheck },
    { id: 'conflicts', label: 'Conflict Engine', icon: AlertTriangle, badge: conflictCount },
    { id: 'ai-vision', label: 'AI Image & Change Detection', icon: Eye },
    { id: 'compare', label: 'Source Comparison', icon: SplitSquareVertical },
    { id: 'verification', label: 'Human Verification', icon: CheckCircle2, badge: pendingCount },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
    { id: 'audit', label: 'Audit Trail', icon: History },
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearchSubmit();
    }
  };

  return (
    <header>
      {/* Top Ministry Ribbon */}
      <div className="gov-top-bar">
        <div className="gov-emblem-tag">
          <span className="gov-flag-strip">
            <span className="gov-flag-saffron"></span>
            <span className="gov-flag-white"></span>
            <span className="gov-flag-green"></span>
          </span>
          MINISTRY OF RURAL DEVELOPMENT • GOVERNMENT OF INDIA
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button 
            onClick={onGoToLanding}
            style={{ background: 'transparent', border: 'none', color: '#cbd5e1', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Home size={12} />
            Portal Home
          </button>
          <span>National Land Record Modernization Programme (NLRMP)</span>
          <span style={{ color: '#38bdf8' }}>Smart India Hackathon • PS #SIH26013</span>
        </div>
      </div>

      {/* Main Platform Header */}
      <div className="main-header">
        <div className="brand-section">
          <div className="logo-badge" onClick={onGoToLanding} style={{ cursor: 'pointer' }}>
            <Building2 size={24} />
          </div>
          <div className="brand-text">
            <h1 onClick={onGoToLanding} style={{ cursor: 'pointer' }}>
              BHUMI-SYNC 
              <span className="sih-badge">SIH 2026 PROTOTYPE</span>
            </h1>
            <div className="tagline">One Map. One Truth. Smarter Land Records.</div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="header-actions">
          {/* Global Search */}
          <div className="search-input-wrapper">
            <Search className="search-icon" size={16} />
            <input
              type="text"
              placeholder="Search Parcel ID, Survey #, ULPIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* 1-Click Live Demo */}
          <button className="btn-demo-run" onClick={onRunDemo} title="Run Automated 8-Step End-to-End Ingestion & Harmonization Pipeline">
            <Play size={14} fill="currentColor" />
            Run Live Demo
          </button>

          {/* Presentation Mode */}
          <button className="btn-presentation" onClick={onOpenPresentation} title="Open SIH Pitch Deck & Story Presentation">
            <Award size={14} />
            Presentation Mode
          </button>

          {/* Officer Profile Dropdown */}
          <div style={{ position: 'relative' }}>
            <div 
              className="officer-badge"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              style={{ cursor: 'pointer' }}
            >
              <div className="officer-avatar">
                {currentUser ? currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'AS'}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {currentUser ? currentUser.name : 'Shri A. K. Sharma'}
                  <ChevronDown size={12} />
                </div>
                <div style={{ color: '#94a3b8', fontSize: '10px' }}>
                  {currentUser ? currentUser.role : 'GIS_OFFICER'}
                </div>
              </div>
            </div>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                border: '1px solid #cbd5e1',
                padding: '8px',
                minWidth: '220px',
                zIndex: 2000
              }}>
                <div style={{ padding: '6px 8px', borderBottom: '1px solid #e2e8f0', marginBottom: '4px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f2942' }}>
                    {currentUser?.name || 'Shri A. K. Sharma'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {currentUser?.designation || 'Senior Land Records Officer'}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onOpenLogin();
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '12px',
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <User size={14} color="#2563eb" />
                  Switch Officer Role
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onGoToLanding();
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '12px',
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Home size={14} color="#0f2942" />
                  Portal Home Page
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onLogout();
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px',
                    borderRadius: '4px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '12px',
                    color: '#dc2626',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderTop: '1px solid #e2e8f0'
                  }}
                >
                  <LogOut size={14} color="#dc2626" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="nav-tab-bar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`nav-tab ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={15} />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="tab-badge">{tab.badge}</span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
