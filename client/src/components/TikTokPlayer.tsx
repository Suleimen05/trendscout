/**
 * Modern TikTok Video Player with immersive fullscreen experience
 * Dark theme, glassmorphism effects, smooth animations
 */
import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Maximize,
  Minimize,
  X,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ChevronLeft,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TikTokPlayerProps {
  videoId: string;
  coverImage?: string;
  isOpen: boolean;
  onClose: () => void;
  videoInfo?: {
    author?: {
      nickname?: string;
      uniqueId?: string;
      avatar?: string;
    };
    desc?: string;
    stats?: {
      diggCount?: number;
      commentCount?: number;
      shareCount?: number;
    };
  };
}

export function TikTokPlayer({
  videoId,
  isOpen,
  onClose,
  videoInfo
}: TikTokPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | undefined>(undefined);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          exitFullscreen();
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, isFullscreen, onClose]);

  // Auto-hide controls
  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Toggle fullscreen
  const enterFullscreen = async () => {
    if (containerRef.current) {
      try {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        }
        setIsFullscreen(true);
      } catch (error) {
        console.log('Fullscreen not supported');
      }
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    } catch (error) {
      console.log('Exit fullscreen failed');
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  // Copy link
  const copyLink = async () => {
    const url = `https://www.tiktok.com/@${videoInfo?.author?.uniqueId}/video/${videoId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied!');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  // Format numbers
  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />

      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20" />
      </div>

      {/* Main Container */}
      <div
        ref={containerRef}
        className={cn(
          "relative flex bg-black/50 backdrop-blur-md overflow-hidden transition-all duration-500",
          isFullscreen
            ? "w-screen h-screen"
            : "w-full max-w-6xl h-[90vh] mx-4 rounded-2xl border border-white/10 shadow-2xl"
        )}
        onMouseMove={showControlsTemporarily}
      >
        {/* Left: Video Player */}
        <div className="flex-1 relative flex items-center justify-center bg-black">
          {/* Video Frame */}
          <div className="relative h-full aspect-[9/16] max-h-full">
            <iframe
              src={`https://www.tiktok.com/embed/v2/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}`}
              className="w-full h-full"
              style={{ border: 'none' }}
              allow="autoplay; encrypted-media"
            />
          </div>

          {/* Top Bar Controls */}
          <div
            className={cn(
              "absolute top-0 left-0 right-0 p-4 flex items-center justify-between transition-all duration-300 bg-gradient-to-b from-black/80 to-transparent",
              showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            )}
          >
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={onClose}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <span className="text-white font-medium">Video Preview</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={copyLink}
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={onClose}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </div>

          {/* Bottom Progress Bar (Visual only) */}
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 h-1 bg-white/20 transition-opacity duration-300",
              showControls ? "opacity-100" : "opacity-0"
            )}
          >
            <div className="h-full w-1/3 bg-gradient-to-r from-pink-500 to-purple-500" />
          </div>

          {/* Play/Pause Overlay */}
          {!isPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/60 cursor-pointer"
              onClick={() => setIsPlaying(true)}
            >
              <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                <Play className="h-10 w-10 text-black fill-black ml-1" />
              </div>
            </div>
          )}
        </div>

        {/* Right: Video Info & Actions */}
        <div
          className={cn(
            "w-80 bg-black/80 backdrop-blur-xl border-l border-white/10 flex flex-col transition-all duration-300",
            isFullscreen ? "hidden" : "flex"
          )}
        >
          {/* Author Info */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 p-[2px]">
                <img
                  src={videoInfo?.author?.avatar || '/placeholder-avatar.svg'}
                  alt={videoInfo?.author?.nickname}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold truncate">
                  {videoInfo?.author?.nickname || 'Unknown'}
                </h3>
                <p className="text-white/60 text-sm truncate">
                  @{videoInfo?.author?.uniqueId || 'user'}
                </p>
              </div>
              <Button
                size="sm"
                className="bg-white text-black hover:bg-white/90 rounded-full px-4"
              >
                Follow
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 flex-1 overflow-y-auto">
            <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">
              {videoInfo?.desc || 'No description'}
            </p>

            {/* Hashtags */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary" className="bg-white/10 text-white/80 hover:bg-white/20">
                #trending
              </Badge>
              <Badge variant="secondary" className="bg-white/10 text-white/80 hover:bg-white/20">
                #viral
              </Badge>
              <Badge variant="secondary" className="bg-white/10 text-white/80 hover:bg-white/20">
                #fyp
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center justify-around">
              <button
                className="flex flex-col items-center gap-1 group"
                onClick={() => setIsLiked(!isLiked)}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                  isLiked ? "bg-red-500/20 text-red-500" : "bg-white/10 text-white group-hover:bg-white/20"
                )}>
                  <Heart className={cn("h-6 w-6", isLiked && "fill-current")} />
                </div>
                <span className="text-white/60 text-xs">{formatNumber(videoInfo?.stats?.diggCount)}</span>
              </button>

              <button className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white/20 transition-all">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <span className="text-white/60 text-xs">{formatNumber(videoInfo?.stats?.commentCount)}</span>
              </button>

              <button className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white/20 transition-all">
                  <Share2 className="h-6 w-6" />
                </div>
                <span className="text-white/60 text-xs">{formatNumber(videoInfo?.stats?.shareCount)}</span>
              </button>

              <button
                className="flex flex-col items-center gap-1 group"
                onClick={() => setIsSaved(!isSaved)}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                  isSaved ? "bg-yellow-500/20 text-yellow-500" : "bg-white/10 text-white group-hover:bg-white/20"
                )}>
                  <Bookmark className={cn("h-6 w-6", isSaved && "fill-current")} />
                </div>
                <span className="text-white/60 text-xs">Save</span>
              </button>
            </div>
          </div>

          {/* Open in TikTok */}
          <div className="p-4 border-t border-white/10">
            <Button
              variant="outline"
              className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 rounded-full"
              onClick={() => window.open(`https://www.tiktok.com/@${videoInfo?.author?.uniqueId}/video/${videoId}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in TikTok
            </Button>
          </div>
        </div>

        {/* Mobile Actions (shown only on small screens) */}
        <div
          className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 md:hidden",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          <button
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md",
              isLiked ? "bg-red-500/80 text-white" : "bg-black/50 text-white"
            )}
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={cn("h-6 w-6", isLiked && "fill-current")} />
          </button>
          <button className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center text-white backdrop-blur-md">
            <MessageCircle className="h-6 w-6" />
          </button>
          <button className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center text-white backdrop-blur-md">
            <Share2 className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Keyboard hints */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs flex items-center gap-4">
        <span>ESC to close</span>
        <span>•</span>
        <span>Space to play/pause</span>
        <span>•</span>
        <span>F for fullscreen</span>
      </div>
    </div>
  );
}
