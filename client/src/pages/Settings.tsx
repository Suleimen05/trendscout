import { useState, useEffect } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { apiService } from '@/services/api';
import { toast } from 'sonner';

interface UsageData {
  plan: string;
  reset_date: string;
  credits: {
    monthly_used: number;
    monthly_limit: number;
    bonus: number;
    rollover: number;
    total_available: number;
  };
  stats: {
    scripts_generated: number;
    chat_messages: number;
    deep_analyze: number;
  };
  auto_mode: {
    enabled: boolean;
    savings: number;
  };
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'account' | 'usage' | 'billing'>('general');
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);

  // Load usage data when Usage tab is opened
  useEffect(() => {
    if (activeTab === 'usage' && !usageData) {
      loadUsageData();
    }
  }, [activeTab]);

  const loadUsageData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getUsageStats();
      setUsageData(data);
    } catch (error: any) {
      console.error('Failed to load usage data:', error);
      toast.error('Failed to load usage statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoMode = async () => {
    if (!usageData) return;

    setToggling(true);
    try {
      const newState = !usageData.auto_mode.enabled;
      const result = await apiService.toggleAutoMode(newState);

      // Update local state
      setUsageData({
        ...usageData,
        auto_mode: {
          ...usageData.auto_mode,
          enabled: result.enabled
        }
      });

      toast.success(result.message);
    } catch (error: any) {
      console.error('Failed to toggle auto mode:', error);
      toast.error(error.response?.data?.detail || 'Failed to toggle Auto Mode');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Categories */}
      <div className="w-64 border-r border-border bg-card/50 p-4">
        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'general'
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'account'
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            Account
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'usage'
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            Usage
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'billing'
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            Billing
          </button>
        </nav>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <SettingsIcon className="h-7 w-7" />
              Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your account preferences and notifications
            </p>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Profile Settings */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  👤 Profile
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Full name</label>
                    <input
                      type="text"
                      placeholder="Akylbek Karim"
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email</label>
                    <input
                      type="email"
                      placeholder="akylbekkarim01@gmail.com"
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition">
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Preferences */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  🎨 Preferences
                </h3>

                <div className="space-y-4">
                  {/* Dark Mode */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Dark Mode</p>
                      <p className="text-xs text-muted-foreground">Enable dark theme</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                      <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                    </button>
                  </div>

                  {/* Language & Region */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Language</label>
                      <select className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>English</option>
                        <option>Spanish</option>
                        <option>French</option>
                        <option>German</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Region</label>
                      <select className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                        <option>United States</option>
                        <option>United Kingdom</option>
                        <option>Canada</option>
                        <option>Australia</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  🔔 Notifications
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Get emails about trends and updates</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                      <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Weekly Summary</p>
                      <p className="text-xs text-muted-foreground">Receive weekly usage reports</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary">
                      <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Account Security */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  🔐 Account Security
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Password</label>
                    <input
                      type="password"
                      value="••••••••••••"
                      disabled
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm"
                    />
                  </div>

                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition">
                    Change Password
                  </button>
                </div>
              </div>

              {/* Connected Accounts */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  🔗 Connected Accounts
                </h3>

                <div className="space-y-4">
                  {/* TikTok */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                        TT
                      </div>
                      <div>
                        <p className="text-sm font-medium">TikTok</p>
                        <p className="text-xs text-muted-foreground">@fitgirl_kz · Connected</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition">
                      Disconnect
                    </button>
                  </div>

                  {/* Instagram - Soon */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                        IG
                      </div>
                      <div>
                        <p className="text-sm font-medium">Instagram</p>
                        <p className="text-xs text-muted-foreground">Soon</p>
                      </div>
                    </div>
                  </div>

                  {/* YouTube - Soon */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-semibold">
                        YT
                      </div>
                      <div>
                        <p className="text-sm font-medium">YouTube</p>
                        <p className="text-xs text-muted-foreground">Soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600 dark:text-red-400">
                  ⚠️ Danger Zone
                </h3>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading usage data...</p>
                  </div>
                </div>
              ) : usageData ? (
                <>
                  {/* Current Plan */}
                  <div className="rounded-lg border border-border bg-card p-6">
                    <div>
                      <h3 className="text-lg font-semibold">Your Plan: {usageData.plan.charAt(0).toUpperCase() + usageData.plan.slice(1)}</h3>
                      <p className="text-sm text-muted-foreground">Resets: {new Date(usageData.reset_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>

                  {/* AI Credits */}
                  <div className="rounded-lg border border-border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      💎 AI Credits
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">
                            {usageData.credits.monthly_limit - usageData.credits.monthly_used} / {usageData.credits.monthly_limit} remaining
                          </span>
                          <span className="text-sm font-medium">
                            {Math.round(((usageData.credits.monthly_limit - usageData.credits.monthly_used) / usageData.credits.monthly_limit) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full"
                            style={{ width: `${Math.round(((usageData.credits.monthly_limit - usageData.credits.monthly_used) / usageData.credits.monthly_limit) * 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="pt-2 space-y-1 text-sm">
                        <p className="text-muted-foreground">
                          Bonus Credits: <span className="text-foreground font-medium">{usageData.credits.bonus}</span> (never expire)
                        </p>
                        <p className="text-muted-foreground">
                          Rollover: <span className="text-foreground font-medium">{usageData.credits.rollover}</span> (from last month)
                        </p>
                      </div>

                      <div className="pt-2">
                        <p className="text-sm font-medium mb-2">
                          Total Available: <span className="text-lg">{usageData.credits.total_available} credits</span>
                        </p>
                      </div>

                      <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition">
                        Buy More Credits
                      </button>
                    </div>
                  </div>

                  {/* This Month Stats */}
                  <div className="rounded-lg border border-border bg-card p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      📊 This Month
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">AI Scripts Generated</span>
                        <span className="font-medium">{usageData.stats.scripts_generated}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Chat Messages</span>
                        <span className="font-medium">{usageData.stats.chat_messages}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Deep Analyze</span>
                        <span className="font-medium">{usageData.stats.deep_analyze}</span>
                      </div>
                      <div className="pt-2 border-t border-border mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Total Credits Used</span>
                          <span className="font-semibold">{usageData.credits.monthly_used}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Auto Mode */}
                  <div className="rounded-lg border border-border bg-card p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        🤖 Auto Mode
                      </h3>
                      <button
                        onClick={handleToggleAutoMode}
                        disabled={toggling}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          usageData.auto_mode.enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                        } ${toggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            usageData.auto_mode.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      AI automatically chooses the best model for each task
                    </p>

                    {usageData.auto_mode.enabled && usageData.auto_mode.savings > 0 && (
                      <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <p className="text-sm">
                          💰 <span className="font-medium text-green-600 dark:text-green-400">
                            Saved this month: {usageData.auto_mode.savings} credits
                          </span> vs manual Pro model
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Failed to load usage data</p>
                  <button
                    onClick={loadUsageData}
                    className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="space-y-6">
              {/* Current Plan */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  💳 Current Plan
                </h3>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/50 dark:border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-lg">Creator Plan</p>
                        <p className="text-sm text-muted-foreground">$20/month</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Next billing: Feb 28, 2026</p>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:opacity-90 transition">
                      Upgrade to Pro
                    </button>
                    <button className="px-4 py-2 border border-border rounded-lg font-medium hover:bg-accent transition">
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  💰 Payment Method
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 rounded bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold">
                        VISA
                      </div>
                      <div>
                        <p className="text-sm font-medium">•••• •••• •••• 6411</p>
                        <p className="text-xs text-muted-foreground">Expires 12/27</p>
                      </div>
                    </div>
                    <button className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition">
                      Edit
                    </button>
                  </div>

                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition">
                    Update Payment Method
                  </button>
                </div>
              </div>

              {/* Billing History */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  🧾 Billing History
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="text-sm font-medium">Feb 1, 2026</p>
                      <p className="text-xs text-muted-foreground">Creator Plan - Monthly</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">$20.00</span>
                      <button className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition">
                        Invoice
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="text-sm font-medium">Jan 1, 2026</p>
                      <p className="text-xs text-muted-foreground">Creator Plan - Monthly</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">$20.00</span>
                      <button className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition">
                        Invoice
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="text-sm font-medium">Dec 1, 2025</p>
                      <p className="text-xs text-muted-foreground">Creator Plan - Monthly</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">$20.00</span>
                      <button className="px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-accent transition">
                        Invoice
                      </button>
                    </div>
                  </div>

                  <button className="w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition">
                    View All
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Export with original name for compatibility
export { SettingsPage as Settings };
