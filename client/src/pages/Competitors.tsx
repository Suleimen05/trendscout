import { useState, useEffect } from 'react';
import { Users, UserPlus, TrendingUp, TrendingDown, Search, Filter, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Competitor, TikTokVideo } from '@/types';
import { toast } from 'sonner';

// Mock data
const mockCompetitors: Competitor[] = [
  {
    id: '1',
    username: 'viralcreator1',
    nickname: 'Viral Creator',
    avatar: '/avatar-placeholder.svg',
    followerCount: 2500000,
    videoCount: 342,
    avgViews: 450000,
    engagementRate: 8.5,
    topVideos: [] as TikTokVideo[],
    growthTrend: 'up',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '2',
    username: 'edutainment',
    nickname: 'EduTainment',
    avatar: '/avatar-placeholder.svg',
    followerCount: 1800000,
    videoCount: 567,
    avgViews: 320000,
    engagementRate: 12.3,
    topVideos: [] as TikTokVideo[],
    growthTrend: 'up',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: '3',
    username: 'biztips',
    nickname: 'Business Tips',
    avatar: '/avatar-placeholder.svg',
    followerCount: 890000,
    videoCount: 189,
    avgViews: 180000,
    engagementRate: 6.8,
    topVideos: [] as TikTokVideo[],
    growthTrend: 'stable',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
];

interface CompetitorCardProps {
  competitor: Competitor;
  isTracked: boolean;
  onToggleTracking: (competitor: Competitor) => void;
  onViewDetails: (competitor: Competitor) => void;
}

function CompetitorCard({ competitor, isTracked, onToggleTracking, onViewDetails }: CompetitorCardProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTrendIcon = () => {
    if (competitor.growthTrend === 'up') return TrendingUp;
    if (competitor.growthTrend === 'down') return TrendingDown;
    return null;
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Avatar with Platform Icon */}
          <div className="relative flex-shrink-0">
            <img
              src={competitor.avatar}
              alt={competitor.nickname}
              className="h-16 w-16 rounded-full object-cover"
            />
            {/* Platform badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-background flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-lg truncate">@{competitor.username}</h3>
                <p className="text-sm text-muted-foreground">{formatNumber(competitor.followerCount)} subscribers</p>
              </div>

              {/* Tracking Button */}
              <Button
                variant={isTracked ? "default" : "outline"}
                size="sm"
                className={cn(
                  "flex-shrink-0 ml-2",
                  isTracked && "bg-green-500 hover:bg-green-600"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleTracking(competitor);
                }}
              >
                {isTracked ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Tracking
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Track
                  </>
                )}
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Avg Views</p>
                <p className="font-medium">{formatNumber(competitor.avgViews)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Engagement</p>
                <p className="font-medium">{competitor.engagementRate}%</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Videos</p>
                <p className="font-medium">{competitor.videoCount}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              {TrendIcon && (
                <Badge variant="outline" className="text-xs">
                  <TrendIcon className={cn(
                    "h-3 w-3 mr-1",
                    competitor.growthTrend === 'up' && "text-green-600",
                    competitor.growthTrend === 'down' && "text-red-600"
                  )} />
                  {competitor.growthTrend === 'up' ? 'Growing' : competitor.growthTrend === 'down' ? 'Declining' : 'Stable'}
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-xs"
                onClick={() => onViewDetails(competitor)}
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Competitors() {
  // Load competitors from localStorage on mount
  const loadCompetitors = (): Competitor[] => {
    try {
      const stored = localStorage.getItem('competitors');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading competitors from localStorage:', error);
    }
    return mockCompetitors; // Fallback to mock data
  };

  const [competitors] = useState<Competitor[]>(loadCompetitors);
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set(['1', '2'])); // Mock: 2 are tracked
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState<'all' | 'tiktok' | 'instagram'>('all');
  const [filterSort, setFilterSort] = useState<'recent' | 'followers' | 'engagement'>('recent');

  // Save to localStorage whenever competitors change
  useEffect(() => {
    try {
      localStorage.setItem('competitors', JSON.stringify(competitors));
    } catch (error) {
      console.error('Error saving competitors to localStorage:', error);
    }
  }, [competitors]);

  const handleToggleTracking = (competitor: Competitor) => {
    setTrackedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(competitor.id)) {
        newSet.delete(competitor.id);
        toast.info(`Stopped tracking @${competitor.username}`);
      } else {
        newSet.add(competitor.id);
        toast.success(`Now tracking @${competitor.username}`);
      }
      return newSet;
    });
  };

  const handleAddCompetitor = async (username: string) => {
    if (!username.trim()) return;

    // Redirect to Account Search page with a message
    setShowAddForm(false);
    toast.info('Please use Account Search page to find and add accounts', {
      duration: 4000,
      description: 'Navigate to Account Search, search for the account, then click "Add to Competitors"',
    });
  };

  const handleViewDetails = (competitor: Competitor) => {
    // Navigate to details page or open modal
    toast.info(`Viewing details for @${competitor.username}`);
  };

  const filteredCompetitors = competitors.filter(c => {
    const matchesSearch = c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.nickname.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const trackedCount = Array.from(trackedIds).filter(id =>
    competitors.find(c => c.id === id)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Account Catalog</h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                Tracked: {trackedCount}
              </Badge>
              <Badge variant="outline" className="text-sm">
                Total: {competitors.length}
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground">
            Select accounts to track or add new ones
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add New Account
        </Button>
      </div>

      {/* Add Account Form */}
      {showAddForm && (
        <Card className="p-6 border-2 border-purple-500/20">
          <h3 className="font-semibold mb-4">Add New Account</h3>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by URL or username..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCompetitor(searchQuery)}
              />
            </div>
            <Button onClick={() => handleAddCompetitor(searchQuery)}>
              Add
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setSearchQuery('');
              }}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by URL or username..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && "bg-accent")}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>

          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <Card className="p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Platform</label>
              <div className="flex gap-2">
                {['all', 'tiktok', 'instagram'].map((platform) => (
                  <Button
                    key={platform}
                    variant={filterPlatform === platform ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterPlatform(platform as any)}
                  >
                    {platform === 'all' ? 'All Platforms' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <div className="flex gap-2">
                {[
                  { id: 'recent', label: 'Recently Added' },
                  { id: 'followers', label: 'Followers' },
                  { id: 'engagement', label: 'Engagement' },
                ].map((option) => (
                  <Button
                    key={option.id}
                    variant={filterSort === option.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterSort(option.id as any)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Competitors Grid */}
      {filteredCompetitors.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No accounts found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? 'Try a different search term'
                : 'Add your first account to start tracking competitors'
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowAddForm(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Your First Account
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompetitors.map((competitor) => (
            <CompetitorCard
              key={competitor.id}
              competitor={competitor}
              isTracked={trackedIds.has(competitor.id)}
              onToggleTracking={handleToggleTracking}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}
