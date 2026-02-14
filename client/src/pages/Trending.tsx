import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Search, TrendingUp, Calendar, Hash, Flame, Clock, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useTrendingHashtags } from '@/hooks/useTikTok';
import { useTrendAnalysis } from '@/hooks/useTikTok';
import type { Hashtag, TrendAnalysis } from '@/types';
import { DevAccessGate } from '@/components/DevAccessGate';

const getTimeRangeOptions = (t: TFunction) => [
  { id: '24h', label: t('timeRange.24h'), icon: Clock },
  { id: '7d', label: t('timeRange.7d'), icon: Calendar },
  { id: '30d', label: t('timeRange.30d'), icon: Calendar },
];

interface TrendingHashtagCardProps {
  hashtag: Hashtag;
  onAnalyze: (hashtag: string) => void;
  t: TFunction;
}

function TrendingHashtagCard({ hashtag, onAnalyze, t }: TrendingHashtagCardProps) {
  const isTrending = hashtag.trending;
  const growthIcon = (hashtag.growthRate || 0) > 20 ? ArrowUpRight : (hashtag.growthRate || 0) < -10 ? ArrowDownRight : Minus;
  const GrowthIcon = growthIcon;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-300 hover:shadow-lg',
        isTrending && 'border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50'
      )}
      onClick={() => onAnalyze(hashtag.name)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-lg">#{hashtag.name}</h3>
          </div>
          {isTrending && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
              <Flame className="h-3 w-3 mr-1" />
              {t('card.hot')}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-2xl font-bold">
              {formatNumber(hashtag.stats.viewCount)}
            </p>
            <p className="text-xs text-muted-foreground">{t('card.totalViews')}</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {formatNumber(hashtag.stats.videoCount)}
            </p>
            <p className="text-xs text-muted-foreground">{t('card.videos')}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GrowthIcon
              className={cn(
                'h-4 w-4',
                (hashtag.growthRate || 0) > 20
                  ? 'text-green-500'
                  : (hashtag.growthRate || 0) < -10
                  ? 'text-red-500'
                  : 'text-gray-500'
              )}
            />
            <span
              className={cn(
                'text-sm font-medium',
                (hashtag.growthRate || 0) > 20
                  ? 'text-green-600'
                  : (hashtag.growthRate || 0) < -10
                  ? 'text-red-600'
                  : 'text-gray-600'
              )}
            >
              {(hashtag.growthRate || 0) > 0 ? '+' : ''}
              {(hashtag.growthRate || 0).toFixed(1)}%
            </span>
          </div>
          <Button variant="ghost" size="sm" className="group-hover:bg-accent">
            {t('card.analyze')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface TrendAnalysisCardProps {
  analysis: TrendAnalysis | null;
  loading: boolean;
  t: TFunction;
}

function TrendAnalysisCard({ analysis, loading, t }: TrendAnalysisCardProps) {
  if (loading) {
    return (
      <Card className="col-span-full">
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="col-span-full">
        <CardContent className="text-center py-12">
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t('analysis.selectHashtag')}</p>
        </CardContent>
      </Card>
    );
  }

  const predictionColor = {
    rising: 'text-green-600 bg-green-100',
    stable: 'text-yellow-600 bg-yellow-100',
    falling: 'text-red-600 bg-red-100',
  }[analysis.prediction];

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t('analysis.title', { hashtag: analysis.hashtag })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">{t('analysis.currentViews')}</p>
              <p className="text-2xl font-bold">
                {(analysis.currentViews / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">{t('analysis.growthRate')}</p>
              <p className="text-2xl font-bold text-green-600">
                +{analysis.growthRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">{t('analysis.prediction')}</p>
              <Badge className={predictionColor || ''}>
                {t(`analysis.predictions.${analysis.prediction}`)}
              </Badge>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="md:col-span-2">
            <div className="h-48 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-purple-500 mx-auto mb-2" />
                <p className="font-medium">{t('analysis.chartTitle')}</p>
                <p className="text-sm text-muted-foreground">{t('analysis.chartPeak', { date: new Date(analysis.peakTime || '').toLocaleDateString() })}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Videos */}
        <div className="mt-6">
          <h4 className="font-semibold mb-3">{t('analysis.topVideos')}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {analysis.relatedVideos.slice(0, 4).map((video) => (
              <div key={video.id} className="aspect-[9/16] rounded-lg overflow-hidden bg-muted">
                <img
                  src={video.video.cover}
                  alt={video.title}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Trending() {
  const { t } = useTranslation('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHashtag, setSelectedHashtag] = useState('');
  const [timeRange, setTimeRange] = useState('24h');

  const { hashtags, loading } = useTrendingHashtags('US', 50);
  const { analysis, loading: analysisLoading, analyze } = useTrendAnalysis(selectedHashtag);

  const filteredHashtags = hashtags.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      searchQuery === ''
  );

  const handleAnalyze = async (hashtag: string) => {
    setSelectedHashtag(hashtag);
    await analyze();
  };

  const timeRangeOptions = getTimeRangeOptions(t);

  return (
    <DevAccessGate>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-7 w-7 text-orange-500" />
            {t('title')}
          </h1>
          <p className="text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          {timeRangeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.id}
                variant={timeRange === option.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(option.id)}
                className={timeRange === option.id ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
              >
                <Icon className="h-3 w-3 mr-1" />
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('searchPlaceholder')}
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="cursor-pointer hover:bg-accent">
          {t('filters.all')}
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-accent">
          {t('filters.entertainment')}
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-accent">
          {t('filters.education')}
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-accent">
          {t('filters.lifestyle')}
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-accent">
          {t('filters.business')}
        </Badge>
      </div>

      {/* Content */}
      <Tabs defaultValue="trending" className="w-full">
        <TabsList>
          <TabsTrigger value="trending">{t('tabs.trending')}</TabsTrigger>
          <TabsTrigger value="rising">{t('tabs.rising')}</TabsTrigger>
          <TabsTrigger value="analysis">{t('tabs.analysis')}</TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-6 w-24 rounded bg-muted mb-3" />
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="h-8 w-16 rounded bg-muted" />
                      <div className="h-8 w-16 rounded bg-muted" />
                    </div>
                    <div className="h-8 w-full rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredHashtags.map((hashtag) => (
                <TrendingHashtagCard
                  key={hashtag.id}
                  hashtag={hashtag}
                  onAnalyze={handleAnalyze}
                  t={t}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rising" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredHashtags
              .filter((h) => (h.growthRate || 0) > 30)
              .map((hashtag) => (
                <TrendingHashtagCard
                  key={hashtag.id}
                  hashtag={hashtag}
                  onAnalyze={handleAnalyze}
                  t={t}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <TrendAnalysisCard analysis={analysis} loading={analysisLoading} t={t} />
        </TabsContent>
      </Tabs>
      </div>
    </DevAccessGate>
  );
}
