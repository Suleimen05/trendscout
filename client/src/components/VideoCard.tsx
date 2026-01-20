import { useState } from 'react';
import { Play, Heart, MessageCircle, Share2, Eye, Bookmark, Sparkles, TrendingUp, Music } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { TikTokVideo } from '@/types';

interface VideoCardProps {
  video: TikTokVideo;
  onGenerateScript?: (video: TikTokVideo) => void;
  onSave?: (video: TikTokVideo) => void;
  showStats?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function VideoCard({
  video,
  onGenerateScript,
  onSave,
  showStats = true,
  size = 'medium',
}: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const engagementRate = video.engagementRate || 0;
  const viralScore = video.viralScore || 0;

  const sizeClasses = {
    small: 'w-48',
    medium: 'w-64',
    large: 'w-80',
  };

  return (
    <>
      <Card
        className={cn(
          'group relative overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer',
          sizeClasses[size]
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowDetails(true)}
      >
        {/* Thumbnail */}
        <div className="relative aspect-[9/16] overflow-hidden bg-muted">
          <img
            src={video.video.cover}
            alt={video.title}
            className={cn(
              'h-full w-full object-cover transition-transform duration-300',
              isHovered && 'scale-110'
            )}
          />

          {/* Overlay */}
          <div className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}>
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn(
                'w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transition-transform duration-300',
                isHovered ? 'scale-100' : 'scale-0'
              )}>
                <Play className="h-8 w-8 text-black fill-black ml-1" />
              </div>
            </div>

            {/* Duration */}
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {formatDuration(video.video.duration)}
            </div>

            {/* AI Generate Button */}
            {onGenerateScript && (
              <Button
                size="sm"
                className="absolute bottom-2 left-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerateScript(video);
                }}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                AI Script
              </Button>
            )}
          </div>

          {/* Viral Score Badge */}
          {viralScore > 70 && (
            <Badge className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
              <TrendingUp className="h-3 w-3 mr-1" />
              Viral
            </Badge>
          )}

          {/* Save Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
            onClick={(e) => {
              e.stopPropagation();
              setIsSaved(!isSaved);
              onSave?.(video);
            }}
          >
            <Bookmark className={cn('h-4 w-4', isSaved && 'fill-white')} />
          </Button>
        </div>

        {/* Content */}
        <CardContent className="p-3 space-y-2">
          {/* Author */}
          <div className="flex items-center gap-2">
            <img
              src={video.author.avatar}
              alt={video.author.nickname}
              className="h-6 w-6 rounded-full object-cover"
            />
            <span className="text-sm font-medium truncate">{video.author.nickname}</span>
            {video.author.verified && (
              <Badge variant="secondary" className="h-4 w-4 p-0 flex items-center justify-center bg-blue-500 text-white">
                ✓
              </Badge>
            )}
          </div>

          {/* Title */}
          <p className="text-sm line-clamp-2 text-muted-foreground">
            {video.title}
          </p>

          {/* Hashtags */}
          {video.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {video.hashtags.slice(0, 3).map((hashtag) => (
                <Badge key={hashtag.id} variant="outline" className="text-xs">
                  #{hashtag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats */}
          {showStats && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {formatNumber(video.stats.playCount)}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {formatNumber(video.stats.diggCount)}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {formatNumber(video.stats.commentCount)}
                </span>
                <span className="flex items-center gap-1">
                  <Share2 className="h-3 w-3" />
                  {formatNumber(video.stats.shareCount)}
                </span>
              </div>
              {engagementRate > 5 && (
                <Badge variant="secondary" className="text-xs">
                  {engagementRate.toFixed(1)}%
                </Badge>
              )}
            </div>
          )}

          {/* Viral Score Bar */}
          {viralScore > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Viral Score</span>
                <span className="text-xs font-medium">{viralScore.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    viralScore > 80 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                    viralScore > 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    'bg-gradient-to-r from-gray-400 to-gray-500'
                  )}
                  style={{ width: `${viralScore}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Video Analysis</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 md:grid-cols-2">
            {/* Video Preview */}
            <div className="space-y-4">
              <div className="aspect-[9/16] max-h-[600px] rounded-lg overflow-hidden bg-muted">
                <img
                  src={video.video.cover}
                  alt={video.title}
                  className="h-full w-full object-cover"
                />
              </div>
              
              {onGenerateScript && (
                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={() => {
                    onGenerateScript(video);
                    setShowDetails(false);
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate AI Script
                </Button>
              )}
            </div>

            {/* Video Info */}
            <div className="space-y-4">
              {/* Author */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                <img
                  src={video.author.avatar}
                  alt={video.author.nickname}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{video.author.nickname}</span>
                    {video.author.verified && (
                      <Badge variant="secondary" className="bg-blue-500 text-white">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatNumber(video.author.followerCount)} followers
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{video.description}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-2xl font-bold text-purple-600">
                    {formatNumber(video.stats.playCount)}
                  </p>
                  <p className="text-sm text-muted-foreground">Views</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-2xl font-bold text-pink-600">
                    {formatNumber(video.stats.diggCount)}
                  </p>
                  <p className="text-sm text-muted-foreground">Likes</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-2xl font-bold text-blue-600">
                    {formatNumber(video.stats.commentCount)}
                  </p>
                  <p className="text-sm text-muted-foreground">Comments</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-2xl font-bold text-green-600">
                    {formatNumber(video.stats.shareCount)}
                  </p>
                  <p className="text-sm text-muted-foreground">Shares</p>
                </div>
              </div>

              {/* Engagement Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Engagement Rate</span>
                  <span className="text-2xl font-bold">{engagementRate.toFixed(1)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${Math.min(engagementRate * 10, 100)}%` }}
                  />
                </div>
              </div>

              {/* Viral Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Viral Score</span>
                  <span className="text-2xl font-bold">{viralScore.toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      viralScore > 80 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                      viralScore > 60 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                      'bg-gradient-to-r from-gray-400 to-gray-500'
                    )}
                    style={{ width: `${viralScore}%` }}
                  />
                </div>
              </div>

              {/* Hashtags */}
              {video.hashtags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Hashtags</h4>
                  <div className="flex flex-wrap gap-2">
                    {video.hashtags.map((hashtag) => (
                      <Badge
                        key={hashtag.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent"
                      >
                        #{hashtag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Music */}
              {video.music && (
                <div className="p-4 rounded-lg bg-muted">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Music className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{video.music.title}</p>
                      <p className="text-sm text-muted-foreground">{video.music.authorName}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
