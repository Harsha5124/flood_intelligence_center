import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginModal from './components/LoginModal';
import NotificationDrawer from './components/NotificationDrawer';
import BasinOverviewModal from './components/BasinOverviewModal';
import HydronChatbot from './chatbot/HydronChatbot';

import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import LiveGisPage from './pages/LiveGisPage';
import PredictionsPage from './pages/PredictionsPage';
import WeatherPage from './pages/WeatherPage';
import RiversPage from './pages/RiversPage';
import ReservoirsPage from './pages/ReservoirsPage';
import WarningsPage from './pages/WarningsPage';
import EvacuationPage from './pages/EvacuationPage';
import NotificationsPage from './pages/NotificationsPage';
import HistoryPage from './pages/HistoryPage';
import SimulatorPage from './pages/SimulatorPage';

import { fetchBasins, fetchNotifications, fetchUnreadCount } from './services/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState({
    id: 1,
    full_name: 'Dr. M. Krishnan',
    email: 'demo@hydron.app',
    role: 'Chief Hydrology Officer',
    department: 'State Disaster Management Authority'
  });

  const [activeTab, setActiveTab] = useState('landing');
  const [selectedBasinId, setSelectedBasinId] = useState('adyar');
  const [basins, setBasins] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [overviewBasin, setOverviewBasin] = useState(null);
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState(true);

  async function loadInitialData() {
    try {
      const [basinsData, notifsData, unreadData] = await Promise.all([
        fetchBasins(),
        fetchNotifications(),
        fetchUnreadCount()
      ]);
      setBasins(basinsData);
      setNotifications(notifsData);
      setUnreadCount(unreadData.unread_count || 0);
    } catch (err) {
      console.error('App init error:', err);
    }
  }

  useEffect(() => {
    loadInitialData();
    // Periodic refresh every 30 seconds
    const timer = setInterval(() => {
      loadInitialData();
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  function handleSelectBasinFromMap(basinId) {
    const found = basins.find(b => b.id.toLowerCase() === basinId.toLowerCase());
    if (activeTab === 'landing') {
      setOverviewBasin(found || { id: basinId, name: `${basinId.toUpperCase()} Basin`, modelled: false });
    } else {
      setSelectedBasinId(basinId);
    }
  }

  function handleViewDetailedFromOverview(basinId) {
    setOverviewBasin(null);
    setSelectedBasinId(basinId);
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
    } else {
      setActiveTab('dashboard');
    }
  }

  function handleAuthSuccess(res) {
    setIsAuthenticated(true);
    setUser(res.user);
    setActiveTab('dashboard');
  }

  function handleLogout() {
    setIsAuthenticated(false);
    setUser(null);
    setActiveTab('landing');
  }

  function handleExploreWorkstation() {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
    } else {
      setActiveTab('dashboard');
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#070d18] text-slate-100 selection:bg-cyan-500 selection:text-black">
      
      {/* Top Navigation Bar */}
      <Navbar
        isAuthenticated={isAuthenticated}
        user={user}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        unreadCount={unreadCount}
        activeTab={activeTab}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Authenticated Sidebar (Only visible when user is logged in & not on landing page) */}
        {isAuthenticated && activeTab !== 'landing' && (
          <Sidebar
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            selectedBasin={selectedBasinId}
            onSelectBasin={(bId) => setSelectedBasinId(bId)}
            basins={basins}
          />
        )}

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {activeTab === 'landing' && (
              <LandingPage
                basins={basins}
                onSelectBasin={handleSelectBasinFromMap}
                onOpenLogin={() => setIsLoginModalOpen(true)}
                onExploreWorkstation={handleExploreWorkstation}
              />
            )}

            {activeTab === 'dashboard' && (
              <DashboardPage
                basins={basins}
                selectedBasinId={selectedBasinId}
                onSelectBasin={(id) => setSelectedBasinId(id)}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'gis' && (
              <LiveGisPage
                selectedBasinId={selectedBasinId}
                onSelectBasin={(id) => setSelectedBasinId(id)}
              />
            )}

            {activeTab === 'predictions' && (
              <PredictionsPage
                selectedBasinId={selectedBasinId}
                onSelectBasin={(id) => setSelectedBasinId(id)}
              />
            )}

            {activeTab === 'weather' && (
              <WeatherPage
                selectedBasinId={selectedBasinId}
              />
            )}

            {activeTab === 'rivers' && (
              <RiversPage />
            )}

            {activeTab === 'reservoirs' && (
              <ReservoirsPage />
            )}

            {activeTab === 'warnings' && (
              <WarningsPage />
            )}

            {activeTab === 'evacuation' && (
              <EvacuationPage />
            )}

            {activeTab === 'notifications' && (
              <NotificationsPage />
            )}

            {activeTab === 'history' && (
              <HistoryPage />
            )}

            {activeTab === 'simulator' && (
              <SimulatorPage />
            )}
          </div>
        </main>

      </div>

      {/* Floating Hydron Assistant (Strictly Authenticated Only) */}
      {isAuthenticated && (
        <HydronChatbot currentBasin={selectedBasinId} />
      )}

      {/* Notification Drawer Panel */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        notifications={notifications}
        onRefresh={loadInitialData}
        audioAlertsEnabled={audioAlertsEnabled}
        onToggleAudio={() => setAudioAlertsEnabled(!audioAlertsEnabled)}
      />

      {/* Sign In / Sign Up Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Public Basin Overview Modal */}
      <BasinOverviewModal
        isOpen={!!overviewBasin}
        basin={overviewBasin}
        onClose={() => setOverviewBasin(null)}
        onViewDetailed={handleViewDetailedFromOverview}
      />

    </div>
  );
}
