import { useEffect, useState } from 'react';
import { TrendingUp, Video, Hash, Zap, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { DashboardStats as DashboardStatsType } from '@/types';

interface DashboardStatsProps {
  stats: DashboardStatsType | null;
  loading?: boolean;
}

const statCards = [
  {
    id: 'videos',
    title: 'Videos Analyzed',
    icon: Video,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    prefix: '',
    suffix: '',
  },
  {
    id: 'hashtags',
    title: 'Trending Hashtags',
    icon: Hash,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-500/10',
    prefix: '',
    suffix: '',
  },
  {
    id: 'opportunities',
    title: 'Viral Opportunities',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-yellow-500/10',
    prefix: '',
    suffix: '',
  },
  {
    id: 'engagement',
    title: 'Avg Engagement',
    icon: Target,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-500/10',
    prefix: '',
    suffix: '%',
  },
];

export function DashboardStats({ stats, loading }: DashboardStatsProps) {
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!stats) return;

    // Animate numbers
    const targets: Record<string, number> = {
      videos: stats.totalVideosAnalyzed,
      hashtags: stats.trendingHashtags,
      opportunities: stats.viralOpportunities,
      engagement: stats.engagementRate,
    };

    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const newValues: Record<string, number> = {};
      Object.entries(targets).forEach(([key, target]) => {
        newValues[key] = Math.round(target * easeProgress);
      });

      setAnimatedValues(newValues);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
    };

    requestAnimationFrame(animate);
  }, [stats]);

  if (loading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-24 rounded bg-muted animate-pulse" />
              <div className="h-4 w-32 rounded bg-muted animate-pulse mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: '1s',
              }}
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  background: ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'][Math.floor(Math.random() * 5)],
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = animatedValues[card.id] ?? 0;
          const targetValue = stats[card.id as keyof DashboardStatsType] as number;

          return (
            <Card key={card.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className={cn(
                  'p-2 rounded-lg transition-transform duration-300 group-hover:scale-110',
                  card.bgColor
                )}>
                  <Icon className={cn('h-4 w-4', card.color.replace('from-', 'text-').split(' ')[0])} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {card.prefix}
                  {value.toLocaleString()}
                  {card.suffix}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {card.id === 'engagement' && stats.weeklyGrowth > 0 && (
                    <Badge variant="secondary" className="text-green-600 bg-green-100">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{stats.weeklyGrowth}%
                    </Badge>
                  )}
                  {card.id === 'opportunities' && (
                    <Badge variant="secondary" className="text-purple-600 bg-purple-100">
                      New: {Math.floor(stats.viralOpportunities * 0.3)}
                    </Badge>
                  )}
                </div>
              </CardContent>

              {/* Progress Bar */}
              <div className="px-6 pb-4">
                <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn('h-full rounded-full bg-gradient-to-r', card.color)}
                    style={{
                      width: `${Math.min((value / (targetValue || 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Top Niche Banner */}
      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Top Performing Niche</p>
            <p className="text-xl font-bold">{stats.topPerformingNiche}</p>
          </div>
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            +{stats.weeklyGrowth}% this week
          </Badge>
        </div>
      </div>
    </div>
  );
}
