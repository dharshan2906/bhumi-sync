import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { GISMapExplorer } from './components/GISMapExplorer';
import { DigitalTwinDrawer } from './components/DigitalTwinDrawer';
import { DataIngestionView } from './components/DataIngestionView';
import { HarmonizationView } from './components/HarmonizationView';
import { ParcelIntelligenceView } from './components/ParcelIntelligenceView';
import { ConflictResolutionView } from './components/ConflictResolutionView';
import { AIImageryView } from './components/AIImageryView';
import { SourceComparisonView } from './components/SourceComparisonView';
import { HumanVerificationView } from './components/HumanVerificationView';
import { AuditTrailView } from './components/AuditTrailView';
import { ReportsExportView } from './components/ReportsExportView';
import { DemoModal } from './components/DemoModal';
import { PresentationModeModal } from './components/PresentationModeModal';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { api, DashboardStats, DatasetItem, ParcelDigitalTwin } from './services/api';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'landing' | 'login' | 'app'>('app');
  const [currentUser, setCurrentUser] = useState<{ username: string; name: string; role: string; designation: string } | null>({
    username: 'ak.sharma@landrecords.gov.in',
    name: 'Shri A. K. Sharma',
    designation: 'Senior Land Records & GIS Officer',
    role: 'GIS_OFFICER'
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [highlightParcelCode, setHighlightParcelCode] = useState<string | null>(null);

  // Modals & Panels
  const [selectedDigitalTwin, setSelectedDigitalTwin] = useState<ParcelDigitalTwin | null>(null);
  const [comparisonParcel, setComparisonParcel] = useState<ParcelDigitalTwin | null>(null);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState<boolean>(false);

  const loadInitialData = async () => {
    try {
      const [statsData, datasetsData] = await Promise.all([
        api.getDashboardStats(),
        api.getDatasets()
      ]);
      setStats(statsData);
      setDatasets(datasetsData);
    } catch (err) {
      console.error('Failed to load initial data', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleGlobalSearch = async () => {
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim();

    try {
      const dt = await api.getParcelByCode(query);
      setSelectedDigitalTwin(dt);
      setHighlightParcelCode(dt.parcel_id);
      setActiveTab('map');
      setViewMode('app');
    } catch (e) {
      setActiveTab('intelligence');
      setViewMode('app');
    }
  };

  const handleSelectParcelForInspection = (parcel: ParcelDigitalTwin) => {
    setSelectedDigitalTwin(parcel);
    setHighlightParcelCode(parcel.parcel_id);
  };

  const handleOpenSourceComparison = (parcel: ParcelDigitalTwin) => {
    setComparisonParcel(parcel);
    setActiveTab('compare');
  };

  const handleDemoComplete = () => {
    loadInitialData();
    setActiveTab('map');
    setViewMode('app');
  };

  // If user chooses to view Landing Page
  if (viewMode === 'landing') {
    return (
      <>
        <LandingPage
          onEnterApp={(role) => {
            if (role === 'ADMIN') {
              setCurrentUser({
                username: 'sunita.deshmukh@rural.gov.in',
                name: 'Dr. Sunita V. Deshmukh',
                designation: 'Director of Urban Land Records (MoRD)',
                role: 'ADMIN'
              });
            } else if (role === 'REVIEWER') {
              setCurrentUser({
                username: 'pc.raman@revenue.gov.in',
                name: 'Shri P. C. Raman',
                designation: 'Assistant Settlement Reviewer',
                role: 'REVIEWER'
              });
            } else {
              setCurrentUser({
                username: 'ak.sharma@landrecords.gov.in',
                name: 'Shri A. K. Sharma',
                designation: 'Senior Land Records & GIS Officer',
                role: 'GIS_OFFICER'
              });
            }
            setViewMode('app');
          }}
          onOpenLogin={() => setViewMode('login')}
          onOpenPresentation={() => setIsPresentationOpen(true)}
          totalParcels={stats?.total_parcels || 236}
          verifiedParcels={stats?.verified_parcels || 184}
          conflictsCount={stats?.boundary_conflicts || 14}
        />

        <PresentationModeModal
          isOpen={isPresentationOpen}
          onClose={() => setIsPresentationOpen(false)}
          onStartDemo={() => {
            setIsPresentationOpen(false);
            setIsDemoModalOpen(true);
            setViewMode('app');
          }}
        />
      </>
    );
  }

  // If user is on Login Screen
  if (viewMode === 'login') {
    return (
      <LoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setViewMode('app');
        }}
        onBackToLanding={() => setViewMode('landing')}
      />
    );
  }

  // Main Application Mode
  return (
    <div className="app-container">
      {/* Platform Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunDemo={() => setIsDemoModalOpen(true)}
        onOpenPresentation={() => setIsPresentationOpen(true)}
        onGoToLanding={() => setViewMode('landing')}
        onOpenLogin={() => setViewMode('login')}
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          setViewMode('login');
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={handleGlobalSearch}
        pendingCount={stats?.pending_verification || 0}
        conflictCount={stats?.boundary_conflicts || 0}
      />

      {/* Main Viewport Content */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <DashboardView
            stats={stats}
            onNavigateTab={setActiveTab}
            onSelectWard={(w) => {
              setSelectedWard(w);
              setActiveTab('map');
            }}
          />
        )}

        {activeTab === 'map' && (
          <GISMapExplorer
            selectedWard={selectedWard}
            setSelectedWard={setSelectedWard}
            onSelectParcel={handleSelectParcelForInspection}
            highlightParcelCode={highlightParcelCode}
          />
        )}

        {activeTab === 'ingestion' && (
          <DataIngestionView
            datasets={datasets}
            onRefresh={loadInitialData}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'harmonization' && (
          <HarmonizationView
            datasets={datasets}
            onRefresh={loadInitialData}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'intelligence' && (
          <ParcelIntelligenceView
            onSelectParcel={handleSelectParcelForInspection}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'conflicts' && (
          <ConflictResolutionView
            onSelectParcel={handleSelectParcelForInspection}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'ai-vision' && (
          <AIImageryView
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'compare' && (
          <SourceComparisonView
            selectedParcel={comparisonParcel || selectedDigitalTwin}
          />
        )}

        {activeTab === 'verification' && (
          <HumanVerificationView
            onSelectParcel={handleSelectParcelForInspection}
            onRefresh={loadInitialData}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsExportView
            stats={stats}
          />
        )}

        {activeTab === 'audit' && (
          <AuditTrailView />
        )}
      </main>

      {/* Parcel Digital Twin Side Drawer */}
      <DigitalTwinDrawer
        parcel={selectedDigitalTwin}
        onClose={() => {
          setSelectedDigitalTwin(null);
          setHighlightParcelCode(null);
        }}
        onRefresh={loadInitialData}
        onOpenComparison={handleOpenSourceComparison}
      />

      {/* 8-Step Live Automated Demo Modal */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onComplete={handleDemoComplete}
      />

      {/* SIH Presentation Mode Modal */}
      <PresentationModeModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        onStartDemo={() => {
          setIsPresentationOpen(false);
          setIsDemoModalOpen(true);
        }}
      />
    </div>
  );
};

export default App;
