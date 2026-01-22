import { useState } from 'react';
import { Search, Users, UserPlus, TrendingUp, Eye, Video, BarChart3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/api';
import type { ProfileReport } from '@/types';
import { toast } from 'sonner';

interface SearchResult {
  username: string;
  report: ProfileReport | null;
  loading: boolean;
  error: string | null;
}

export function AccountSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const extractUsername = (input: string): string => {
    // Remove whitespace
    let cleaned = input.trim();

    // If it's a URL, extract username from it
    if (cleaned.includes('tiktok.com') || cleaned.includes('://')) {
      try {
        // Extract username from URL patterns:
        // https://www.tiktok.com/@username
        // https://www.tiktok.com/@username?...
        // https://www.tiktok.com/@username/video/...
        const match = cleaned.match(/@([a-zA-Z0-9._]+)/);
        if (match && match[1]) {
          return match[1].toLowerCase();
        }

        // Try to extract from /username pattern
        const pathMatch = cleaned.match(/tiktok\.com\/([a-zA-Z0-9._]+)/);
        if (pathMatch && pathMatch[1] && !pathMatch[1].startsWith('@')) {
          return pathMatch[1].toLowerCase();
        }
      } catch (e) {
        console.error('Error parsing URL:', e);
      }
    }

    // Otherwise, just clean the username
    return cleaned.toLowerCase().replace('@', '').replace(/[^a-z0-9._]/g, '');
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a username or TikTok URL to search');
      return;
    }

    const cleanUsername = extractUsername(searchQuery);

    // Check if already searched
    const existingResult = searchResults.find(r => r.username === cleanUsername);
    if (existingResult) {
      toast.info('This account is already in the results');
      return;
    }

    // Add placeholder result
    const newResult: SearchResult = {
      username: cleanUsername,
      report: null,
      loading: true,
      error: null,
    };

    setSearchResults([newResult, ...searchResults]);
    setSearching(true);

    try {
      const report = await apiService.getProfileReport(cleanUsername);

      setSearchResults(prev =>
        prev.map(r =>
          r.username === cleanUsername
            ? { ...r, report, loading: false }
            : r
        )
      );

      toast.success(`Found account: @${cleanUsername}`);
    } catch (error) {
      console.error('Error searching account:', error);

      setSearchResults(prev =>
        prev.map(r =>
          r.username === cleanUsername
            ? { ...r, loading: false, error: 'Account not found or error loading data' }
            : r
        )
      );

      toast.error('Failed to load account data');
    } finally {
      setSearching(false);
      setSearchQuery('');
    }
  };

  const handleAddAsCompetitor = async (username: string) => {
    // Find the report data that's already loaded
    const result = searchResults.find(r => r.username === username);

    if (!result || !result.report) {
      toast.error('No data available for this account');
      return;
    }

    try {
      // Get existing competitors from localStorage
      const storedCompetitors = localStorage.getItem('competitors');
      const competitors = storedCompetitors ? JSON.parse(storedCompetitors) : [];

      // Check if already added
      if (competitors.some((c: any) => c.username === username)) {
        toast.info(`@${username} is already in competitors list`);
        return;
      }

      // Transform ProfileReport to Competitor format without making new API call
      const newCompetitor = {
        id: `competitor_${Date.now()}`,
        username: result.report.author.username,
        nickname: result.report.author.nickname,
        avatar: result.report.author.avatar,
        followerCount: result.report.author.followers,
        videoCount: result.report.full_feed.length,
        avgViews: result.report.metrics.avg_views,
        engagementRate: result.report.metrics.engagement_rate,
        topVideos: result.report.top_3_hits,
        growthTrend: result.report.metrics.status === 'Rising' ? 'up' : 'stable',
        lastActivity: new Date().toISOString(),
      };

      // Save to localStorage
      competitors.push(newCompetitor);
      localStorage.setItem('competitors', JSON.stringify(competitors));

      toast.success(`Added @${username} to competitors list`);
    } catch (error) {
      console.error('Error adding competitor:', error);
      toast.error('Failed to add as competitor');
    }
  };

  const removeResult = (username: string) => {
    setSearchResults(prev => prev.filter(r => r.username !== username));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Search className="h-7 w-7" />
            Account Search
          </h1>
          <p className="text-muted-foreground">
            Search and analyze TikTok accounts by username
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Search for Accounts</h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Enter TikTok username (e.g., @username or username)..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={searching}
            />
          </div>
          <Button
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {searching ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Search
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Search Results ({searchResults.length})
          </h2>
          {searchResults.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchResults([])}
            >
              Clear All
            </Button>
          )}
        </div>

        {searchResults.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No searches yet</h3>
              <p className="text-muted-foreground">
                Enter a TikTok username above to analyze an account
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {searchResults.map((result) => (
              <SearchResultCard
                key={result.username}
                result={result}
                onAddAsCompetitor={handleAddAsCompetitor}
                onRemove={removeResult}
                formatNumber={formatNumber}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface SearchResultCardProps {
  result: SearchResult;
  onAddAsCompetitor: (username: string) => void;
  onRemove: (username: string) => void;
  formatNumber: (num: number) => string;
}

function SearchResultCard({ result, onAddAsCompetitor, onRemove, formatNumber }: SearchResultCardProps) {
  if (result.loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </div>
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (result.error || !result.report) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">@{result.username}</h3>
                <p className="text-sm text-destructive">{result.error}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => onRemove(result.username)}
            >
              ×
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const report = result.report;
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'rising':
        return 'text-green-600';
      case 'falling':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'rising':
        return TrendingUp;
      default:
        return BarChart3;
    }
  };

  const StatusIcon = getStatusIcon(report.metrics.status);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <img
            src={report.author.avatar || '/avatar-placeholder.svg'}
            alt={report.author.nickname}
            className="h-16 w-16 rounded-full object-cover"
          />

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <CardTitle className="text-xl">{report.author.nickname}</CardTitle>
                <p className="text-sm text-muted-foreground">@{report.author.username}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onAddAsCompetitor(result.username)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add to Competitors
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => onRemove(result.username)}
                >
                  ×
                </Button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-purple-500" />
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <p className="text-lg font-bold">{formatNumber(report.author.followers)}</p>
              </div>

              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <p className="text-xs text-muted-foreground">Avg Views</p>
                </div>
                <p className="text-lg font-bold">{formatNumber(report.metrics.avg_views)}</p>
              </div>

              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="h-4 w-4 text-green-500" />
                  <p className="text-xs text-muted-foreground">Engagement</p>
                </div>
                <p className="text-lg font-bold">{report.metrics.engagement_rate.toFixed(1)}%</p>
              </div>

              <div className="p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-1">
                  <Video className="h-4 w-4 text-pink-500" />
                  <p className="text-xs text-muted-foreground">Videos</p>
                </div>
                <p className="text-lg font-bold">{report.full_feed.length}</p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-4 flex items-center gap-4">
              <Badge
                variant="outline"
                className={cn('flex items-center gap-1', getStatusColor(report.metrics.status))}
              >
                <StatusIcon className="h-3 w-3" />
                {report.metrics.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Efficiency Score: {report.metrics.efficiency_score.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">
                Avg Viral Lift: {report.metrics.avg_viral_lift.toFixed(1)}x
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Top Videos Preview */}
      {report.top_3_hits.length > 0 && (
        <CardContent>
          <h4 className="font-semibold mb-3 text-sm">Top Performing Videos</h4>
          <div className="grid grid-cols-3 gap-3">
            {report.top_3_hits.map((video) => (
              <a
                key={video.id}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-[9/16] rounded-lg overflow-hidden bg-muted hover:ring-2 hover:ring-purple-500 transition-all"
              >
                <img
                  src={video.cover_url || '/video-placeholder.svg'}
                  alt={video.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <div className="flex items-center gap-2 text-white text-xs">
                      <Eye className="h-3 w-3" />
                      {formatNumber(video.views)}
                    </div>
                    <div className="text-white text-xs mt-1">
                      UTS: {video.uts_score.toFixed(1)}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
