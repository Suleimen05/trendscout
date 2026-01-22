import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Zap, Clock, ArrowRight, Play, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DashboardStats } from '@/components/DashboardStats';
import { VideoCard } from '@/components/VideoCard';
import { AIScriptGenerator } from '@/components/AIScriptGenerator';
import { useTrendingVideos } from '@/hooks/useTikTok';
import { useDashboard } from '@/hooks/useTikTok';
import { useAIScriptGenerator } from '@/hooks/useTikTok';
import type { TikTokVideo } from '@/types';
import { DevAccessGate } from '@/components/DevAccessGate';

export function Dashboard() {
  const { videos: trendingVideos, loading: videosLoading } = useTrendingVideos('US', 20);
  const { stats, loading: statsLoading } = useDashboard();
  const [selectedVideo, setSelectedVideo] = useState<TikTokVideo | null>(null);
  const [showAIScript, setShowAIScript] = useState(false);
  
  const {
    script,
    loading: scriptLoading,
    generate,
  } = useAIScriptGenerator();

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

  // Get top 3 viral videos
  const topViralVideos = [...trendingVideos]
    .sort((a, b) => (b.viralScore || 0) - (a.viralScore || 0))
    .slice(0, 3);

  // Get recently trending
  const recentVideos = [...trendingVideos]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  return (
    <DevAccessGate pageName="Analytics Dashboard">
      <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Discover viral trends and create engaging content
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Link to="/discover">
            <Sparkles className="h-4 w-4 mr-2" />
            Discover Trends
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <DashboardStats stats={stats} loading={statsLoading} />

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

      {/* Top Viral Opportunities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-500" />
              Top Viral Opportunities
            </h2>
            <p className="text-muted-foreground">
              Videos with high viral potential based on engagement metrics
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/discover?filter=viral" className="flex items-center gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {videosLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="aspect-[9/16] max-h-[400px] rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topViralVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onGenerateScript={handleGenerateScript}
                showStats
                size="medium"
              />
            ))}
          </div>
        )}
      </div>

      {/* Recently Trending */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Recently Trending
            </h2>
            <p className="text-muted-foreground">
              Fresh viral content from the last 24 hours
            </p>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/trending" className="flex items-center gap-1">
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {videosLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[9/16] rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onGenerateScript={handleGenerateScript}
                showStats={false}
                size="small"
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Play className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Videos Analyzed Today</p>
              <p className="text-2xl font-bold">{stats?.totalVideosAnalyzed || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Views</p>
              <p className="text-2xl font-bold">2.4M</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Viral Score</p>
              <p className="text-2xl font-bold">85%</p>
            </div>
          </div>
        </Card>
      </div>
      </div>
    </DevAccessGate>
  );
}
