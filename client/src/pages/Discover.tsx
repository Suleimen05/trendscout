import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { VideoCard } from '@/components/VideoCard';
import { AIScriptGenerator } from '@/components/AIScriptGenerator';
import { cn } from '@/lib/utils';
import { useSearchWithFilters } from '@/hooks/useTikTok';
import { useAIScriptGenerator } from '@/hooks/useTikTok';
import type { TikTokVideo, SearchFilters } from '@/types';

export function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<TikTokVideo | null>(null);
  const [showAIScript, setShowAIScript] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: (searchParams.get('sort') as SearchFilters['sortBy']) || 'viral',
    dateRange: (searchParams.get('time') as SearchFilters['dateRange']) || '7d',
    minViews: searchParams.get('minViews') ? Number(searchParams.get('minViews')) : undefined,
    maxViews: searchParams.get('maxViews') ? Number(searchParams.get('maxViews')) : undefined,
    minDuration: searchParams.get('minDuration') ? Number(searchParams.get('minDuration')) : undefined,
    maxDuration: searchParams.get('maxDuration') ? Number(searchParams.get('maxDuration')) : undefined,
  });

  const [searchKeyword, setSearchKeyword] = useState('');
  const { videos, loading, refetch } = useSearchWithFilters({
    ...filters,
    niche: searchQuery || searchKeyword,
  });
  
  const {
    script,
    loading: scriptLoading,
    generate,
  } = useAIScriptGenerator();

  // Update URL params when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    if (searchQuery) newParams.set('q', searchQuery);
    if (filters.sortBy) newParams.set('sort', filters.sortBy);
    if (filters.dateRange) newParams.set('time', filters.dateRange);
    if (filters.minViews) newParams.set('minViews', filters.minViews.toString());
    if (filters.maxViews) newParams.set('maxViews', filters.maxViews.toString());
    if (filters.minDuration) newParams.set('minDuration', filters.minDuration.toString());
    if (filters.maxDuration) newParams.set('maxDuration', filters.maxDuration.toString());
    setSearchParams(newParams);
  }, [searchQuery, filters, setSearchParams]);

  const handleSearch = () => {
    setSearchKeyword(searchQuery);
    refetch();
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      sortBy: 'viral',
      dateRange: '7d',
    });
    setSearchQuery('');
  };

  const handleGenerateScript = async (video: TikTokVideo) => {
    setSelectedVideo(video);
    setShowAIScript(true);
    await generate(
      video.description || video.title || '',
      {
        playCount: video.stats.playCount,
        diggCount: video.stats.diggCount,
        commentCount: video.stats.commentCount,
        shareCount: video.stats.shareCount,
      },
      'engaging',
      'general',
      Math.floor((video.video?.duration || 30000) / 1000)
    );
  };

  const handleRegenerateScript = async () => {
    if (selectedVideo) {
      await generate(
        selectedVideo.description || selectedVideo.title || '',
        {
          playCount: selectedVideo.stats.playCount,
          diggCount: selectedVideo.stats.diggCount,
          commentCount: selectedVideo.stats.commentCount,
          shareCount: selectedVideo.stats.shareCount,
        },
        'engaging',
        'general',
        Math.floor((selectedVideo.video?.duration || 30000) / 1000)
      );
    }
  };

  const sortOptions = [
    { id: 'viral', label: 'Viral Score', icon: '🔥' },
    { id: 'views', label: 'Most Views', icon: '👁️' },
    { id: 'engagement', label: 'Engagement', icon: '❤️' },
    { id: 'recent', label: 'Most Recent', icon: '🕐' },
  ];

  const dateRangeOptions = [
    { id: '24h', label: 'Last 24 hours' },
    { id: '7d', label: 'Last 7 days' },
    { id: '30d', label: 'Last 30 days' },
    { id: '90d', label: 'Last 90 days' },
  ];

  const activeFilterCount = [
    filters.minViews,
    filters.maxViews,
    filters.minDuration,
    filters.maxDuration,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Search className="h-7 w-7" />
            Discover Videos
          </h1>
          <p className="text-muted-foreground">
            Search and filter through millions of viral videos
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(showFilters && 'bg-accent')}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-2 bg-purple-600 text-white">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by keyword, hashtag, or creator..."
          className="pl-10 pr-24"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
          onClick={handleSearch}
        >
          Search
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Advanced Filters
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sort By */}
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <div className="relative">
                <select
                  className="w-full appearance-none bg-background border border-input rounded-md px-3 py-2 text-sm"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  {sortOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <div className="relative">
                <select
                  className="w-full appearance-none bg-background border border-input rounded-md px-3 py-2 text-sm"
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                >
                  {dateRangeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Views Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Min Views</label>
              <select
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                value={filters.minViews || ''}
                onChange={(e) => handleFilterChange('minViews', e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">Any</option>
                <option value="10000">10K+</option>
                <option value="50000">50K+</option>
                <option value="100000">100K+</option>
                <option value="500000">500K+</option>
                <option value="1000000">1M+</option>
                <option value="10000000">10M+</option>
              </select>
            </div>

            {/* Duration Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Duration</label>
              <select
                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                value={filters.maxDuration || ''}
                onChange={(e) => handleFilterChange('maxDuration', e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">Any</option>
                <option value="15">Under 15s</option>
                <option value="30">Under 30s</option>
                <option value="60">Under 1min</option>
                <option value="180">Under 3min</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              onClick={refetch}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Apply Filters
            </Button>
            <Button variant="outline" onClick={clearFilters}>
              Reset
            </Button>
          </div>
        </Card>
      )}

      {/* AI Script Generator */}
      {showAIScript && (
        <AIScriptGenerator
          video={selectedVideo}
          script={script}
          loading={scriptLoading}
          onGenerate={async () => {
            if (selectedVideo) {
              await handleGenerateScript(selectedVideo);
            }
          }}
          onRegenerate={handleRegenerateScript}
        />
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {loading ? 'Loading...' : `${videos.length} videos found`}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort:</span>
          <Badge variant="secondary">
            {sortOptions.find(s => s.id === filters.sortBy)?.label}
          </Badge>
        </div>
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No videos found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find more content
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {videos.map((video, index) => (
            <div
              key={video.id}
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{
                animationDelay: `${index * 50}ms`,
                animationDuration: '500ms',
                animationFillMode: 'backwards',
              }}
            >
              <VideoCard
                video={video}
                onGenerateScript={handleGenerateScript}
                showStats
                size="medium"
              />
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {!loading && videos.length > 0 && (
        <div className="flex justify-center pt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={refetch}
          >
            Load More Videos
          </Button>
        </div>
      )}
    </div>
  );
}
