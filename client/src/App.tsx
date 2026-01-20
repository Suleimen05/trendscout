import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/pages/Dashboard';
import { Trending } from '@/pages/Trending';
import { Discover } from '@/pages/Discover';
import { AIScripts } from '@/pages/AIScripts';
import { Competitors } from '@/pages/Competitors';
import { SettingsPage } from '@/pages/Settings';
import { Help } from '@/pages/Help';
import { useAppState } from '@/hooks/useAppState';
import { Toaster } from '@/components/ui/sonner';
import type { User } from '@/types';

// Mock user for demo
const mockUser: User = {
  id: '1',
  email: 'user@example.com',
  name: 'John Doe',
  avatar: '',
  subscription: 'pro',
  credits: 150,
  preferences: {
    niches: ['entertainment', 'education'],
    languages: ['en'],
    regions: ['US'],
  },
};

function App() {
  const {
    user,
    login,
    logout,
    notifications,
    unreadCount,
    addNotification,
    markNotificationAsRead,
    sidebarOpen,
    toggleSidebar,
    searchQuery,
    updateSearchQuery,
  } = useAppState();

  // Simulate login for demo
  const [authChecked, setAuthChecked] = useState(false);
  
  if (!authChecked) {
    login(mockUser);
    setAuthChecked(true);
    
    // Add some mock notifications
    addNotification({
      type: 'trend',
      title: 'New Trend Alert',
      message: '#fyp is trending with 2.4M new videos',
      actionUrl: '/trending',
    });
    
    addNotification({
      type: 'competitor',
      title: 'Competitor Activity',
      message: '@viralcreator1 posted a new viral video',
    });
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} onToggle={toggleSidebar} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header
            onToggleSidebar={toggleSidebar}
            user={user}
            notifications={notifications}
            unreadCount={unreadCount}
            searchQuery={searchQuery}
            onSearchChange={updateSearchQuery}
            onMarkNotificationRead={markNotificationAsRead}
            onLogout={logout}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-muted/30">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/trending" element={<Trending />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/discover/*" element={<Discover />} />
                <Route path="/ai-scripts" element={<AIScripts />} />
                <Route path="/competitors" element={<Competitors />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/help" element={<Help />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>

        {/* Toast Notifications */}
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

export default App;
